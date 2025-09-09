# services.py
import json
from datetime import timedelta
from django.db import transaction
from django.utils import timezone
from diet_plans.models import ToDoList, GenerateMeal

def save_30_day_plan_for_user(*, user, plan_dict: dict, meal_type: str = 'Regular', start_date=None):
    """
    plan_dict: the big dict you pasted, keys like 'Day 1'..'Day 30'
    start_date: optional date object; if None, GenerateMeal will default to tomorrow
    """
    # persist the original plan for auditing/export
    gen = GenerateMeal(
        user=user,
        meal_type=meal_type,
        start_date=start_date,           # may be None; model fills in
        ai_generated_data=json.dumps(plan_dict, ensure_ascii=False),
    )

    with transaction.atomic():
        gen.save()  # start_date/end_date ensured by model.save()

        rows = []
        base = gen.start_date
        for day_label, meals in plan_dict.items():            # 'Day 1' -> {...}
            try:
                day_num = int(day_label.split()[1])
            except (IndexError, ValueError):
                # skip/raise if key is malformed
                continue
            date_of_meal = base + timedelta(days=day_num - 1)

            # meals: {'Breakfast': [...], 'Lunch': [...], 'Dinner': [...], 'Snacks': [...]}
            for meal_time, items in meals.items():
                # items is a list of strings; store as JSON in `meal`
                rows.append(
                    ToDoList(
                        user=user,
                        meal=json.dumps(items, ensure_ascii=False),
                        day=day_num,
                        meal_time=meal_time,
                        date_of_meal=date_of_meal,
                        is_completed=False,
                    )
                )

        # Fast insert; ignore duplicates if you re-run for same window
        ToDoList.objects.bulk_create(rows, ignore_conflicts=True, batch_size=500)

    return gen  # has id, start_date, end_date
