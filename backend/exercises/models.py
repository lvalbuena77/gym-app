from django.db import models

# Muscle codes shared by primary/secondary muscle lists.
MUSCLE_CHOICES = [
    ("chest", "Pecho"),
    ("front_delts", "Deltoides anterior"),
    ("rear_delts", "Deltoides posterior"),
    ("triceps", "Tríceps"),
    ("biceps", "Bíceps"),
    ("traps", "Trapecio"),
    ("lats", "Dorsal ancho"),
    ("lower_back", "Lumbar"),
    ("abs", "Abdominales"),
    ("obliques", "Oblicuos"),
    ("quads", "Cuádriceps"),
    ("glutes", "Glúteos"),
    ("hamstrings", "Femorales"),
    ("calves", "Gemelos"),
    ("forearms", "Antebrazos"),
]


class Exercise(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    # Stored as a JSON list of muscle codes from MUSCLE_CHOICES, e.g. ["chest", "triceps"].
    primary_muscles = models.JSONField(default=list, blank=True)
    secondary_muscles = models.JSONField(default=list, blank=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name
