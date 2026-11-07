FROM python:3.14.10-slim

WORKDIR /app

COPY pyproject.toml ./
RUN pip install --no-cache-dir uv==0.11.26 \
    && uv pip install --system --no-cache -r pyproject.toml

COPY . .

ENV API_COMMAND="uvicorn app.asgi:app --host 0.0.0.0 --port 8000"

CMD ["sh", "entrypoint.sh"]
