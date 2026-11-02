from django.urls import path

from .views import (
    CompleteWorkoutView,
    MonitorClientsView,
    MonitorWorkoutDetailView,
    MonitorWorkoutsView,
    MyWorkoutsView,
    WorkoutDetailView,
)

urlpatterns = [
    path("my-workouts/", MyWorkoutsView.as_view(), name="my-workouts"),
    path("workouts/<int:pk>/", WorkoutDetailView.as_view(), name="workout-detail"),
    path("workouts/<int:pk>/complete/", CompleteWorkoutView.as_view(), name="workout-complete"),
    path("monitor/clients/", MonitorClientsView.as_view(), name="monitor-clients"),
    path("monitor/workouts/", MonitorWorkoutsView.as_view(), name="monitor-workouts"),
    path(
        "monitor/workouts/<int:pk>/",
        MonitorWorkoutDetailView.as_view(),
        name="monitor-workout-detail",
    ),
]
