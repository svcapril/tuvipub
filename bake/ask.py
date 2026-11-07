#!/usr/bin/env python3
"""Gọi 9router (SSE) -> trả text luận giải. Dùng cho bake."""
import json, sys, urllib.request, urllib.error

API = "http://127.0.0.1:20128/v1/chat/completions"
import os
KEY = os.environ.get("HERMES_CUSTOM_9ROUTER_PRIVATE_KKING_STUDIO_API_KEY", "")

def ask(prompt, max_tokens=3200, temperature=0.5, retries=2):
    body = json.dumps({
        "model": "uncensored",
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": max_tokens,
        "temperature": temperature,
        "stream": True,
    }).encode()
    last_err = None
    for attempt in range(retries + 1):
        try:
            req = urllib.request.Request(API, data=body, headers={
                "Authorization": "Bearer " + KEY,
                "Content-Type": "application/json",
                "Accept": "text/event-stream",
            })
            parts = []
            with urllib.request.urlopen(req, timeout=180) as r:
                for raw in r:
                    line = raw.decode("utf-8", "ignore").strip()
                    if not line.startswith("data:"):
                        continue
                    payload = line[5:].strip()
                    if payload == "[DONE]":
                        break
                    try:
                        obj = json.loads(payload)
                    except Exception:
                        continue
                    ch = (obj.get("choices") or [{}])[0]
                    delta = ch.get("message") or {}
                    # non-stream final may come as message.content
                    if delta.get("content"):
                        parts.append(delta["content"])
                    d2 = ch.get("delta") or {}
                    if d2.get("content"):
                        parts.append(d2["content"])
            text = "".join(parts).strip()
            if text:
                return text
            last_err = "empty"
        except Exception as e:
            last_err = str(e)
    raise RuntimeError("ask failed: " + str(last_err))

if __name__ == "__main__":
    print(ask(sys.argv[1] if len(sys.argv) > 1 else "Chào. 1 câu thôi."))
