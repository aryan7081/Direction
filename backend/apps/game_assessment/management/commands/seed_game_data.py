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
    "mobile-app-developer": {"analytical_reasoning": 0.8, "quantitative_comfort": 0.6, "creativity_innovation": 0.7, "verbal_communication": 0.4, "social_orientation": 0.3, "leadership_drive": 0.3, "risk_appetite": 0.5, "structure_discipline": 0.7},
    "ai-engineer": {"analytical_reasoning": 0.95, "quantitative_comfort": 0.9, "creativity_innovation": 0.6, "verbal_communication": 0.4, "social_orientation": 0.2, "leadership_drive": 0.4, "risk_appetite": 0.5, "structure_discipline": 0.8},
    "machine-learning-engineer": {"analytical_reasoning": 0.95, "quantitative_comfort": 0.9, "creativity_innovation": 0.5, "verbal_communication": 0.4, "social_orientation": 0.2, "leadership_drive": 0.3, "risk_appetite": 0.4, "structure_discipline": 0.8},
    "cybersecurity-analyst": {"analytical_reasoning": 0.9, "quantitative_comfort": 0.6, "creativity_innovation": 0.5, "verbal_communication": 0.5, "social_orientation": 0.3, "leadership_drive": 0.4, "risk_appetite": 0.5, "structure_discipline": 0.8},
    "cloud-engineer": {"analytical_reasoning": 0.85, "quantitative_comfort": 0.7, "creativity_innovation": 0.5, "verbal_communication": 0.4, "social_orientation": 0.3, "leadership_drive": 0.4, "risk_appetite": 0.4, "structure_discipline": 0.9},
    "devops-engineer": {"analytical_reasoning": 0.85, "quantitative_comfort": 0.6, "creativity_innovation": 0.5, "verbal_communication": 0.5, "social_orientation": 0.5, "leadership_drive": 0.5, "risk_appetite": 0.5, "structure_discipline": 0.95},
    "game-developer": {"analytical_reasoning": 0.7, "quantitative_comfort": 0.6, "creativity_innovation": 0.9, "verbal_communication": 0.4, "social_orientation": 0.4, "leadership_drive": 0.4, "risk_appetite": 0.6, "structure_discipline": 0.7},
    "blockchain-developer": {"analytical_reasoning": 0.9, "quantitative_comfort": 0.8, "creativity_innovation": 0.6, "verbal_communication": 0.4, "social_orientation": 0.2, "leadership_drive": 0.4, "risk_appetite": 0.7, "structure_discipline": 0.7},
    "database-administrator": {"analytical_reasoning": 0.9, "quantitative_comfort": 0.7, "creativity_innovation": 0.3, "verbal_communication": 0.4, "social_orientation": 0.3, "leadership_drive": 0.3, "risk_appetite": 0.3, "structure_discipline": 0.95},
    "network-engineer": {"analytical_reasoning": 0.85, "quantitative_comfort": 0.7, "creativity_innovation": 0.4, "verbal_communication": 0.4, "social_orientation": 0.3, "leadership_drive": 0.4, "risk_appetite": 0.4, "structure_discipline": 0.9},
    "embedded-systems-engineer": {"analytical_reasoning": 0.9, "quantitative_comfort": 0.8, "creativity_innovation": 0.5, "verbal_communication": 0.3, "social_orientation": 0.2, "leadership_drive": 0.3, "risk_appetite": 0.4, "structure_discipline": 0.9},
    "robotics-engineer": {"analytical_reasoning": 0.9, "quantitative_comfort": 0.85, "creativity_innovation": 0.6, "verbal_communication": 0.4, "social_orientation": 0.2, "leadership_drive": 0.4, "risk_appetite": 0.5, "structure_discipline": 0.9},
    "electronics-engineer": {"analytical_reasoning": 0.9, "quantitative_comfort": 0.85, "creativity_innovation": 0.5, "verbal_communication": 0.3, "social_orientation": 0.2, "leadership_drive": 0.3, "risk_appetite": 0.4, "structure_discipline": 0.9},
    "electrical-engineer": {"analytical_reasoning": 0.85, "quantitative_comfort": 0.85, "creativity_innovation": 0.4, "verbal_communication": 0.3, "social_orientation": 0.2, "leadership_drive": 0.4, "risk_appetite": 0.4, "structure_discipline": 0.9},
    "mechatronics-engineer": {"analytical_reasoning": 0.9, "quantitative_comfort": 0.85, "creativity_innovation": 0.5, "verbal_communication": 0.3, "social_orientation": 0.2, "leadership_drive": 0.4, "risk_appetite": 0.4, "structure_discipline": 0.9},
    "data-scientist": {"analytical_reasoning": 0.9, "quantitative_comfort": 0.9, "creativity_innovation": 0.5, "verbal_communication": 0.4, "social_orientation": 0.2, "leadership_drive": 0.3, "risk_appetite": 0.4, "structure_discipline": 0.7},
    "mechanical-engineer": {"analytical_reasoning": 0.8, "quantitative_comfort": 0.8, "creativity_innovation": 0.5, "verbal_communication": 0.3, "social_orientation": 0.3, "leadership_drive": 0.4, "risk_appetite": 0.4, "structure_discipline": 0.8},
    "civil-engineer": {"analytical_reasoning": 0.8, "quantitative_comfort": 0.8, "creativity_innovation": 0.4, "verbal_communication": 0.3, "social_orientation": 0.3, "leadership_drive": 0.5, "risk_appetite": 0.4, "structure_discipline": 0.8},
    # 2. ARCHITECTURE & DESIGN
    "architect": {"analytical_reasoning": 0.7, "quantitative_comfort": 0.6, "creativity_innovation": 0.9, "verbal_communication": 0.4, "social_orientation": 0.3, "leadership_drive": 0.4, "risk_appetite": 0.4, "structure_discipline": 0.7},
    "interior-designer": {"analytical_reasoning": 0.5, "quantitative_comfort": 0.4, "creativity_innovation": 0.95, "verbal_communication": 0.5, "social_orientation": 0.5, "leadership_drive": 0.3, "risk_appetite": 0.5, "structure_discipline": 0.7},
    "landscape-architect": {"analytical_reasoning": 0.6, "quantitative_comfort": 0.5, "creativity_innovation": 0.9, "verbal_communication": 0.5, "social_orientation": 0.4, "leadership_drive": 0.4, "risk_appetite": 0.4, "structure_discipline": 0.7},
    "urban-planner": {"analytical_reasoning": 0.8, "quantitative_comfort": 0.6, "creativity_innovation": 0.6, "verbal_communication": 0.6, "social_orientation": 0.6, "leadership_drive": 0.5, "risk_appetite": 0.4, "structure_discipline": 0.9},
    "industrial-designer": {"analytical_reasoning": 0.7, "quantitative_comfort": 0.5, "creativity_innovation": 0.9, "verbal_communication": 0.5, "social_orientation": 0.4, "leadership_drive": 0.4, "risk_appetite": 0.5, "structure_discipline": 0.7},
    "product-designer": {"analytical_reasoning": 0.7, "quantitative_comfort": 0.5, "creativity_innovation": 0.9, "verbal_communication": 0.6, "social_orientation": 0.6, "leadership_drive": 0.5, "risk_appetite": 0.5, "structure_discipline": 0.7},
    # 3. MEDICAL & HEALTHCARE
    "doctor": {"analytical_reasoning": 0.8, "quantitative_comfort": 0.6, "creativity_innovation": 0.3, "verbal_communication": 0.6, "social_orientation": 0.8, "leadership_drive": 0.5, "risk_appetite": 0.3, "structure_discipline": 0.9},
    "dentist": {"analytical_reasoning": 0.7, "quantitative_comfort": 0.5, "creativity_innovation": 0.4, "verbal_communication": 0.5, "social_orientation": 0.7, "leadership_drive": 0.4, "risk_appetite": 0.3, "structure_discipline": 0.9},
    "pharmacist": {"analytical_reasoning": 0.8, "quantitative_comfort": 0.7, "creativity_innovation": 0.2, "verbal_communication": 0.5, "social_orientation": 0.5, "leadership_drive": 0.3, "risk_appetite": 0.2, "structure_discipline": 0.95},
    "nurse": {"analytical_reasoning": 0.6, "quantitative_comfort": 0.5, "creativity_innovation": 0.3, "verbal_communication": 0.6, "social_orientation": 0.95, "leadership_drive": 0.5, "risk_appetite": 0.3, "structure_discipline": 0.9},
    "physiotherapist": {"analytical_reasoning": 0.6, "quantitative_comfort": 0.5, "creativity_innovation": 0.4, "verbal_communication": 0.6, "social_orientation": 0.85, "leadership_drive": 0.4, "risk_appetite": 0.3, "structure_discipline": 0.8},
    "psychologist": {"analytical_reasoning": 0.7, "quantitative_comfort": 0.3, "creativity_innovation": 0.5, "verbal_communication": 0.8, "social_orientation": 0.9, "leadership_drive": 0.4, "risk_appetite": 0.3, "structure_discipline": 0.6},
    "psychiatrist": {"analytical_reasoning": 0.8, "quantitative_comfort": 0.5, "creativity_innovation": 0.4, "verbal_communication": 0.7, "social_orientation": 0.85, "leadership_drive": 0.5, "risk_appetite": 0.3, "structure_discipline": 0.9},
    "nutritionist": {"analytical_reasoning": 0.6, "quantitative_comfort": 0.5, "creativity_innovation": 0.4, "verbal_communication": 0.7, "social_orientation": 0.8, "leadership_drive": 0.4, "risk_appetite": 0.2, "structure_discipline": 0.8},
    "radiologist": {"analytical_reasoning": 0.9, "quantitative_comfort": 0.7, "creativity_innovation": 0.3, "verbal_communication": 0.5, "social_orientation": 0.4, "leadership_drive": 0.4, "risk_appetite": 0.3, "structure_discipline": 0.9},
    "medical-lab-technician": {"analytical_reasoning": 0.8, "quantitative_comfort": 0.7, "creativity_innovation": 0.2, "verbal_communication": 0.4, "social_orientation": 0.4, "leadership_drive": 0.2, "risk_appetite": 0.2, "structure_discipline": 0.95},
    "occupational-therapist": {"analytical_reasoning": 0.6, "quantitative_comfort": 0.4, "creativity_innovation": 0.5, "verbal_communication": 0.6, "social_orientation": 0.9, "leadership_drive": 0.4, "risk_appetite": 0.3, "structure_discipline": 0.8},
    "speech-therapist": {"analytical_reasoning": 0.6, "quantitative_comfort": 0.3, "creativity_innovation": 0.5, "verbal_communication": 0.9, "social_orientation": 0.9, "leadership_drive": 0.4, "risk_appetite": 0.3, "structure_discipline": 0.7},
    # 4. COMMERCE & BUSINESS
    "accountant": {"analytical_reasoning": 0.6, "quantitative_comfort": 0.9, "creativity_innovation": 0.1, "verbal_communication": 0.3, "social_orientation": 0.3, "leadership_drive": 0.3, "risk_appetite": 0.2, "structure_discipline": 0.9},
    "chartered-accountant": {"analytical_reasoning": 0.7, "quantitative_comfort": 0.9, "creativity_innovation": 0.2, "verbal_communication": 0.4, "social_orientation": 0.3, "leadership_drive": 0.4, "risk_appetite": 0.3, "structure_discipline": 0.9},
    "business-analyst": {"analytical_reasoning": 0.8, "quantitative_comfort": 0.7, "creativity_innovation": 0.4, "verbal_communication": 0.6, "social_orientation": 0.4, "leadership_drive": 0.5, "risk_appetite": 0.4, "structure_discipline": 0.7},
    "marketing-manager": {"analytical_reasoning": 0.6, "quantitative_comfort": 0.5, "creativity_innovation": 0.8, "verbal_communication": 0.8, "social_orientation": 0.7, "leadership_drive": 0.8, "risk_appetite": 0.6, "structure_discipline": 0.5},
    "investment-banker": {"analytical_reasoning": 0.9, "quantitative_comfort": 0.95, "creativity_innovation": 0.4, "verbal_communication": 0.7, "social_orientation": 0.6, "leadership_drive": 0.7, "risk_appetite": 0.8, "structure_discipline": 0.8},
    "financial-analyst": {"analytical_reasoning": 0.95, "quantitative_comfort": 0.95, "creativity_innovation": 0.3, "verbal_communication": 0.5, "social_orientation": 0.3, "leadership_drive": 0.4, "risk_appetite": 0.5, "structure_discipline": 0.8},
    "stock-trader": {"analytical_reasoning": 0.9, "quantitative_comfort": 0.9, "creativity_innovation": 0.4, "verbal_communication": 0.4, "social_orientation": 0.3, "leadership_drive": 0.5, "risk_appetite": 0.9, "structure_discipline": 0.7},
    "economist": {"analytical_reasoning": 0.95, "quantitative_comfort": 0.9, "creativity_innovation": 0.5, "verbal_communication": 0.7, "social_orientation": 0.4, "leadership_drive": 0.5, "risk_appetite": 0.4, "structure_discipline": 0.7},
    "auditor": {"analytical_reasoning": 0.9, "quantitative_comfort": 0.85, "creativity_innovation": 0.2, "verbal_communication": 0.5, "social_orientation": 0.4, "leadership_drive": 0.4, "risk_appetite": 0.3, "structure_discipline": 0.95},
    "risk-manager": {"analytical_reasoning": 0.9, "quantitative_comfort": 0.85, "creativity_innovation": 0.4, "verbal_communication": 0.6, "social_orientation": 0.4, "leadership_drive": 0.5, "risk_appetite": 0.6, "structure_discipline": 0.9},
    "insurance-advisor": {"analytical_reasoning": 0.6, "quantitative_comfort": 0.6, "creativity_innovation": 0.3, "verbal_communication": 0.8, "social_orientation": 0.8, "leadership_drive": 0.5, "risk_appetite": 0.4, "structure_discipline": 0.7},
    "sales-manager": {"analytical_reasoning": 0.6, "quantitative_comfort": 0.5, "creativity_innovation": 0.5, "verbal_communication": 0.8, "social_orientation": 0.9, "leadership_drive": 0.8, "risk_appetite": 0.6, "structure_discipline": 0.6},
    "hr-manager": {"analytical_reasoning": 0.6, "quantitative_comfort": 0.5, "creativity_innovation": 0.5, "verbal_communication": 0.8, "social_orientation": 0.9, "leadership_drive": 0.7, "risk_appetite": 0.4, "structure_discipline": 0.8},
    "operations-manager": {"analytical_reasoning": 0.8, "quantitative_comfort": 0.6, "creativity_innovation": 0.4, "verbal_communication": 0.6, "social_orientation": 0.6, "leadership_drive": 0.8, "risk_appetite": 0.5, "structure_discipline": 0.9},
    "product-manager": {"analytical_reasoning": 0.8, "quantitative_comfort": 0.6, "creativity_innovation": 0.6, "verbal_communication": 0.7, "social_orientation": 0.7, "leadership_drive": 0.8, "risk_appetite": 0.6, "structure_discipline": 0.7},
    "entrepreneur": {"analytical_reasoning": 0.7, "quantitative_comfort": 0.6, "creativity_innovation": 0.8, "verbal_communication": 0.7, "social_orientation": 0.7, "leadership_drive": 0.8, "risk_appetite": 0.9, "structure_discipline": 0.6},
    # 5. ARTS & CREATIVE
    "graphic-designer": {"analytical_reasoning": 0.3, "quantitative_comfort": 0.2, "creativity_innovation": 0.9, "verbal_communication": 0.5, "social_orientation": 0.4, "leadership_drive": 0.3, "risk_appetite": 0.5, "structure_discipline": 0.4},
    "writer": {"analytical_reasoning": 0.5, "quantitative_comfort": 0.2, "creativity_innovation": 0.7, "verbal_communication": 0.9, "social_orientation": 0.5, "leadership_drive": 0.3, "risk_appetite": 0.5, "structure_discipline": 0.5},
    "animator": {"analytical_reasoning": 0.5, "quantitative_comfort": 0.4, "creativity_innovation": 0.95, "verbal_communication": 0.5, "social_orientation": 0.4, "leadership_drive": 0.3, "risk_appetite": 0.5, "structure_discipline": 0.6},
    "illustrator": {"analytical_reasoning": 0.4, "quantitative_comfort": 0.3, "creativity_innovation": 0.95, "verbal_communication": 0.5, "social_orientation": 0.4, "leadership_drive": 0.3, "risk_appetite": 0.5, "structure_discipline": 0.5},
    "fashion-designer": {"analytical_reasoning": 0.4, "quantitative_comfort": 0.3, "creativity_innovation": 0.95, "verbal_communication": 0.5, "social_orientation": 0.5, "leadership_drive": 0.5, "risk_appetite": 0.6, "structure_discipline": 0.5},
    "photographer": {"analytical_reasoning": 0.4, "quantitative_comfort": 0.3, "creativity_innovation": 0.9, "verbal_communication": 0.5, "social_orientation": 0.5, "leadership_drive": 0.3, "risk_appetite": 0.5, "structure_discipline": 0.5},
    "filmmaker": {"analytical_reasoning": 0.6, "quantitative_comfort": 0.4, "creativity_innovation": 0.9, "verbal_communication": 0.7, "social_orientation": 0.7, "leadership_drive": 0.7, "risk_appetite": 0.6, "structure_discipline": 0.6},
    "video-editor": {"analytical_reasoning": 0.6, "quantitative_comfort": 0.4, "creativity_innovation": 0.8, "verbal_communication": 0.5, "social_orientation": 0.4, "leadership_drive": 0.3, "risk_appetite": 0.4, "structure_discipline": 0.7},
    "vfx-artist": {"analytical_reasoning": 0.6, "quantitative_comfort": 0.5, "creativity_innovation": 0.9, "verbal_communication": 0.4, "social_orientation": 0.4, "leadership_drive": 0.3, "risk_appetite": 0.5, "structure_discipline": 0.7},
    "ui-ux-designer": {"analytical_reasoning": 0.7, "quantitative_comfort": 0.5, "creativity_innovation": 0.9, "verbal_communication": 0.6, "social_orientation": 0.6, "leadership_drive": 0.5, "risk_appetite": 0.5, "structure_discipline": 0.7},
    "content-creator": {"analytical_reasoning": 0.5, "quantitative_comfort": 0.3, "creativity_innovation": 0.9, "verbal_communication": 0.8, "social_orientation": 0.8, "leadership_drive": 0.5, "risk_appetite": 0.6, "structure_discipline": 0.5},
    "script-writer": {"analytical_reasoning": 0.6, "quantitative_comfort": 0.2, "creativity_innovation": 0.9, "verbal_communication": 0.95, "social_orientation": 0.5, "leadership_drive": 0.3, "risk_appetite": 0.5, "structure_discipline": 0.6},
    # 6. MEDIA & COMMUNICATION
    "journalist": {"analytical_reasoning": 0.7, "quantitative_comfort": 0.4, "creativity_innovation": 0.6, "verbal_communication": 0.95, "social_orientation": 0.7, "leadership_drive": 0.5, "risk_appetite": 0.5, "structure_discipline": 0.6},
    "news-anchor": {"analytical_reasoning": 0.6, "quantitative_comfort": 0.3, "creativity_innovation": 0.5, "verbal_communication": 0.95, "social_orientation": 0.7, "leadership_drive": 0.5, "risk_appetite": 0.4, "structure_discipline": 0.7},
    "radio-jockey": {"analytical_reasoning": 0.5, "quantitative_comfort": 0.3, "creativity_innovation": 0.7, "verbal_communication": 0.9, "social_orientation": 0.9, "leadership_drive": 0.5, "risk_appetite": 0.5, "structure_discipline": 0.5},
    "pr-specialist": {"analytical_reasoning": 0.6, "quantitative_comfort": 0.4, "creativity_innovation": 0.6, "verbal_communication": 0.9, "social_orientation": 0.9, "leadership_drive": 0.6, "risk_appetite": 0.5, "structure_discipline": 0.7},
    "copywriter": {"analytical_reasoning": 0.5, "quantitative_comfort": 0.3, "creativity_innovation": 0.9, "verbal_communication": 0.95, "social_orientation": 0.5, "leadership_drive": 0.3, "risk_appetite": 0.5, "structure_discipline": 0.5},
    "social-media-manager": {"analytical_reasoning": 0.6, "quantitative_comfort": 0.5, "creativity_innovation": 0.8, "verbal_communication": 0.8, "social_orientation": 0.9, "leadership_drive": 0.5, "risk_appetite": 0.5, "structure_discipline": 0.5},
    # 7. LAW
    "lawyer": {"analytical_reasoning": 0.8, "quantitative_comfort": 0.3, "creativity_innovation": 0.4, "verbal_communication": 0.9, "social_orientation": 0.6, "leadership_drive": 0.7, "risk_appetite": 0.5, "structure_discipline": 0.7},
    "corporate-lawyer": {"analytical_reasoning": 0.9, "quantitative_comfort": 0.7, "creativity_innovation": 0.4, "verbal_communication": 0.9, "social_orientation": 0.5, "leadership_drive": 0.3, "risk_appetite": 0.5, "structure_discipline": 0.8},
    "criminal-lawyer": {"analytical_reasoning": 0.8, "quantitative_comfort": 0.3, "creativity_innovation": 0.5, "verbal_communication": 0.95, "social_orientation": 0.7, "leadership_drive": 0.6, "risk_appetite": 0.6, "structure_discipline": 0.7},
    "judge": {"analytical_reasoning": 0.95, "quantitative_comfort": 0.5, "creativity_innovation": 0.3, "verbal_communication": 0.9, "social_orientation": 0.5, "leadership_drive": 0.7, "risk_appetite": 0.8, "structure_discipline": 0.95},
    "legal-advisor": {"analytical_reasoning": 0.85, "quantitative_comfort": 0.5, "creativity_innovation": 0.4, "verbal_communication": 0.9, "social_orientation": 0.5, "leadership_drive": 0.5, "risk_appetite": 0.4, "structure_discipline": 0.8},
    "company-secretary": {"analytical_reasoning": 0.8, "quantitative_comfort": 0.7, "creativity_innovation": 0.2, "verbal_communication": 0.6, "social_orientation": 0.5, "leadership_drive": 0.4, "risk_appetite": 0.3, "structure_discipline": 0.95},
    # 8. EDUCATION
    "teacher": {"analytical_reasoning": 0.5, "quantitative_comfort": 0.4, "creativity_innovation": 0.6, "verbal_communication": 0.8, "social_orientation": 0.9, "leadership_drive": 0.6, "risk_appetite": 0.2, "structure_discipline": 0.7},
    "professor": {"analytical_reasoning": 0.9, "quantitative_comfort": 0.7, "creativity_innovation": 0.8, "verbal_communication": 0.9, "social_orientation": 0.6, "leadership_drive": 0.6, "risk_appetite": 0.5, "structure_discipline": 0.8},
    "tutor": {"analytical_reasoning": 0.6, "quantitative_comfort": 0.5, "creativity_innovation": 0.5, "verbal_communication": 0.8, "social_orientation": 0.8, "leadership_drive": 0.4, "risk_appetite": 0.2, "structure_discipline": 0.6},
    "education-counselor": {"analytical_reasoning": 0.6, "quantitative_comfort": 0.5, "creativity_innovation": 0.5, "verbal_communication": 0.8, "social_orientation": 0.95, "leadership_drive": 0.5, "risk_appetite": 0.3, "structure_discipline": 0.7},
    "academic-researcher": {"analytical_reasoning": 0.95, "quantitative_comfort": 0.8, "creativity_innovation": 0.7, "verbal_communication": 0.7, "social_orientation": 0.4, "leadership_drive": 0.5, "risk_appetite": 0.5, "structure_discipline": 0.9},
    # 9. GOVERNMENT & DEFENCE
    "ias-officer": {"analytical_reasoning": 0.9, "quantitative_comfort": 0.6, "creativity_innovation": 0.5, "verbal_communication": 0.8, "social_orientation": 0.8, "leadership_drive": 0.8, "risk_appetite": 0.6, "structure_discipline": 0.9},
    "ips-officer": {"analytical_reasoning": 0.8, "quantitative_comfort": 0.5, "creativity_innovation": 0.4, "verbal_communication": 0.7, "social_orientation": 0.85, "leadership_drive": 0.9, "risk_appetite": 0.6, "structure_discipline": 0.9},
    "ifs-officer": {"analytical_reasoning": 0.8, "quantitative_comfort": 0.5, "creativity_innovation": 0.5, "verbal_communication": 0.9, "social_orientation": 0.9, "leadership_drive": 0.7, "risk_appetite": 0.5, "structure_discipline": 0.8},
    "army-officer": {"analytical_reasoning": 0.7, "quantitative_comfort": 0.6, "creativity_innovation": 0.4, "verbal_communication": 0.6, "social_orientation": 0.8, "leadership_drive": 0.95, "risk_appetite": 0.7, "structure_discipline": 0.95},
    "navy-officer": {"analytical_reasoning": 0.8, "quantitative_comfort": 0.7, "creativity_innovation": 0.4, "verbal_communication": 0.6, "social_orientation": 0.7, "leadership_drive": 0.9, "risk_appetite": 0.6, "structure_discipline": 0.95},
    "air-force-officer": {"analytical_reasoning": 0.8, "quantitative_comfort": 0.7, "creativity_innovation": 0.4, "verbal_communication": 0.6, "social_orientation": 0.7, "leadership_drive": 0.9, "risk_appetite": 0.6, "structure_discipline": 0.95},
    "police-officer": {"analytical_reasoning": 0.7, "quantitative_comfort": 0.5, "creativity_innovation": 0.4, "verbal_communication": 0.6, "social_orientation": 0.85, "leadership_drive": 0.8, "risk_appetite": 0.6, "structure_discipline": 0.9},
    "intelligence-officer": {"analytical_reasoning": 0.95, "quantitative_comfort": 0.7, "creativity_innovation": 0.5, "verbal_communication": 0.6, "social_orientation": 0.5, "leadership_drive": 0.6, "risk_appetite": 0.5, "structure_discipline": 0.95},
    # 10. SPORTS
    "athlete": {"analytical_reasoning": 0.5, "quantitative_comfort": 0.4, "creativity_innovation": 0.4, "verbal_communication": 0.4, "social_orientation": 0.5, "leadership_drive": 0.6, "risk_appetite": 0.5, "structure_discipline": 0.9},
    "coach": {"analytical_reasoning": 0.6, "quantitative_comfort": 0.5, "creativity_innovation": 0.5, "verbal_communication": 0.7, "social_orientation": 0.9, "leadership_drive": 0.8, "risk_appetite": 0.4, "structure_discipline": 0.8},
    "fitness-trainer": {"analytical_reasoning": 0.5, "quantitative_comfort": 0.5, "creativity_innovation": 0.4, "verbal_communication": 0.6, "social_orientation": 0.85, "leadership_drive": 0.6, "risk_appetite": 0.4, "structure_discipline": 0.8},
    "sports-analyst": {"analytical_reasoning": 0.9, "quantitative_comfort": 0.8, "creativity_innovation": 0.4, "verbal_communication": 0.6, "social_orientation": 0.4, "leadership_drive": 0.4, "risk_appetite": 0.4, "structure_discipline": 0.7},
    "sports-manager": {"analytical_reasoning": 0.7, "quantitative_comfort": 0.6, "creativity_innovation": 0.5, "verbal_communication": 0.7, "social_orientation": 0.8, "leadership_drive": 0.8, "risk_appetite": 0.5, "structure_discipline": 0.8},
    # 11. AGRICULTURE & ENVIRONMENT
    "agricultural-scientist": {"analytical_reasoning": 0.9, "quantitative_comfort": 0.7, "creativity_innovation": 0.5, "verbal_communication": 0.5, "social_orientation": 0.4, "leadership_drive": 0.4, "risk_appetite": 0.4, "structure_discipline": 0.8},
    "farmer": {"analytical_reasoning": 0.9, "quantitative_comfort": 0.5, "creativity_innovation": 0.4, "verbal_communication": 0.4, "social_orientation": 0.5, "leadership_drive": 0.6, "risk_appetite": 0.6, "structure_discipline": 0.8},
    "horticulturist": {"analytical_reasoning": 0.7, "quantitative_comfort": 0.5, "creativity_innovation": 0.5, "verbal_communication": 0.5, "social_orientation": 0.4, "leadership_drive": 0.4, "risk_appetite": 0.4, "structure_discipline": 0.8},
    "forestry-officer": {"analytical_reasoning": 0.7, "quantitative_comfort": 0.5, "creativity_innovation": 0.4, "verbal_communication": 0.5, "social_orientation": 0.5, "leadership_drive": 0.5, "risk_appetite": 0.4, "structure_discipline": 0.8},
    "environmental-scientist": {"analytical_reasoning": 0.9, "quantitative_comfort": 0.7, "creativity_innovation": 0.5, "verbal_communication": 0.6, "social_orientation": 0.5, "leadership_drive": 0.5, "risk_appetite": 0.4, "structure_discipline": 0.8},
    "wildlife-biologist": {"analytical_reasoning": 0.85, "quantitative_comfort": 0.6, "creativity_innovation": 0.5, "verbal_communication": 0.6, "social_orientation": 0.5, "leadership_drive": 0.4, "risk_appetite": 0.5, "structure_discipline": 0.8},
    # 12. AVIATION & HOSPITALITY
    "pilot": {"analytical_reasoning": 0.8, "quantitative_comfort": 0.7, "creativity_innovation": 0.3, "verbal_communication": 0.5, "social_orientation": 0.4, "leadership_drive": 0.6, "risk_appetite": 0.5, "structure_discipline": 0.95},
    "cabin-crew": {"analytical_reasoning": 0.5, "quantitative_comfort": 0.4, "creativity_innovation": 0.4, "verbal_communication": 0.8, "social_orientation": 0.95, "leadership_drive": 0.5, "risk_appetite": 0.4, "structure_discipline": 0.8},
    "air-traffic-controller": {"analytical_reasoning": 0.9, "quantitative_comfort": 0.7, "creativity_innovation": 0.3, "verbal_communication": 0.6, "social_orientation": 0.4, "leadership_drive": 0.5, "risk_appetite": 0.4, "structure_discipline": 0.95},
    "airport-manager": {"analytical_reasoning": 0.7, "quantitative_comfort": 0.6, "creativity_innovation": 0.5, "verbal_communication": 0.7, "social_orientation": 0.7, "leadership_drive": 0.8, "risk_appetite": 0.5, "structure_discipline": 0.9},
    "hotel-manager": {"analytical_reasoning": 0.7, "quantitative_comfort": 0.5, "creativity_innovation": 0.5, "verbal_communication": 0.7, "social_orientation": 0.9, "leadership_drive": 0.8, "risk_appetite": 0.5, "structure_discipline": 0.9},
    "chef": {"analytical_reasoning": 0.5, "quantitative_comfort": 0.4, "creativity_innovation": 0.9, "verbal_communication": 0.5, "social_orientation": 0.6, "leadership_drive": 0.6, "risk_appetite": 0.5, "structure_discipline": 0.8},
    "event-manager": {"analytical_reasoning": 0.7, "quantitative_comfort": 0.5, "creativity_innovation": 0.7, "verbal_communication": 0.8, "social_orientation": 0.9, "leadership_drive": 0.9, "risk_appetite": 0.6, "structure_discipline": 0.9},
    "travel-consultant": {"analytical_reasoning": 0.6, "quantitative_comfort": 0.5, "creativity_innovation": 0.5, "verbal_communication": 0.8, "social_orientation": 0.85, "leadership_drive": 0.4, "risk_appetite": 0.4, "structure_discipline": 0.7},
    # 13. VOCATIONAL
    "electrician": {"analytical_reasoning": 0.7, "quantitative_comfort": 0.6, "creativity_innovation": 0.4, "verbal_communication": 0.4, "social_orientation": 0.4, "leadership_drive": 0.3, "risk_appetite": 0.4, "structure_discipline": 0.9},
    "plumber": {"analytical_reasoning": 0.6, "quantitative_comfort": 0.5, "creativity_innovation": 0.4, "verbal_communication": 0.4, "social_orientation": 0.4, "leadership_drive": 0.3, "risk_appetite": 0.3, "structure_discipline": 0.8},
    "carpenter": {"analytical_reasoning": 0.6, "quantitative_comfort": 0.5, "creativity_innovation": 0.6, "verbal_communication": 0.4, "social_orientation": 0.4, "leadership_drive": 0.3, "risk_appetite": 0.3, "structure_discipline": 0.8},
    "mechanic": {"analytical_reasoning": 0.7, "quantitative_comfort": 0.6, "creativity_innovation": 0.4, "verbal_communication": 0.4, "social_orientation": 0.4, "leadership_drive": 0.3, "risk_appetite": 0.4, "structure_discipline": 0.9},
    "technician": {"analytical_reasoning": 0.7, "quantitative_comfort": 0.6, "creativity_innovation": 0.4, "verbal_communication": 0.4, "social_orientation": 0.4, "leadership_drive": 0.3, "risk_appetite": 0.4, "structure_discipline": 0.9},
    "tailor": {"analytical_reasoning": 0.5, "quantitative_comfort": 0.4, "creativity_innovation": 0.7, "verbal_communication": 0.4, "social_orientation": 0.5, "leadership_drive": 0.3, "risk_appetite": 0.3, "structure_discipline": 0.8},
    "beautician": {"analytical_reasoning": 0.4, "quantitative_comfort": 0.3, "creativity_innovation": 0.7, "verbal_communication": 0.6, "social_orientation": 0.85, "leadership_drive": 0.4, "risk_appetite": 0.3, "structure_discipline": 0.6},
    # 14. OPERATIONS & LOGISTICS
    "supply-chain-manager": {"analytical_reasoning": 0.85, "quantitative_comfort": 0.8, "creativity_innovation": 0.4, "verbal_communication": 0.6, "social_orientation": 0.6, "leadership_drive": 0.7, "risk_appetite": 0.5, "structure_discipline": 0.95},
    "logistics-manager": {"analytical_reasoning": 0.8, "quantitative_comfort": 0.7, "creativity_innovation": 0.4, "verbal_communication": 0.6, "social_orientation": 0.6, "leadership_drive": 0.7, "risk_appetite": 0.5, "structure_discipline": 0.95},
    "warehouse-manager": {"analytical_reasoning": 0.7, "quantitative_comfort": 0.6, "creativity_innovation": 0.3, "verbal_communication": 0.5, "social_orientation": 0.5, "leadership_drive": 0.6, "risk_appetite": 0.4, "structure_discipline": 0.95},
    "procurement-specialist": {"analytical_reasoning": 0.8, "quantitative_comfort": 0.7, "creativity_innovation": 0.4, "verbal_communication": 0.6, "social_orientation": 0.6, "leadership_drive": 0.5, "risk_appetite": 0.4, "structure_discipline": 0.9},
    # 15. NEW-AGE DIGITAL
    "digital-marketer": {"analytical_reasoning": 0.7, "quantitative_comfort": 0.6, "creativity_innovation": 0.8, "verbal_communication": 0.8, "social_orientation": 0.8, "leadership_drive": 0.6, "risk_appetite": 0.6, "structure_discipline": 0.6},
    "seo-specialist": {"analytical_reasoning": 0.8, "quantitative_comfort": 0.6, "creativity_innovation": 0.5, "verbal_communication": 0.7, "social_orientation": 0.4, "leadership_drive": 0.4, "risk_appetite": 0.5, "structure_discipline": 0.8},
    "growth-hacker": {"analytical_reasoning": 0.8, "quantitative_comfort": 0.7, "creativity_innovation": 0.8, "verbal_communication": 0.7, "social_orientation": 0.6, "leadership_drive": 0.6, "risk_appetite": 0.7, "structure_discipline": 0.7},
    "influencer": {"analytical_reasoning": 0.5, "quantitative_comfort": 0.4, "creativity_innovation": 0.9, "verbal_communication": 0.8, "social_orientation": 0.95, "leadership_drive": 0.6, "risk_appetite": 0.7, "structure_discipline": 0.5},
    "ethical-hacker": {"analytical_reasoning": 0.95, "quantitative_comfort": 0.7, "creativity_innovation": 0.6, "verbal_communication": 0.5, "social_orientation": 0.3, "leadership_drive": 0.4, "risk_appetite": 0.6, "structure_discipline": 0.8},
    "no-code-developer": {"analytical_reasoning": 0.7, "quantitative_comfort": 0.6, "creativity_innovation": 0.7, "verbal_communication": 0.5, "social_orientation": 0.5, "leadership_drive": 0.4, "risk_appetite": 0.5, "structure_discipline": 0.7},
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
