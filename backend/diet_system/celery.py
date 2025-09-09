# celery.py (in your project root, same level as settings.py)
import os
from celery import Celery
from django.conf import settings

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'diet_system.settings')

app = Celery('diet_system')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django apps.
app.autodiscover_tasks()

# Celery configuration
app.conf.update(
    # Broker settings
    broker_connection_retry_on_startup=True,

    # Task settings
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,

    # Worker settings
    worker_prefetch_multiplier=1,  # Important for long-running tasks
    task_acks_late=True,
    worker_max_tasks_per_child=1000,

    # Task result settings
    result_backend_transport_options={
        'master_name': 'mymaster',
    },

    # Task time limits (in seconds)
    task_time_limit=900,  # 15 minutes hard limit
    task_soft_time_limit=840,  # 14 minutes soft limit

    # Task routing (optional)
    task_routes={
        'diet_plans.tasks.generate_diet_plan_async': {'queue': 'diet_plans'},
    },
)


@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')