"""
Seeds GameCareerTraitWeight entries for existing careers.
Maps each career to the 8-trait model.
8 traits: analytical_reasoning, quantitative_comfort, creativity_innovation,
verbal_communication, social_orientation, leadership_drive, risk_appetite, structure_discipline
"""

from django.core.management.base import BaseCommand

from apps.careers.models import Career
from apps.game_assessment.models import GameCareerTraitWeight, TRAIT_SLUGS

# (career_slug → {trait: weight})
# Weights 0-1 indicate how important each trait is for the career.
CAREER_TRAIT_MAP = {
    # 1. TECH & ENGINEERING
    "software-engineer": {"analytical_reasoning": 0.9, "quantitative_comfort": 0.7, "creativity_innovation": 0.8, "verbal_communication": 0.4, "social_orientation": 0.3, "leadership_drive": 0.4, "risk_appetite": 0.6, "structure_discipline": 0.6},
    "web-developer": {"analytical_reasoning": 0.8, "quantitative_comfort": 0.6, "creativity_innovation": 0.7, "verbal_communication": 0.4, "social_orientation": 0.3, "leadership_drive": 0.3, "risk_appetite": 0.5, "structure_discipline": 0.7},
    "ai-engineer": {"analytical_reasoning": 0.95, "quantitative_comfort": 0.9, "creativity_innovation": 0.6, "verbal_communication": 0.4, "social_orientation": 0.2, "leadership_drive": 0.4, "risk_appetite": 0.5, "structure_discipline": 0.8},
    "machine-learning-engineer": {"analytical_reasoning": 0.95, "quantitative_comfort": 0.9, "creativity_innovation": 0.5, "verbal_communication": 0.4, "social_orientation": 0.2, "leadership_drive": 0.3, "risk_appetite": 0.4, "structure_discipline": 0.8},
    "cybersecurity-analyst": {"analytical_reasoning": 0.9, "quantitative_comfort": 0.6, "creativity_innovation": 0.5, "verbal_communication": 0.5, "social_orientation": 0.3, "leadership_drive": 0.4, "risk_appetite": 0.5, "structure_discipline": 0.8},
    "cloud-devops-engineer": {"analytical_reasoning": 0.85, "quantitative_comfort": 0.65, "creativity_innovation": 0.5, "verbal_communication": 0.45, "social_orientation": 0.4, "leadership_drive": 0.45, "risk_appetite": 0.45, "structure_discipline": 0.92},
    "game-developer": {"analytical_reasoning": 0.7, "quantitative_comfort": 0.6, "creativity_innovation": 0.9, "verbal_communication": 0.4, "social_orientation": 0.4, "leadership_drive": 0.4, "risk_appetite": 0.6, "structure_discipline": 0.7},
    "blockchain-developer": {"analytical_reasoning": 0.9, "quantitative_comfort": 0.8, "creativity_innovation": 0.6, "verbal_communication": 0.4, "social_orientation": 0.2, "leadership_drive": 0.4, "risk_appetite": 0.7, "structure_discipline": 0.7},
    "database-administrator": {"analytical_reasoning": 0.9, "quantitative_comfort": 0.7, "creativity_innovation": 0.3, "verbal_communication": 0.4, "social_orientation": 0.3, "leadership_drive": 0.3, "risk_appetite": 0.3, "structure_discipline": 0.95},
    "network-engineer": {"analytical_reasoning": 0.85, "quantitative_comfort": 0.7, "creativity_innovation": 0.4, "verbal_communication": 0.4, "social_orientation": 0.3, "leadership_drive": 0.4, "risk_appetite": 0.4, "structure_discipline": 0.9},
    "robotics-engineer": {"analytical_reasoning": 0.9, "quantitative_comfort": 0.85, "creativity_innovation": 0.6, "verbal_communication": 0.4, "social_orientation": 0.2, "leadership_drive": 0.4, "risk_appetite": 0.5, "structure_discipline": 0.9},
    "electronics-hardware-engineer": {"analytical_reasoning": 0.9, "quantitative_comfort": 0.85, "creativity_innovation": 0.45, "verbal_communication": 0.3, "social_orientation": 0.2, "leadership_drive": 0.35, "risk_appetite": 0.4, "structure_discipline": 0.9},
    "data-scientist": {"analytical_reasoning": 0.9, "quantitative_comfort": 0.9, "creativity_innovation": 0.5, "verbal_communication": 0.4, "social_orientation": 0.2, "leadership_drive": 0.3, "risk_appetite": 0.4, "structure_discipline": 0.7},
    "data-engineer": {"analytical_reasoning": 0.85, "quantitative_comfort": 0.8, "creativity_innovation": 0.35, "verbal_communication": 0.4, "social_orientation": 0.3, "leadership_drive": 0.35, "risk_appetite": 0.35, "structure_discipline": 0.9},
    "mechanical-engineer": {"analytical_reasoning": 0.8, "quantitative_comfort": 0.8, "creativity_innovation": 0.5, "verbal_communication": 0.3, "social_orientation": 0.3, "leadership_drive": 0.4, "risk_appetite": 0.4, "structure_discipline": 0.8},
    "civil-engineer": {"analytical_reasoning": 0.8, "quantitative_comfort": 0.8, "creativity_innovation": 0.4, "verbal_communication": 0.3, "social_orientation": 0.3, "leadership_drive": 0.5, "risk_appetite": 0.4, "structure_discipline": 0.8},
    "aerospace-engineer": {"analytical_reasoning": 0.9, "quantitative_comfort": 0.9, "creativity_innovation": 0.5, "verbal_communication": 0.4, "social_orientation": 0.2, "leadership_drive": 0.4, "risk_appetite": 0.45, "structure_discipline": 0.9},
    "biomedical-engineer": {"analytical_reasoning": 0.85, "quantitative_comfort": 0.75, "creativity_innovation": 0.5, "verbal_communication": 0.5, "social_orientation": 0.5, "leadership_drive": 0.4, "risk_appetite": 0.4, "structure_discipline": 0.85},
    # 2. ARCHITECTURE & DESIGN
    "architect": {"analytical_reasoning": 0.7, "quantitative_comfort": 0.6, "creativity_innovation": 0.9, "verbal_communication": 0.4, "social_orientation": 0.3, "leadership_drive": 0.4, "risk_appetite": 0.4, "structure_discipline": 0.7},
    "interior-designer": {"analytical_reasoning": 0.5, "quantitative_comfort": 0.4, "creativity_innovation": 0.95, "verbal_communication": 0.5, "social_orientation": 0.5, "leadership_drive": 0.3, "risk_appetite": 0.5, "structure_discipline": 0.7},
    "landscape-architect": {"analytical_reasoning": 0.6, "quantitative_comfort": 0.5, "creativity_innovation": 0.9, "verbal_communication": 0.5, "social_orientation": 0.4, "leadership_drive": 0.4, "risk_appetite": 0.4, "structure_discipline": 0.7},
    "urban-planner": {"analytical_reasoning": 0.8, "quantitative_comfort": 0.6, "creativity_innovation": 0.6, "verbal_communication": 0.6, "social_orientation": 0.6, "leadership_drive": 0.5, "risk_appetite": 0.4, "structure_discipline": 0.9},
    "industrial-designer": {"analytical_reasoning": 0.7, "quantitative_comfort": 0.5, "creativity_innovation": 0.9, "verbal_communication": 0.5, "social_orientation": 0.4, "leadership_drive": 0.4, "risk_appetite": 0.5, "structure_discipline": 0.7},
    "product-designer": {"analytical_reasoning": 0.7, "quantitative_comfort": 0.5, "creativity_innovation": 0.9, "verbal_communication": 0.6, "social_orientation": 0.6, "leadership_drive": 0.5, "risk_appetite": 0.5, "structure_discipline": 0.7},
    # 3. MEDICAL, HEALTHCARE & BIOTECH
    "doctor": {"analytical_reasoning": 0.8, "quantitative_comfort": 0.6, "creativity_innovation": 0.3, "verbal_communication": 0.6, "social_orientation": 0.8, "leadership_drive": 0.5, "risk_appetite": 0.3, "structure_discipline": 0.9},
    "dentist": {"analytical_reasoning": 0.7, "quantitative_comfort": 0.5, "creativity_innovation": 0.4, "verbal_communication": 0.5, "social_orientation": 0.7, "leadership_drive": 0.4, "risk_appetite": 0.3, "structure_discipline": 0.9},
    "pharmacist": {"analytical_reasoning": 0.8, "quantitative_comfort": 0.7, "creativity_innovation": 0.2, "verbal_communication": 0.5, "social_orientation": 0.5, "leadership_drive": 0.3, "risk_appetite": 0.2, "structure_discipline": 0.95},
    "nurse": {"analytical_reasoning": 0.6, "quantitative_comfort": 0.5, "creativity_innovation": 0.3, "verbal_communication": 0.6, "social_orientation": 0.95, "leadership_drive": 0.5, "risk_appetite": 0.3, "structure_discipline": 0.9},
    "physiotherapist": {"analytical_reasoning": 0.6, "quantitative_comfort": 0.5, "creativity_innovation": 0.4, "verbal_communication": 0.6, "social_orientation": 0.85, "leadership_drive": 0.4, "risk_appetite": 0.3, "structure_discipline": 0.8},
    "psychologist": {"analytical_reasoning": 0.7, "quantitative_comfort": 0.3, "creativity_innovation": 0.5, "verbal_communication": 0.8, "social_orientation": 0.9, "leadership_drive": 0.4, "risk_appetite": 0.3, "structure_discipline": 0.6},
    "psychiatrist": {"analytical_reasoning": 0.8, "quantitative_comfort": 0.5, "creativity_innovation": 0.4, "verbal_communication": 0.7, "social_orientation": 0.85, "leadership_drive": 0.5, "risk_appetite": 0.3, "structure_discipline": 0.9},
    "nutritionist": {"analytical_reasoning": 0.6, "quantitative_comfort": 0.5, "creativity_innovation": 0.4, "verbal_communication": 0.7, "social_orientation": 0.8, "leadership_drive": 0.4, "risk_appetite": 0.2, "structure_discipline": 0.8},
    "radiologist": {"analytical_reasoning": 0.9, "quantitative_comfort": 0.7, "creativity_innovation": 0.3, "verbal_communication": 0.5, "social_orientation": 0.4, "leadership_drive": 0.4, "risk_appetite": 0.3, "structure_discipline": 0.9},
    "occupational-therapist": {"analytical_reasoning": 0.6, "quantitative_comfort": 0.4, "creativity_innovation": 0.5, "verbal_communication": 0.6, "social_orientation": 0.9, "leadership_drive": 0.4, "risk_appetite": 0.3, "structure_discipline": 0.8},
    "speech-therapist": {"analytical_reasoning": 0.6, "quantitative_comfort": 0.3, "creativity_innovation": 0.5, "verbal_communication": 0.9, "social_orientation": 0.9, "leadership_drive": 0.4, "risk_appetite": 0.3, "structure_discipline": 0.7},
    "biotechnologist": {"analytical_reasoning": 0.85, "quantitative_comfort": 0.75, "creativity_innovation": 0.45, "verbal_communication": 0.5, "social_orientation": 0.35, "leadership_drive": 0.4, "risk_appetite": 0.4, "structure_discipline": 0.85},
    "forensic-scientist": {"analytical_reasoning": 0.9, "quantitative_comfort": 0.7, "creativity_innovation": 0.35, "verbal_communication": 0.5, "social_orientation": 0.4, "leadership_drive": 0.35, "risk_appetite": 0.35, "structure_discipline": 0.9},
    # 4. COMMERCE & BUSINESS
    "accountant": {"analytical_reasoning": 0.6, "quantitative_comfort": 0.9, "creativity_innovation": 0.1, "verbal_communication": 0.3, "social_orientation": 0.3, "leadership_drive": 0.3, "risk_appetite": 0.2, "structure_discipline": 0.9},
    "chartered-accountant": {"analytical_reasoning": 0.7, "quantitative_comfort": 0.9, "creativity_innovation": 0.2, "verbal_communication": 0.4, "social_orientation": 0.3, "leadership_drive": 0.4, "risk_appetite": 0.3, "structure_discipline": 0.9},
    "business-analyst": {"analytical_reasoning": 0.8, "quantitative_comfort": 0.7, "creativity_innovation": 0.4, "verbal_communication": 0.6, "social_orientation": 0.4, "leadership_drive": 0.5, "risk_appetite": 0.4, "structure_discipline": 0.7},
    "marketing-manager": {"analytical_reasoning": 0.6, "quantitative_comfort": 0.5, "creativity_innovation": 0.8, "verbal_communication": 0.8, "social_orientation": 0.7, "leadership_drive": 0.8, "risk_appetite": 0.6, "structure_discipline": 0.5},
    "investment-banker": {"analytical_reasoning": 0.9, "quantitative_comfort": 0.95, "creativity_innovation": 0.4, "verbal_communication": 0.7, "social_orientation": 0.6, "leadership_drive": 0.7, "risk_appetite": 0.8, "structure_discipline": 0.8},
    "financial-analyst": {"analytical_reasoning": 0.95, "quantitative_comfort": 0.95, "creativity_innovation": 0.3, "verbal_communication": 0.5, "social_orientation": 0.3, "leadership_drive": 0.4, "risk_appetite": 0.5, "structure_discipline": 0.8},
    "stock-trader": {"analytical_reasoning": 0.9, "quantitative_comfort": 0.9, "creativity_innovation": 0.4, "verbal_communication": 0.4, "social_orientation": 0.3, "leadership_drive": 0.5, "risk_appetite": 0.9, "structure_discipline": 0.7},
    "economist": {"analytical_reasoning": 0.95, "quantitative_comfort": 0.9, "creativity_innovation": 0.5, "verbal_communication": 0.7, "social_orientation": 0.4, "leadership_drive": 0.5, "risk_appetite": 0.4, "structure_discipline": 0.7},
    "risk-manager": {"analytical_reasoning": 0.9, "quantitative_comfort": 0.85, "creativity_innovation": 0.4, "verbal_communication": 0.6, "social_orientation": 0.4, "leadership_drive": 0.5, "risk_appetite": 0.6, "structure_discipline": 0.9},
    "sales-manager": {"analytical_reasoning": 0.6, "quantitative_comfort": 0.5, "creativity_innovation": 0.5, "verbal_communication": 0.8, "social_orientation": 0.9, "leadership_drive": 0.8, "risk_appetite": 0.6, "structure_discipline": 0.6},
    "hr-manager": {"analytical_reasoning": 0.6, "quantitative_comfort": 0.5, "creativity_innovation": 0.5, "verbal_communication": 0.8, "social_orientation": 0.9, "leadership_drive": 0.7, "risk_appetite": 0.4, "structure_discipline": 0.8},
    "operations-manager": {"analytical_reasoning": 0.8, "quantitative_comfort": 0.6, "creativity_innovation": 0.4, "verbal_communication": 0.6, "social_orientation": 0.6, "leadership_drive": 0.8, "risk_appetite": 0.5, "structure_discipline": 0.9},
    "product-manager": {"analytical_reasoning": 0.8, "quantitative_comfort": 0.6, "creativity_innovation": 0.6, "verbal_communication": 0.7, "social_orientation": 0.7, "leadership_drive": 0.8, "risk_appetite": 0.6, "structure_discipline": 0.7},
    "entrepreneur": {"analytical_reasoning": 0.7, "quantitative_comfort": 0.6, "creativity_innovation": 0.8, "verbal_communication": 0.7, "social_orientation": 0.7, "leadership_drive": 0.8, "risk_appetite": 0.9, "structure_discipline": 0.6},
    "management-consultant": {"analytical_reasoning": 0.9, "quantitative_comfort": 0.75, "creativity_innovation": 0.5, "verbal_communication": 0.8, "social_orientation": 0.6, "leadership_drive": 0.8, "risk_appetite": 0.55, "structure_discipline": 0.75},
    "actuarial-scientist": {"analytical_reasoning": 0.95, "quantitative_comfort": 0.95, "creativity_innovation": 0.2, "verbal_communication": 0.4, "social_orientation": 0.2, "leadership_drive": 0.3, "risk_appetite": 0.4, "structure_discipline": 0.95},
    # 5. ARTS & CREATIVE
    "graphic-designer": {"analytical_reasoning": 0.3, "quantitative_comfort": 0.2, "creativity_innovation": 0.95, "verbal_communication": 0.5, "social_orientation": 0.4, "leadership_drive": 0.3, "risk_appetite": 0.5, "structure_discipline": 0.4},
    "writer": {"analytical_reasoning": 0.5, "quantitative_comfort": 0.2, "creativity_innovation": 0.8, "verbal_communication": 0.95, "social_orientation": 0.5, "leadership_drive": 0.3, "risk_appetite": 0.5, "structure_discipline": 0.5},
    "animator": {"analytical_reasoning": 0.5, "quantitative_comfort": 0.4, "creativity_innovation": 0.95, "verbal_communication": 0.5, "social_orientation": 0.4, "leadership_drive": 0.3, "risk_appetite": 0.5, "structure_discipline": 0.6},
    "fashion-designer": {"analytical_reasoning": 0.4, "quantitative_comfort": 0.3, "creativity_innovation": 0.95, "verbal_communication": 0.5, "social_orientation": 0.5, "leadership_drive": 0.5, "risk_appetite": 0.6, "structure_discipline": 0.5},
    "photographer": {"analytical_reasoning": 0.4, "quantitative_comfort": 0.3, "creativity_innovation": 0.9, "verbal_communication": 0.5, "social_orientation": 0.5, "leadership_drive": 0.3, "risk_appetite": 0.5, "structure_discipline": 0.5},
    "filmmaker": {"analytical_reasoning": 0.6, "quantitative_comfort": 0.4, "creativity_innovation": 0.9, "verbal_communication": 0.7, "social_orientation": 0.7, "leadership_drive": 0.7, "risk_appetite": 0.6, "structure_discipline": 0.6},
    "video-editor": {"analytical_reasoning": 0.6, "quantitative_comfort": 0.4, "creativity_innovation": 0.8, "verbal_communication": 0.5, "social_orientation": 0.4, "leadership_drive": 0.3, "risk_appetite": 0.4, "structure_discipline": 0.7},
    "vfx-artist": {"analytical_reasoning": 0.6, "quantitative_comfort": 0.5, "creativity_innovation": 0.9, "verbal_communication": 0.4, "social_orientation": 0.4, "leadership_drive": 0.3, "risk_appetite": 0.5, "structure_discipline": 0.7},
    "ui-ux-designer": {"analytical_reasoning": 0.7, "quantitative_comfort": 0.5, "creativity_innovation": 0.9, "verbal_communication": 0.6, "social_orientation": 0.6, "leadership_drive": 0.5, "risk_appetite": 0.5, "structure_discipline": 0.7},
    "content-creator": {"analytical_reasoning": 0.5, "quantitative_comfort": 0.3, "creativity_innovation": 0.9, "verbal_communication": 0.8, "social_orientation": 0.8, "leadership_drive": 0.5, "risk_appetite": 0.6, "structure_discipline": 0.5},
    "sound-engineer": {"analytical_reasoning": 0.6, "quantitative_comfort": 0.5, "creativity_innovation": 0.85, "verbal_communication": 0.4, "social_orientation": 0.35, "leadership_drive": 0.3, "risk_appetite": 0.4, "structure_discipline": 0.7},
    # 6. MEDIA & COMMUNICATION
    "journalist": {"analytical_reasoning": 0.7, "quantitative_comfort": 0.4, "creativity_innovation": 0.6, "verbal_communication": 0.95, "social_orientation": 0.7, "leadership_drive": 0.5, "risk_appetite": 0.5, "structure_discipline": 0.6},
    "news-anchor": {"analytical_reasoning": 0.6, "quantitative_comfort": 0.3, "creativity_innovation": 0.5, "verbal_communication": 0.95, "social_orientation": 0.7, "leadership_drive": 0.5, "risk_appetite": 0.4, "structure_discipline": 0.7},
    "pr-specialist": {"analytical_reasoning": 0.6, "quantitative_comfort": 0.4, "creativity_innovation": 0.6, "verbal_communication": 0.9, "social_orientation": 0.9, "leadership_drive": 0.6, "risk_appetite": 0.5, "structure_discipline": 0.7},
    "copywriter": {"analytical_reasoning": 0.5, "quantitative_comfort": 0.3, "creativity_innovation": 0.9, "verbal_communication": 0.95, "social_orientation": 0.5, "leadership_drive": 0.3, "risk_appetite": 0.5, "structure_discipline": 0.5},
    "social-media-manager": {"analytical_reasoning": 0.6, "quantitative_comfort": 0.5, "creativity_innovation": 0.8, "verbal_communication": 0.8, "social_orientation": 0.9, "leadership_drive": 0.5, "risk_appetite": 0.5, "structure_discipline": 0.5},
    # 7. LAW
    "lawyer": {"analytical_reasoning": 0.8, "quantitative_comfort": 0.3, "creativity_innovation": 0.4, "verbal_communication": 0.9, "social_orientation": 0.6, "leadership_drive": 0.7, "risk_appetite": 0.5, "structure_discipline": 0.7},
    "corporate-lawyer": {"analytical_reasoning": 0.9, "quantitative_comfort": 0.7, "creativity_innovation": 0.4, "verbal_communication": 0.9, "social_orientation": 0.5, "leadership_drive": 0.3, "risk_appetite": 0.5, "structure_discipline": 0.8},
    "judge": {"analytical_reasoning": 0.95, "quantitative_comfort": 0.5, "creativity_innovation": 0.3, "verbal_communication": 0.9, "social_orientation": 0.5, "leadership_drive": 0.7, "risk_appetite": 0.8, "structure_discipline": 0.95},
    "company-secretary": {"analytical_reasoning": 0.8, "quantitative_comfort": 0.7, "creativity_innovation": 0.2, "verbal_communication": 0.6, "social_orientation": 0.5, "leadership_drive": 0.4, "risk_appetite": 0.3, "structure_discipline": 0.95},
    # 8. EDUCATION & RESEARCH
    "teacher": {"analytical_reasoning": 0.5, "quantitative_comfort": 0.4, "creativity_innovation": 0.6, "verbal_communication": 0.8, "social_orientation": 0.9, "leadership_drive": 0.6, "risk_appetite": 0.2, "structure_discipline": 0.7},
    "professor": {"analytical_reasoning": 0.9, "quantitative_comfort": 0.7, "creativity_innovation": 0.8, "verbal_communication": 0.9, "social_orientation": 0.6, "leadership_drive": 0.6, "risk_appetite": 0.5, "structure_discipline": 0.8},
    "education-counselor": {"analytical_reasoning": 0.6, "quantitative_comfort": 0.5, "creativity_innovation": 0.5, "verbal_communication": 0.8, "social_orientation": 0.95, "leadership_drive": 0.5, "risk_appetite": 0.3, "structure_discipline": 0.7},
    "academic-researcher": {"analytical_reasoning": 0.95, "quantitative_comfort": 0.8, "creativity_innovation": 0.7, "verbal_communication": 0.7, "social_orientation": 0.4, "leadership_drive": 0.5, "risk_appetite": 0.5, "structure_discipline": 0.9},
    # 9. GOVERNMENT & DEFENCE
    "civil-services-officer": {"analytical_reasoning": 0.87, "quantitative_comfort": 0.55, "creativity_innovation": 0.47, "verbal_communication": 0.83, "social_orientation": 0.85, "leadership_drive": 0.77, "risk_appetite": 0.57, "structure_discipline": 0.87},
    "defence-officer": {"analytical_reasoning": 0.77, "quantitative_comfort": 0.67, "creativity_innovation": 0.4, "verbal_communication": 0.6, "social_orientation": 0.73, "leadership_drive": 0.92, "risk_appetite": 0.65, "structure_discipline": 0.95},
    "police-officer": {"analytical_reasoning": 0.7, "quantitative_comfort": 0.5, "creativity_innovation": 0.4, "verbal_communication": 0.6, "social_orientation": 0.85, "leadership_drive": 0.8, "risk_appetite": 0.6, "structure_discipline": 0.9},
    "intelligence-officer": {"analytical_reasoning": 0.95, "quantitative_comfort": 0.7, "creativity_innovation": 0.5, "verbal_communication": 0.6, "social_orientation": 0.5, "leadership_drive": 0.6, "risk_appetite": 0.5, "structure_discipline": 0.95},
    # 10. AGRICULTURE & ENVIRONMENT
    "agricultural-scientist": {"analytical_reasoning": 0.9, "quantitative_comfort": 0.7, "creativity_innovation": 0.5, "verbal_communication": 0.5, "social_orientation": 0.4, "leadership_drive": 0.4, "risk_appetite": 0.4, "structure_discipline": 0.8},
    "horticulturist": {"analytical_reasoning": 0.7, "quantitative_comfort": 0.5, "creativity_innovation": 0.5, "verbal_communication": 0.5, "social_orientation": 0.4, "leadership_drive": 0.4, "risk_appetite": 0.4, "structure_discipline": 0.8},
    "forestry-officer": {"analytical_reasoning": 0.7, "quantitative_comfort": 0.5, "creativity_innovation": 0.4, "verbal_communication": 0.5, "social_orientation": 0.5, "leadership_drive": 0.5, "risk_appetite": 0.4, "structure_discipline": 0.8},
    "environmental-scientist": {"analytical_reasoning": 0.9, "quantitative_comfort": 0.7, "creativity_innovation": 0.5, "verbal_communication": 0.6, "social_orientation": 0.5, "leadership_drive": 0.5, "risk_appetite": 0.4, "structure_discipline": 0.8},
    "wildlife-biologist": {"analytical_reasoning": 0.85, "quantitative_comfort": 0.6, "creativity_innovation": 0.5, "verbal_communication": 0.6, "social_orientation": 0.5, "leadership_drive": 0.4, "risk_appetite": 0.5, "structure_discipline": 0.8},
    # 11. AVIATION & HOSPITALITY
    "pilot": {"analytical_reasoning": 0.8, "quantitative_comfort": 0.7, "creativity_innovation": 0.3, "verbal_communication": 0.5, "social_orientation": 0.4, "leadership_drive": 0.6, "risk_appetite": 0.5, "structure_discipline": 0.95},
    "air-traffic-controller": {"analytical_reasoning": 0.9, "quantitative_comfort": 0.7, "creativity_innovation": 0.3, "verbal_communication": 0.6, "social_orientation": 0.4, "leadership_drive": 0.5, "risk_appetite": 0.4, "structure_discipline": 0.95},
    "airport-manager": {"analytical_reasoning": 0.7, "quantitative_comfort": 0.6, "creativity_innovation": 0.5, "verbal_communication": 0.7, "social_orientation": 0.7, "leadership_drive": 0.8, "risk_appetite": 0.5, "structure_discipline": 0.9},
    "hotel-manager": {"analytical_reasoning": 0.7, "quantitative_comfort": 0.5, "creativity_innovation": 0.5, "verbal_communication": 0.7, "social_orientation": 0.9, "leadership_drive": 0.8, "risk_appetite": 0.5, "structure_discipline": 0.9},
    "event-manager": {"analytical_reasoning": 0.7, "quantitative_comfort": 0.5, "creativity_innovation": 0.7, "verbal_communication": 0.8, "social_orientation": 0.9, "leadership_drive": 0.9, "risk_appetite": 0.6, "structure_discipline": 0.9},
    # 12. OPERATIONS & LOGISTICS
    "supply-chain-manager": {"analytical_reasoning": 0.85, "quantitative_comfort": 0.8, "creativity_innovation": 0.4, "verbal_communication": 0.6, "social_orientation": 0.6, "leadership_drive": 0.7, "risk_appetite": 0.5, "structure_discipline": 0.95},
    "logistics-manager": {"analytical_reasoning": 0.8, "quantitative_comfort": 0.7, "creativity_innovation": 0.4, "verbal_communication": 0.6, "social_orientation": 0.6, "leadership_drive": 0.7, "risk_appetite": 0.5, "structure_discipline": 0.95},
    "procurement-specialist": {"analytical_reasoning": 0.8, "quantitative_comfort": 0.7, "creativity_innovation": 0.4, "verbal_communication": 0.6, "social_orientation": 0.6, "leadership_drive": 0.5, "risk_appetite": 0.4, "structure_discipline": 0.9},
    # 13. NEW-AGE DIGITAL
    "digital-marketer": {"analytical_reasoning": 0.7, "quantitative_comfort": 0.6, "creativity_innovation": 0.8, "verbal_communication": 0.8, "social_orientation": 0.8, "leadership_drive": 0.6, "risk_appetite": 0.6, "structure_discipline": 0.6},
    "seo-specialist": {"analytical_reasoning": 0.8, "quantitative_comfort": 0.6, "creativity_innovation": 0.5, "verbal_communication": 0.7, "social_orientation": 0.4, "leadership_drive": 0.4, "risk_appetite": 0.5, "structure_discipline": 0.8},
    "growth-hacker": {"analytical_reasoning": 0.8, "quantitative_comfort": 0.7, "creativity_innovation": 0.8, "verbal_communication": 0.7, "social_orientation": 0.6, "leadership_drive": 0.6, "risk_appetite": 0.7, "structure_discipline": 0.7},
    "influencer": {"analytical_reasoning": 0.5, "quantitative_comfort": 0.4, "creativity_innovation": 0.9, "verbal_communication": 0.8, "social_orientation": 0.95, "leadership_drive": 0.6, "risk_appetite": 0.7, "structure_discipline": 0.5},
    "ethical-hacker": {"analytical_reasoning": 0.95, "quantitative_comfort": 0.7, "creativity_innovation": 0.6, "verbal_communication": 0.5, "social_orientation": 0.3, "leadership_drive": 0.4, "risk_appetite": 0.6, "structure_discipline": 0.8},
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
