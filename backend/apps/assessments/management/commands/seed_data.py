"""
Seed categories, questions, careers, and weights for MVP.
"""
from decimal import Decimal

from django.core.management.base import BaseCommand

from apps.assessments.models import AnswerOption, Category, Question
from apps.careers.models import Career, CareerCategoryWeight, CareerSubjectWeight


class Command(BaseCommand):
    help = "Seed categories, sample questions, careers, and weights"

    def handle(self, *args, **options):
        self._seed_categories()
        self._seed_questions()
        self._seed_careers()
        self._seed_weights()
        self._seed_subject_weights()
        self.stdout.write(self.style.SUCCESS("Seed complete."))

    def _seed_categories(self):
        cats = [
            ("Analytical", "analytical", "Logical reasoning and problem-solving"),
            ("Creative", "creative", "Artistic and innovative thinking"),
            ("Social", "social", "Interpersonal and helping others"),
            ("Organizational", "organizational", "Planning and management"),
            ("Technical", "technical", "Technical and mechanical aptitude"),
            ("Verbal", "verbal", "Language and communication"),
            ("Scientific", "scientific", "Interest in biology, health sciences and medicine"),
        ]
        for name, slug, desc in cats:
            Category.objects.get_or_create(slug=slug, defaults={"name": name, "description": desc})
        self.stdout.write("Categories seeded.")

    def _seed_questions(self):
        categories = {c.slug: c for c in Category.objects.all()}
        opts = [(1, "Strongly disagree"), (2, "Disagree"), (3, "Neutral"), (4, "Agree"), (5, "Strongly agree")]
        questions_data = [
            ("analytical", "I enjoy solving puzzles and brain teasers."),
            ("analytical", "I prefer working with numbers and data."),
            ("analytical", "I like finding patterns in information."),
            ("analytical", "I enjoy science and experiments."),
            ("analytical", "I am good at logical reasoning."),
            ("analytical", "I like analyzing problems step by step."),
            ("analytical", "I prefer structured tasks over open-ended ones."),
            ("creative", "I love drawing, painting, or designing."),
            ("creative", "I enjoy coming up with new ideas."),
            ("creative", "I like expressing myself through art or music."),
            ("creative", "I enjoy brainstorming and thinking outside the box."),
            ("creative", "I like creating stories or narratives."),
            ("creative", "I prefer tasks that allow creativity."),
            ("creative", "I enjoy visual design and aesthetics."),
            ("social", "I like helping others with their problems."),
            ("social", "I enjoy working in teams."),
            ("social", "I like teaching or explaining to others."),
            ("social", "I care about community and society."),
            ("social", "I enjoy meeting new people."),
            ("social", "I am good at understanding others' feelings."),
            ("social", "I prefer collaborative over solo work."),
            ("organizational", "I like to plan and organize things."),
            ("organizational", "I am good at managing time."),
            ("organizational", "I enjoy keeping things in order."),
            ("organizational", "I like setting and achieving goals."),
            ("organizational", "I prefer clear instructions and structure."),
            ("organizational", "I am good at prioritizing tasks."),
            ("organizational", "I enjoy managing projects."),
            ("technical", "I enjoy fixing or building things."),
            ("technical", "I am curious about how machines work."),
            ("technical", "I like working with computers and technology."),
            ("technical", "I enjoy troubleshooting and solving technical problems."),
            ("technical", "I like learning new software or tools."),
            ("technical", "I am interested in coding or programming."),
            ("technical", "I prefer hands-on technical tasks."),
            ("verbal", "I love reading and writing."),
            ("verbal", "I enjoy debating or explaining ideas."),
            ("verbal", "I am good at expressing myself in words."),
            ("verbal", "I enjoy learning new languages."),
            ("verbal", "I like researching and writing reports."),
            ("verbal", "I prefer written over verbal communication."),
            ("verbal", "I enjoy storytelling and narratives."),
            # Scientific - medicine, health, biology (strong signal for Doctor, Science stream)
            ("scientific", "I am fascinated by how the human body works."),
            ("scientific", "I am interested in biology and health sciences."),
            ("scientific", "I would enjoy working in a hospital or healthcare setting."),
            ("scientific", "I want to help people recover from illness or injury."),
            ("scientific", "I enjoy learning about diseases and their treatments."),
        ]
        for i, (slug, text) in enumerate(questions_data):
            cat = categories.get(slug)
            if not cat:
                continue
            q, created = Question.objects.get_or_create(
                category=cat,
                text=text,
                defaults={"order": i + 1, "is_active": True},
            )
            if created:
                for j, (score, opt_text) in enumerate(opts):
                    AnswerOption.objects.create(
                        question=q,
                        text=opt_text,
                        score=score,
                        order=j + 1,
                    )
        self.stdout.write("Questions seeded (sample set).")

    def _seed_careers(self):
        # (name, slug, desc, stream, min_ed, salary, growth, education_cost_tier)
        careers_data = [
            ("Software Engineer", "software-engineer", "Design and build software applications.", "Science", "B.Tech/B.E.", "₹5-50L", "Very High", "medium"),
            ("Doctor", "doctor", "Diagnose and treat medical conditions.", "Science", "MBBS", "₹8-80L", "High", "high"),
            ("Engineer (Mechanical)", "mechanical-engineer", "Design and develop mechanical systems.", "Science", "B.Tech", "₹4-25L", "High", "medium"),
            ("Data Scientist", "data-scientist", "Analyze data to extract insights.", "Science", "B.Tech/M.Sc", "₹6-40L", "Very High", "medium"),
            ("Accountant", "accountant", "Manage financial records and reporting.", "Commerce", "B.Com/CA", "₹3-15L", "Stable", "low"),
            ("Business Analyst", "business-analyst", "Bridge business needs with technology.", "Commerce", "B.Com/MBA", "₹4-20L", "High", "medium"),
            ("Marketing Manager", "marketing-manager", "Plan and execute marketing strategies.", "Commerce", "BBA/MBA", "₹5-25L", "High", "medium"),
            ("Chartered Accountant", "chartered-accountant", "Financial auditing and advisory.", "Commerce", "CA", "₹6-50L", "Stable", "medium"),
            ("Graphic Designer", "graphic-designer", "Create visual content for brands.", "Arts", "B.Des/BFA", "₹3-15L", "High", "low"),
            ("Writer/Author", "writer", "Create written content and books.", "Arts", "Any", "₹2-20L", "Variable", "low"),
            ("Psychologist", "psychologist", "Study and support mental health.", "Arts", "M.A./M.Sc Psychology", "₹4-20L", "High", "medium"),
            ("Teacher", "teacher", "Educate students in schools.", "Arts", "B.Ed", "₹3-12L", "Stable", "low"),
            ("Architect", "architect", "Design buildings and structures.", "Science", "B.Arch", "₹5-30L", "High", "medium"),
            ("Lawyer", "lawyer", "Practice law and represent clients.", "Arts", "LLB", "₹4-50L", "High", "medium"),
            ("Civil Engineer", "civil-engineer", "Design and build infrastructure.", "Science", "B.Tech", "₹4-20L", "High", "medium"),
        ]
        for i, (name, slug, desc, stream, min_ed, salary, growth, cost_tier) in enumerate(careers_data):
            Career.objects.update_or_create(
                slug=slug,
                defaults={
                    "name": name,
                    "description": desc,
                    "stream": stream,
                    "min_education": min_ed,
                    "salary_range": salary,
                    "growth_outlook": growth,
                    "education_cost_tier": cost_tier,
                    "order": i + 1,
                },
            )
        self.stdout.write("Careers seeded.")

    def _seed_weights(self):
        categories = {c.slug: c for c in Category.objects.all()}
        weights_map = {
            "software-engineer": {"analytical": 0.9, "technical": 0.9, "organizational": 0.5},
            "doctor": {"analytical": 0.7, "social": 0.9, "scientific": 0.95, "organizational": 0.5},
            "mechanical-engineer": {"analytical": 0.8, "technical": 0.9, "organizational": 0.5},
            "data-scientist": {"analytical": 0.95, "technical": 0.9, "organizational": 0.5},
            "accountant": {"analytical": 0.8, "organizational": 0.9, "technical": 0.4},
            "business-analyst": {"analytical": 0.7, "organizational": 0.8, "social": 0.6},
            "marketing-manager": {"creative": 0.7, "social": 0.8, "verbal": 0.8},
            "chartered-accountant": {"analytical": 0.9, "organizational": 0.9},
            "graphic-designer": {"creative": 0.95, "technical": 0.5},
            "writer": {"verbal": 0.95, "creative": 0.8},
            "psychologist": {"social": 0.95, "verbal": 0.7, "analytical": 0.5},
            "teacher": {"social": 0.9, "verbal": 0.9, "organizational": 0.6},
            "architect": {"creative": 0.8, "analytical": 0.7, "technical": 0.6},
            "lawyer": {"verbal": 0.9, "analytical": 0.8, "social": 0.6},
            "civil-engineer": {"analytical": 0.8, "technical": 0.8, "organizational": 0.6},
        }
        for career in Career.objects.all():
            wmap = weights_map.get(career.slug, {})
            for cat_slug, weight in wmap.items():
                cat = categories.get(cat_slug)
                if cat:
                    CareerCategoryWeight.objects.update_or_create(
                        career=career,
                        category=cat,
                        defaults={"weight": Decimal(str(weight))},
                    )
        self.stdout.write("Weights seeded.")

    def _seed_subject_weights(self):
        """Subject importance per career: math, science, english, social_science."""
        subject_weights_map = {
            "software-engineer": {"math": 0.9, "science": 0.7, "english": 0.4, "social_science": 0.2},
            "doctor": {"math": 0.6, "science": 0.95, "english": 0.5, "social_science": 0.3},
            "mechanical-engineer": {"math": 0.9, "science": 0.9, "english": 0.4, "social_science": 0.2},
            "data-scientist": {"math": 0.95, "science": 0.7, "english": 0.4, "social_science": 0.2},
            "accountant": {"math": 0.9, "science": 0.3, "english": 0.5, "social_science": 0.3},
            "business-analyst": {"math": 0.7, "science": 0.4, "english": 0.6, "social_science": 0.5},
            "marketing-manager": {"math": 0.5, "science": 0.3, "english": 0.8, "social_science": 0.5},
            "chartered-accountant": {"math": 0.95, "science": 0.3, "english": 0.5, "social_science": 0.3},
            "graphic-designer": {"math": 0.3, "science": 0.3, "english": 0.6, "social_science": 0.4},
            "writer": {"math": 0.3, "science": 0.3, "english": 0.95, "social_science": 0.6},
            "psychologist": {"math": 0.5, "science": 0.5, "english": 0.7, "social_science": 0.8},
            "teacher": {"math": 0.6, "science": 0.6, "english": 0.8, "social_science": 0.7},
            "architect": {"math": 0.7, "science": 0.5, "english": 0.5, "social_science": 0.4},
            "lawyer": {"math": 0.5, "science": 0.3, "english": 0.95, "social_science": 0.8},
            "civil-engineer": {"math": 0.85, "science": 0.8, "english": 0.4, "social_science": 0.3},
        }
        for career in Career.objects.all():
            wmap = subject_weights_map.get(career.slug, {})
            for subj, weight in wmap.items():
                CareerSubjectWeight.objects.update_or_create(
                    career=career,
                    subject_slug=subj,
                    defaults={"weight": Decimal(str(weight))},
                )
        self.stdout.write("Subject weights seeded.")
