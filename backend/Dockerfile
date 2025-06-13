# backend/Dockerfile

FROM python:3.11-slim

# Set work directory
WORKDIR /app

# Copy only the necessary files
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["python", "main.py"]
