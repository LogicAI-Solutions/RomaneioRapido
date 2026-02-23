FROM python:3.14-slim

WORKDIR /app

COPY /backend/requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ ./backend/

ENV TESTING=1
RUN python -m pytest backend/tests/test_routes.py -v
ENV TESTING=0

CMD ["uvicorn", "backend.server:app", "--host", "0.0.0.0", "--port", "8002", "--reload"]
