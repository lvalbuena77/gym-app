from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from exercises.models import Exercise
from users.models import User
from workouts.models import Workout, WorkoutExercise

DEMO_PASSWORD = "demo123"

# (name, primary_muscles, secondary_muscles, demo weight in kg or None for bodyweight)
EXERCISES = [
    ("Press de banca", ["chest"], ["triceps", "front_delts"], 60),
    ("Press militar", ["front_delts"], ["triceps", "traps"], 40),
    ("Fondos en paralelas", ["chest", "triceps"], ["front_delts"], None),
    ("Remo con barra", ["lats"], ["rear_delts", "biceps", "traps"], 50),
    ("Dominadas", ["lats"], ["biceps", "rear_delts"], None),
    ("Jalón al pecho", ["lats"], ["biceps"], 55),
    ("Peso muerto", ["hamstrings", "lower_back"], ["glutes", "traps", "forearms"], 80),
    ("Sentadilla", ["quads"], ["glutes", "hamstrings"], 70),
    ("Prensa de piernas", ["quads"], ["glutes"], 90),
    ("Zancadas", ["quads", "glutes"], ["hamstrings"], 20),
    ("Curl de bíceps", ["biceps"], ["forearms"], 14),
    ("Extensión de tríceps", ["triceps"], [], 20),
    ("Elevación de talones", ["calves"], [], 40),
    ("Plancha abdominal", ["abs"], ["obliques"], None),
    ("Elevaciones posteriores (pájaro)", ["rear_delts"], ["traps"], 8),
]

CLIENTS = [
    {"username": "laura", "first_name": "Laura", "last_name": "Gómez", "email": "laura@gym.demo"},
    {"username": "marcos", "first_name": "Marcos", "last_name": "Ruiz", "email": "marcos@gym.demo"},
    {"username": "sofia", "first_name": "Sofía", "last_name": "Díaz", "email": "sofia@gym.demo"},
]

# Days are expressed as an offset from "today" (run date) so the demo always
# shows one DONE, one PENDING and one PLANNED-for-today workout, regardless
# of which weekday seed_demo is run on.
WORKOUT_DAYS = [
    {
        "offset": -3,
        "title": "Empuje (pecho/hombro/tríceps)",
        "status": Workout.Status.DONE,
        "exercises": ["Press de banca", "Press militar", "Fondos en paralelas"],
    },
    {
        "offset": -1,
        "title": "Tracción (espalda/bíceps)",
        "status": Workout.Status.PENDING,
        "exercises": ["Remo con barra", "Dominadas", "Jalón al pecho"],
    },
    {
        "offset": 0,
        "title": "Pierna y espalda baja",
        "status": Workout.Status.PLANNED,
        "exercises": ["Peso muerto", "Sentadilla", "Zancadas"],
    },
    {
        "offset": 2,
        "title": "Brazos y hombro posterior",
        "status": Workout.Status.PLANNED,
        "exercises": ["Curl de bíceps", "Extensión de tríceps", "Elevaciones posteriores (pájaro)"],
    },
    {
        "offset": 4,
        "title": "Core y accesorios",
        "status": Workout.Status.PLANNED,
        "exercises": ["Plancha abdominal", "Elevación de talones", "Prensa de piernas"],
    },
]


class Command(BaseCommand):
    help = "Seeds demo data: 1 admin, 1 monitor, 3 clients, ~15 exercises and a week of workouts."

    def handle(self, *args, **options):
        admin = self._upsert_user(
            "admin", "admin@gym.demo", "Admin", "Demo", User.Role.ADMIN,
            "admin123", is_staff=True, is_superuser=True,
        )
        monitor = self._upsert_user(
            "julio", "julio@gym.demo", "Julio", "Serrano", User.Role.MONITOR, DEMO_PASSWORD,
        )

        clients = []
        for data in CLIENTS:
            client = self._upsert_user(
                data["username"], data["email"], data["first_name"], data["last_name"],
                User.Role.CLIENT, DEMO_PASSWORD,
            )
            client.monitor = monitor
            client.save()
            clients.append(client)

        exercises = {}
        for name, primary, secondary, _weight in EXERCISES:
            exercise, _ = Exercise.objects.update_or_create(
                name=name,
                defaults={"primary_muscles": primary, "secondary_muscles": secondary},
            )
            exercises[name] = exercise
        weights = {name: weight for name, _p, _s, weight in EXERCISES}

        # Re-seeding should not duplicate workouts for these demo clients.
        Workout.objects.filter(client__in=clients).delete()

        today = timezone.localdate()
        for client in clients:
            for day in WORKOUT_DAYS:
                workout = Workout.objects.create(
                    client=client,
                    monitor=monitor,
                    title=day["title"],
                    scheduled_date=today + timedelta(days=day["offset"]),
                    status=day["status"],
                )
                for order, exercise_name in enumerate(day["exercises"], start=1):
                    WorkoutExercise.objects.create(
                        workout=workout,
                        exercise=exercises[exercise_name],
                        order=order,
                        sets=4,
                        reps=10,
                        weight_kg=weights[exercise_name],
                        rest_seconds=90,
                        note="",
                    )

        self.stdout.write(self.style.SUCCESS(
            f"Seeded: 1 admin, 1 monitor, {len(clients)} clients, "
            f"{len(exercises)} exercises, {len(clients) * len(WORKOUT_DAYS)} workouts."
        ))

    def _upsert_user(self, username, email, first_name, last_name, role, password,
                      is_staff=False, is_superuser=False):
        user, _ = User.objects.update_or_create(
            username=username,
            defaults={
                "email": email,
                "first_name": first_name,
                "last_name": last_name,
                "role": role,
                "is_staff": is_staff,
                "is_superuser": is_superuser,
                "is_active": True,
            },
        )
        user.set_password(password)
        user.save()
        return user
