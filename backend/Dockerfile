# Backend Dockerfile - Cab Booking Elite Platinum
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Expose port
EXPOSE 8000

# Start with uvicorn, binding to the PORT environment variable provided by Render
CMD sh -c "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"
