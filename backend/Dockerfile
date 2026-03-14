FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt \
	&& pip install gunicorn

COPY . .

EXPOSE 8000

# Use Gunicorn for production, adjust wsgi path if needed
CMD ["gunicorn", "core.wsgi:application", "--bind", "0.0.0.0:8000"]
