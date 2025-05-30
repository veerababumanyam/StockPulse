FROM python:3.11-slim

WORKDIR /app

# Copy the main requirements file from the context (a2a-agents/)
COPY requirements.txt .

# Upgrade pip and then install requirements
RUN pip install --upgrade pip && \
    pip install --no-cache-dir --default-timeout=100 --verbose -r requirements.txt

# Copy shared code first (this makes it available as a Python module)
COPY shared /app/shared

# Copy agent-specific code
COPY registry/server.py .

# Set Python path to include /app so shared modules can be imported
ENV PYTHONPATH=/app:$PYTHONPATH

EXPOSE 9000

# Optional: Add a healthcheck if your server.py supports a /health endpoint
# HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
#    CMD curl -f http://localhost:9000/health || exit 1

CMD ["python", "server.py"]
