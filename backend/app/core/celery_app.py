import os

from celery import Celery

CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/1")
CELERY_RESULT_BACKEND = os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/1")

celery_app = Celery(
    "smart_mall_tasks",
    broker=CELERY_BROKER_URL,
    backend=CELERY_RESULT_BACKEND,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_routes={
        "app.tasks.*": {"queue": "default"},
    },
)

# Example placeholder task
@celery_app.task
def generate_report_task(report_type: str, user_email: str):
    # TODO: Implement real report generation in Phase 5
    print(f"Generating {report_type} report for {user_email}")
    return {"status": "success", "message": f"{report_type} report generated."}
