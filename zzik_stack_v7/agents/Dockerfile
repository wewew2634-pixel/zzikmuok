# agents/Dockerfile
FROM python:3.11-slim
WORKDIR /srv
ENV PYTHONUNBUFFERED=1
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["python","workflow.py"]
