from datetime import date

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from exercises.models import Exercise

from .models import Workout, WorkoutExercise

User = get_user_model()


class WorkoutPermissionTests(APITestCase):
    def setUp(self):
        self.monitor = User.objects.create_user(
            username="monitor1", password="pass12345", role=User.Role.MONITOR
        )
        self.laura = User.objects.create_user(
            username="laura_t", password="pass12345", role=User.Role.CLIENT, monitor=self.monitor
        )
        self.marcos = User.objects.create_user(
            username="marcos_t", password="pass12345", role=User.Role.CLIENT, monitor=self.monitor
        )
        self.workout = Workout.objects.create(
            client=self.laura,
            monitor=self.monitor,
            title="Test workout",
            scheduled_date=date.today(),
            status=Workout.Status.PLANNED,
        )

    def test_me_requires_authentication(self):
        response = self.client.get("/api/me/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_and_me_flow_with_real_jwt(self):
        login = self.client.post(
            "/api/token/", {"username": "laura_t", "password": "pass12345"}, format="json"
        )
        self.assertEqual(login.status_code, status.HTTP_200_OK)

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['access']}")
        response = self.client.get("/api/me/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["username"], "laura_t")

    def test_client_sees_only_their_own_workouts(self):
        self.client.force_authenticate(user=self.laura)
        response = self.client.get("/api/my-workouts/")
        self.assertIn(self.workout.id, [w["id"] for w in response.data])

        self.client.force_authenticate(user=self.marcos)
        response = self.client.get("/api/my-workouts/")
        self.assertNotIn(self.workout.id, [w["id"] for w in response.data])

    def test_owner_and_monitor_can_view_workout_detail(self):
        self.client.force_authenticate(user=self.laura)
        response = self.client.get(f"/api/workouts/{self.workout.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.client.force_authenticate(user=self.monitor)
        response = self.client.get(f"/api/workouts/{self.workout.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_other_client_cannot_view_workout_detail(self):
        self.client.force_authenticate(user=self.marcos)
        response = self.client.get(f"/api/workouts/{self.workout.id}/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_only_owner_can_complete_workout(self):
        self.client.force_authenticate(user=self.marcos)
        response = self.client.post(f"/api/workouts/{self.workout.id}/complete/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.workout.refresh_from_db()
        self.assertEqual(self.workout.status, Workout.Status.PLANNED)

        self.client.force_authenticate(user=self.laura)
        response = self.client.post(f"/api/workouts/{self.workout.id}/complete/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.workout.refresh_from_db()
        self.assertEqual(self.workout.status, Workout.Status.DONE)


class MonitorEndpointTests(APITestCase):
    def setUp(self):
        self.monitor = User.objects.create_user(
            username="monitor1", password="pass12345", role=User.Role.MONITOR
        )
        self.laura = User.objects.create_user(
            username="laura_t", password="pass12345", role=User.Role.CLIENT, monitor=self.monitor
        )
        self.other_monitor = User.objects.create_user(
            username="monitor2", password="pass12345", role=User.Role.MONITOR
        )
        self.other_client = User.objects.create_user(
            username="other_client",
            password="pass12345",
            role=User.Role.CLIENT,
            monitor=self.other_monitor,
        )
        self.exercise = Exercise.objects.create(
            name="Press de banca", primary_muscles=["chest"], secondary_muscles=["triceps"]
        )

    def test_client_cannot_list_monitor_clients(self):
        self.client.force_authenticate(user=self.laura)
        response = self.client.get("/api/monitor/clients/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_monitor_sees_only_their_own_clients(self):
        self.client.force_authenticate(user=self.monitor)
        response = self.client.get("/api/monitor/clients/")
        usernames = [c["username"] for c in response.data]
        self.assertIn("laura_t", usernames)
        self.assertNotIn("other_client", usernames)

    def test_monitor_can_create_workout_for_own_client(self):
        self.client.force_authenticate(user=self.monitor)
        payload = {
            "client": self.laura.id,
            "title": "Empuje",
            "scheduled_date": str(date.today()),
            "status": "PLANNED",
            "exercises": [
                {
                    "exercise": self.exercise.id,
                    "order": 1,
                    "sets": 4,
                    "reps": 10,
                    "weight_kg": "40.00",
                    "rest_seconds": 90,
                    "note": "",
                }
            ],
        }
        response = self.client.post("/api/monitor/workouts/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        workout = Workout.objects.get(id=response.data["id"])
        self.assertEqual(workout.monitor, self.monitor)
        self.assertEqual(WorkoutExercise.objects.filter(workout=workout).count(), 1)

    def test_monitor_cannot_create_workout_for_other_monitors_client(self):
        self.client.force_authenticate(user=self.monitor)
        payload = {
            "client": self.other_client.id,
            "title": "Empuje",
            "scheduled_date": str(date.today()),
            "status": "PLANNED",
            "exercises": [],
        }
        response = self.client.post("/api/monitor/workouts/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_monitor_cannot_edit_other_monitors_workout(self):
        workout = Workout.objects.create(
            client=self.other_client,
            monitor=self.other_monitor,
            title="Original",
            scheduled_date=date.today(),
            status=Workout.Status.PLANNED,
        )
        self.client.force_authenticate(user=self.monitor)
        payload = {
            "client": self.other_client.id,
            "title": "Hackeado",
            "scheduled_date": str(date.today()),
            "status": "PLANNED",
            "exercises": [],
        }
        response = self.client.put(f"/api/monitor/workouts/{workout.id}/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
