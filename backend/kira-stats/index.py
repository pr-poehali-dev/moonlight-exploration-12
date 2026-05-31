"""
КИРА — статистика системы: запросы, самостоятельность, рост обучения.
Возвращает данные для admin-панели и виджета прогресса на лендинге.
"""
import json
import os
import psycopg2


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def handler(event: dict, context) -> dict:
    cors = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors, "body": ""}

    schema = os.environ.get("MAIN_DB_SCHEMA", "public")

    try:
        conn = get_conn()
        cur = conn.cursor()

        cur.execute(f"""
            SELECT
                COUNT(*) as total_requests,
                COUNT(CASE WHEN is_self_resolved THEN 1 END) as self_resolved,
                COUNT(DISTINCT session_id) as unique_sessions,
                ROUND(AVG(rating)::numeric, 2) as avg_rating,
                COUNT(CASE WHEN model_used = 'openai/gpt-4o-mini' THEN 1 END) as api_calls
            FROM {schema}.kira_interactions
        """)
        row = cur.fetchone()
        total = row[0] or 0
        self_resolved = row[1] or 0
        sessions = row[2] or 0
        avg_rating = float(row[3]) if row[3] else 0.0
        api_calls = row[4] or 0

        autonomy_pct = round((self_resolved / total * 100), 1) if total > 0 else 0.0

        cur.execute(f"""
            SELECT task_type, COUNT(*) as cnt
            FROM {schema}.kira_interactions
            GROUP BY task_type
            ORDER BY cnt DESC
            LIMIT 8
        """)
        task_distribution = [{"type": r[0], "count": r[1]} for r in cur.fetchall()]

        cur.execute(f"""
            SELECT date_trunc('day', created_at)::date as day, COUNT(*) as cnt
            FROM {schema}.kira_interactions
            WHERE created_at >= NOW() - INTERVAL '7 days'
            GROUP BY day
            ORDER BY day
        """)
        daily_trend = [{"date": str(r[0]), "count": r[1]} for r in cur.fetchall()]

        cur.execute(f"SELECT COUNT(*) FROM {schema}.kira_knowledge")
        knowledge_count = cur.fetchone()[0] or 0

        cur.execute(f"SELECT COUNT(*) FROM {schema}.kira_users WHERE status = 'active'")
        active_users = cur.fetchone()[0] or 0

        cur.execute(f"SELECT COUNT(*) FROM {schema}.kira_access_requests WHERE status = 'pending'")
        pending_requests = cur.fetchone()[0] or 0

        conn.close()

        return {
            "statusCode": 200,
            "headers": cors,
            "body": json.dumps({
                "overview": {
                    "total_requests": total,
                    "self_resolved": self_resolved,
                    "api_calls": api_calls,
                    "unique_sessions": sessions,
                    "avg_rating": avg_rating,
                    "autonomy_pct": autonomy_pct,
                    "knowledge_count": knowledge_count,
                    "active_users": active_users,
                    "pending_requests": pending_requests,
                },
                "task_distribution": task_distribution,
                "daily_trend": daily_trend,
            }, ensure_ascii=False),
        }

    except Exception as e:
        return {
            "statusCode": 200,
            "headers": cors,
            "body": json.dumps({
                "overview": {
                    "total_requests": 0, "self_resolved": 0, "api_calls": 0,
                    "unique_sessions": 0, "avg_rating": 0.0, "autonomy_pct": 0.0,
                    "knowledge_count": 0, "active_users": 0, "pending_requests": 0,
                },
                "task_distribution": [],
                "daily_trend": [],
                "note": "База данных недоступна — отображаются нулевые значения"
            }, ensure_ascii=False),
        }
