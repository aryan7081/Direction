"""
Psychometric item bank (static).

- **Runtime game flow** reads questions from the database (`Question` / `AnswerOption`)
  via `apps.assessments.game_catalog.get_mcq_catalog()`.
- **Seeding** copies these lists into the DB (`seed_data` uses `ALL_MCQ_ITEMS`).
"""

from .psychometric_items import ALL_MCQ_ITEMS, MCQ_ITEMS, PREMIUM_MCQ_ITEMS

__all__ = ["ALL_MCQ_ITEMS", "MCQ_ITEMS", "PREMIUM_MCQ_ITEMS"]
