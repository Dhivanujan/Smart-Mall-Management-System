FROM python:3.12-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
	PYTHONUNBUFFERED=1 \
	PIP_NO_CACHE_DIR=off \
	PIP_DISABLE_PIP_VERSION_CHECK=on \
	PIP_DEFAULT_TIMEOUT=100

WORKDIR /app

# System dependencies (add build tools/db clients here later as needed)
RUN apt-get update \
	&& apt-get install -y --no-install-recommends build-essential \
	&& rm -rf /var/lib/apt/lists/*

RUN pip install --upgrade pip \
	&& pip install \
		fastapi==0.115.0 \
		"uvicorn[standard]"==0.30.0 \
		pydantic==2.8.0 \
		python-dotenv==1.0.1

COPY backend/app ./app

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

