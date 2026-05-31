"""
КИРА — основной чат-эндпоинт. Принимает запрос пользователя,
определяет тип задачи, вызывает OpenAI и сохраняет взаимодействие.
"""
import json
import os
import re
import time
import urllib.request
import urllib.error


TASK_PATTERNS = {
    "code": r"(код|программ|скрипт|функци|python|javascript|html|css|напиши код|сделай код)",
    "image": r"(изображен|картин|рисун|фото|сгенерир|нарисуй|покажи)",
    "music": r"(музык|трек|мелоди|песн|жанр|бит)",
    "study": r"(реферат|доклад|презентац|объясни|решить задач|предмет|учёб|учеб|школ|универ)",
    "search": r"(найди|поищи|что такое|кто такой|когда|где|источник)",
    "support": r"(сайт|хостинг|cms|ошибк|оптимизац|wordpress|nginx|домен)",
}

SYSTEM_PROMPT = """Ты — КИРА, самообучающийся голосовой ИИ-помощник. 
Ты умеешь: создавать тексты, код, объяснять сложные темы, помогать в учёбе, 
искать информацию, консультировать по сайтам и техподдержке.
Отвечай на русском языке. Будь дружелюбной, профессиональной, 
используй естественный разговорный стиль. Отвечай кратко и по делу.
Если задача требует генерации изображений или музыки — объясни, 
что в полной версии это доступно через специальные инструменты."""


def detect_task_type(text: str) -> str:
    text_lower = text.lower()
    for task, pattern in TASK_PATTERNS.items():
        if re.search(pattern, text_lower):
            return task
    return "chat"


def call_openai(messages: list, api_key: str) -> dict:
    url = "https://api.openai.com/v1/chat/completions"
    payload = json.dumps({
        "model": "gpt-4o-mini",
        "messages": messages,
        "max_tokens": 800,
        "temperature": 0.7,
    }).encode("utf-8")

    req = urllib.request.Request(
        url,
        data=payload,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=25) as resp:
        return json.loads(resp.read().decode("utf-8"))


def handler(event: dict, context) -> dict:
    cors = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Session-Id",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors, "body": ""}

    body = json.loads(event.get("body") or "{}")
    message = body.get("message", "").strip()
    history = body.get("history", [])  # [{role, content}, ...]
    session_id = event.get("headers", {}).get("x-session-id", "anonymous")

    if not message:
        return {
            "statusCode": 400,
            "headers": cors,
            "body": json.dumps({"error": "Сообщение не может быть пустым"}),
        }

    task_type = detect_task_type(message)

    api_key = os.environ.get("OPENAI_API_KEY", "")

    # Если нет ключа — отвечаем демо-режим
    if not api_key or api_key == "":
        demo_responses = {
            "code": "В демо-режиме генерация кода недоступна. Добавьте OpenAI API ключ для полного функционала КИРЫ.",
            "study": "В демо-режиме помощь в учёбе ограничена. Подключите API ключ — и я помогу с любым рефератом или задачей.",
            "image": "Генерация изображений доступна после подключения API ключа.",
            "music": "Создание музыки доступно после подключения API ключа.",
            "search": "Поиск в интернете доступен после подключения API ключа.",
            "support": "Техническая поддержка сайтов доступна после подключения API ключа.",
            "chat": "Привет! Я КИРА в демо-режиме. Для полноценной работы нужен OpenAI API ключ. Обратитесь к администратору.",
        }
        response_text = demo_responses.get(task_type, demo_responses["chat"])
        return {
            "statusCode": 200,
            "headers": cors,
            "body": json.dumps({
                "response": response_text,
                "task_type": task_type,
                "model_used": "demo",
                "is_self_resolved": False,
                "session_id": session_id,
            }, ensure_ascii=False),
        }

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    # Добавляем историю (последние 10 сообщений)
    for h in history[-10:]:
        if h.get("role") in ("user", "assistant") and h.get("content"):
            messages.append({"role": h["role"], "content": h["content"]})

    messages.append({"role": "user", "content": message})

    try:
        result = call_openai(messages, api_key)
        response_text = result["choices"][0]["message"]["content"]
        tokens = result.get("usage", {}).get("total_tokens", 0)

        return {
            "statusCode": 200,
            "headers": cors,
            "body": json.dumps({
                "response": response_text,
                "task_type": task_type,
                "model_used": "openai/gpt-4o-mini",
                "tokens_used": tokens,
                "is_self_resolved": False,
                "session_id": session_id,
            }, ensure_ascii=False),
        }

    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8")
        return {
            "statusCode": 502,
            "headers": cors,
            "body": json.dumps({"error": f"OpenAI ошибка: {e.code}", "detail": err_body}, ensure_ascii=False),
        }
