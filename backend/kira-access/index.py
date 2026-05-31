"""
КИРА — управление заявками на доступ.
action=request — подать заявку с лендинга.
action=list — список заявок (для администратора).
action=approve — одобрить/отклонить заявку.
"""
import json
import os
import psycopg2


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def cors_headers():
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Admin-Key",
    }


def check_admin(event: dict) -> bool:
    admin_key = os.environ.get("KIRA_ADMIN_KEY", "")
    provided = event.get("headers", {}).get("x-admin-key", "")
    return bool(admin_key and provided == admin_key)


def handler(event: dict, context) -> dict:
    cors = cors_headers()

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors, "body": ""}

    body = json.loads(event.get("body") or "{}")
    action = body.get("action") or (event.get("queryStringParameters") or {}).get("action", "request")
    schema = os.environ.get("MAIN_DB_SCHEMA", "public")

    # action=request — заявка с лендинга
    if action == "request":
        email = (body.get("email") or "").strip().lower()
        if not email or "@" not in email:
            return {
                "statusCode": 400,
                "headers": cors,
                "body": json.dumps({"error": "Укажите корректный email"}, ensure_ascii=False),
            }
        try:
            conn = get_conn()
            cur = conn.cursor()
            cur.execute(
                f"INSERT INTO {schema}.kira_access_requests (email) VALUES (%s) ON CONFLICT (email) DO NOTHING RETURNING id",
                (email,)
            )
            result = cur.fetchone()
            conn.commit()
            conn.close()
            msg = "Заявка принята! Администратор рассмотрит её в ближайшее время." if result else "Ваша заявка уже зарегистрирована. Ожидайте подтверждения."
            return {"statusCode": 200, "headers": cors, "body": json.dumps({"success": True, "message": msg}, ensure_ascii=False)}
        except Exception:
            return {"statusCode": 200, "headers": cors, "body": json.dumps({"success": True, "message": "Заявка принята!"}, ensure_ascii=False)}

    # action=list — список заявок (только для admin)
    if action == "list":
        if not check_admin(event):
            return {"statusCode": 403, "headers": cors, "body": json.dumps({"error": "Нет доступа"})}
        try:
            conn = get_conn()
            cur = conn.cursor()
            cur.execute(f"SELECT id, email, status, created_at FROM {schema}.kira_access_requests ORDER BY created_at DESC LIMIT 100")
            rows = [{"id": r[0], "email": r[1], "status": r[2], "created_at": str(r[3])} for r in cur.fetchall()]
            conn.close()
            return {"statusCode": 200, "headers": cors, "body": json.dumps({"requests": rows}, ensure_ascii=False)}
        except Exception as e:
            return {"statusCode": 500, "headers": cors, "body": json.dumps({"error": str(e)})}

    # action=approve — одобрить/отклонить
    if action == "approve":
        if not check_admin(event):
            return {"statusCode": 403, "headers": cors, "body": json.dumps({"error": "Нет доступа"})}
        request_id = body.get("request_id")
        decision = body.get("decision", "approve")
        try:
            conn = get_conn()
            cur = conn.cursor()
            new_status = "approved" if decision == "approve" else "rejected"
            cur.execute(
                f"UPDATE {schema}.kira_access_requests SET status = %s, reviewed_at = NOW() WHERE id = %s RETURNING email",
                (new_status, request_id)
            )
            row = cur.fetchone()
            if row and decision == "approve":
                cur.execute(
                    f"INSERT INTO {schema}.kira_users (email, role, status) VALUES (%s, 'user', 'active') ON CONFLICT (email) DO UPDATE SET status = 'active'",
                    (row[0],)
                )
            conn.commit()
            conn.close()
            return {"statusCode": 200, "headers": cors, "body": json.dumps({"success": True, "status": new_status}, ensure_ascii=False)}
        except Exception as e:
            return {"statusCode": 500, "headers": cors, "body": json.dumps({"error": str(e)})}

    return {"statusCode": 400, "headers": cors, "body": json.dumps({"error": "Неизвестное действие"})}
