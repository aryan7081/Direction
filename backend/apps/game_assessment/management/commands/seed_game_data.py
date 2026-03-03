"""
Seeds GameCareerTraitWeight entries for existing careers.
Maps each career to the 8-trait model.
"""

from django.core.management.base import BaseCommand

from apps.careers.models import Career
from apps.game_assessment.models import GameCareerTraitWeight, TRAIT_SLUGS

# (career_slug → {trait: weight})
# Weights 0-1 indicate how important each trait is for the career.
CAREER_TRAIT_MAP = {
    "software-engineer": {
        "analytical_reasoning": 0.9,
        "quantitative_comfort": 0.7,
        "creativity_innovation": 0.8,
        "verbal_communication": 0.4,
        "social_orientation": 0.3,
        "leadership_drive": 0.4,
        "risk_appetite": 0.6,
        "structure_discipline": 0.6,
    },
    "data-scientist": {
        "analytical_reasoning": 0.9,
        "quantitative_comfort": 0.9,
        "creativity_innovation": 0.5,
        "verbal_communication": 0.4,
        "social_orientation": 0.2,
        "leadership_drive": 0.3,
        "risk_appetite": 0.4,
        "structure_discipline": 0.7,
    },
    "doctor": {
        "analytical_reasoning": 0.8,
        "quantitative_comfort": 0.6,
        "creativity_innovation": 0.3,
        "verbal_communication": 0.6,
        "social_orientation": 0.8,
        "leadership_drive": 0.5,
        "risk_appetite": 0.3,
        "structure_discipline": 0.9,
    },
    "chartered-accountant": {
        "analytical_reasoning": 0.7,
        "quantitative_comfort": 0.9,
        "creativity_innovation": 0.2,
        "verbal_communication": 0.4,
        "social_orientation": 0.3,
        "leadership_drive": 0.4,
        "risk_appetite": 0.3,
        "structure_discipline": 0.9,
    },
    "graphic-designer": {
        "analytical_reasoning": 0.3,
        "quantitative_comfort": 0.2,
        "creativity_innovation": 0.9,
        "verbal_communication": 0.5,
        "social_orientation": 0.4,
        "leadership_drive": 0.3,
        "risk_appetite": 0.5,
        "structure_discipline": 0.4,
    },
    "writer": {
        "analytical_reasoning": 0.5,
        "quantitative_comfort": 0.2,
        "creativity_innovation": 0.7,
        "verbal_communication": 0.9,
        "social_orientation": 0.5,
        "leadership_drive": 0.3,
        "risk_appetite": 0.5,
        "structure_discipline": 0.5,
    },
    "marketing-manager": {
        "analytical_reasoning": 0.6,
        "quantitative_comfort": 0.5,
        "creativity_innovation": 0.8,
        "verbal_communication": 0.8,
        "social_orientation": 0.7,
        "leadership_drive": 0.8,
        "risk_appetite": 0.6,
        "structure_discipline": 0.5,
    },
    "business-analyst": {
        "analytical_reasoning": 0.8,
        "quantitative_comfort": 0.7,
        "creativity_innovation": 0.4,
        "verbal_communication": 0.6,
        "social_orientation": 0.4,
        "leadership_drive": 0.5,
        "risk_appetite": 0.4,
        "structure_discipline": 0.7,
    },
    "mechanical-engineer": {
        "analytical_reasoning": 0.8,
        "quantitative_comfort": 0.8,
        "creativity_innovation": 0.5,
        "verbal_communication": 0.3,
        "social_orientation": 0.3,
        "leadership_drive": 0.4,
        "risk_appetite": 0.4,
        "structure_discipline": 0.8,
    },
    "accountant": {
        "analytical_reasoning": 0.6,
        "quantitative_comfort": 0.9,
        "creativity_innovation": 0.1,
        "verbal_communication": 0.3,
        "social_orientation": 0.3,
        "leadership_drive": 0.3,
        "risk_appetite": 0.2,
        "structure_discipline": 0.9,
    },
    "teacher": {
        "analytical_reasoning": 0.5,
        "quantitative_comfort": 0.4,
        "creativity_innovation": 0.6,
        "verbal_communication": 0.8,
        "social_orientation": 0.9,
        "leadership_drive": 0.6,
        "risk_appetite": 0.2,
        "structure_discipline": 0.7,
    },
    "psychologist": {
        "analytical_reasoning": 0.7,
        "quantitative_comfort": 0.3,
        "creativity_innovation": 0.5,
        "verbal_communication": 0.8,
        "social_orientation": 0.9,
        "leadership_drive": 0.4,
        "risk_appetite": 0.3,
        "structure_discipline": 0.6,
    },
    "architect": {
        "analytical_reasoning": 0.7,
        "quantitative_comfort": 0.6,
        "creativity_innovation": 0.9,
        "verbal_communication": 0.4,
        "social_orientation": 0.3,
        "leadership_drive": 0.4,
        "risk_appetite": 0.4,
        "structure_discipline": 0.7,
    },
    "lawyer": {
        "analytical_reasoning": 0.8,
        "quantitative_comfort": 0.3,
        "creativity_innovation": 0.4,
        "verbal_communication": 0.9,
        "social_orientation": 0.6,
        "leadership_drive": 0.7,
        "risk_appetite": 0.5,
        "structure_discipline": 0.7,
    },
    "civil-engineer": {
        "analytical_reasoning": 0.8,
        "quantitative_comfort": 0.8,
        "creativity_innovation": 0.4,
        "verbal_communication": 0.3,
        "social_orientation": 0.3,
        "leadership_drive": 0.5,
        "risk_appetite": 0.4,
        "structure_discipline": 0.8,
    },
}


class Command(BaseCommand):
    help = "Seed GameCareerTraitWeight entries for existing careers"

    def handle(self, *args, **options):
        created = 0
        updated = 0
        skipped = 0

        for career_slug, traits in CAREER_TRAIT_MAP.items():
            try:
                career = Career.objects.get(slug=career_slug)
            except Career.DoesNotExist:
                self.stdout.write(
                    self.style.WARNING(f"Career '{career_slug}' not found, skipping")
                )
                skipped += 1
                continue

            for trait_name, weight in traits.items():
                obj, was_created = GameCareerTraitWeight.objects.update_or_create(
                    career=career,
                    trait_name=trait_name,
                    defaults={"weight": weight},
                )
                if was_created:
                    created += 1
                else:
                    updated += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Done: {created} created, {updated} updated, {skipped} careers skipped"
            )
        )
