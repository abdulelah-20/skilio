# ── Backend Dockerfile ──────────────────────────────────────────────────────
FROM python:3.11-slim

WORKDIR /app

# Install system deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc default-libmysqlclient-dev pkg-config && \
    rm -rf /var/lib/apt/lists/*

# Install Python deps first (layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source
COPY . .

EXPOSE 8000

CMD ["sh", "-c", "python -m alembic upgrade head && python scripts/seed.py && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
