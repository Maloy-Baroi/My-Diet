# management/commands/test_celery.py
from django.core.management.base import BaseCommand
from celery import current_app
from diet_plans.tasks import generate_diet_plan_async


class Command(BaseCommand):
    help = 'Test Celery connection and task execution'

    def handle(self, *args, **options):
        # Test 1: Check if Celery is configured
        self.stdout.write("Testing Celery configuration...")
        try:
            inspect = current_app.control.inspect()
            stats = inspect.stats()
            if stats:
                self.stdout.write(self.style.SUCCESS(f"✓ Celery workers are running: {list(stats.keys())}"))
            else:
                self.stdout.write(self.style.ERROR("✗ No active Celery workers found"))
                return
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"✗ Celery connection error: {e}"))
            return

        # Test 2: Check active/scheduled tasks
        try:
            active = inspect.active()
            scheduled = inspect.scheduled()
            self.stdout.write(f"Active tasks: {len(active) if active else 0}")
            self.stdout.write(f"Scheduled tasks: {len(scheduled) if scheduled else 0}")
        except Exception as e:
            self.stdout.write(self.style.WARNING(f"Could not get task info: {e}"))

        # Test 3: Test task creation (don't actually run it)
        self.stdout.write("Testing task creation...")
        try:
            # Just test if we can create a task signature
            task_signature = generate_diet_plan_async.s(1, 'weight_loss', 'Regular')
            self.stdout.write(self.style.SUCCESS("✓ Task signature created successfully"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"✗ Error creating task signature: {e}"))
