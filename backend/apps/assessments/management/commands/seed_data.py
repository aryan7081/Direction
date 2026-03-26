"""
Seed categories, questions, careers, and weights for MVP.
Expanded to 120+ careers across 15 buckets.
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

        assessment_sections = [
            ("Interests (RIASEC)", "riasec-interests", "Holland-style interest items (hidden multi-signal scoring)."),
            ("Traits", "work-traits", "Curiosity, persistence, initiative, empathy, planning."),
            ("Personality", "work-personality", "Energy, risk, structure, autonomy."),
        ]
        for name, slug, desc in assessment_sections:
            Category.objects.get_or_create(slug=slug, defaults={"name": name, "description": desc})
        self.stdout.write("Categories seeded.")

    def _seed_questions(self):
        from apps.assessments.content.mcq_items import MCQ_ITEMS

        section_slugs = {"riasec-interests", "work-traits", "work-personality"}
        categories = {c.slug: c for c in Category.objects.filter(slug__in=section_slugs)}
        if len(categories) != 3:
            self.stdout.write(
                self.style.WARNING("Seed categories first; missing RIASEC/trait/personality sections.")
            )
            return

        self.stdout.write("Loading 30-question assessment (RIASEC + traits + personality)...")
        Question.objects.all().delete()

        for i, item in enumerate(MCQ_ITEMS, start=1):
            cat = categories[item["section_category_slug"]]
            q = Question.objects.create(
                category=cat,
                text=item["text"],
                order=i,
                is_active=True,
                metadata=item["metadata"],
            )
            for j, (opt_text, weights) in enumerate(item["options"], start=1):
                AnswerOption.objects.create(
                    question=q,
                    text=opt_text[:500],
                    score=3,
                    order=j,
                    category_weights=weights,
                )
        self.stdout.write(f"Questions seeded ({len(MCQ_ITEMS)} items).")

    def _seed_careers(self):
        # (name, slug, desc, stream, min_ed, salary, growth, education_cost_tier)
        careers_data = [
            # 1. TECH & ENGINEERING (20)
            ("Software Engineer", "software-engineer", "Design and build software applications.", "Science", "B.Tech/B.E.", "₹5-50L", "Very High", "medium"),
            ("Web Developer", "web-developer", "Build and maintain websites and web applications.", "Science", "B.Tech/BCA", "₹3-25L", "Very High", "medium"),
            ("Mobile App Developer", "mobile-app-developer", "Create applications for smartphones and tablets.", "Science", "B.Tech/BCA", "₹4-30L", "Very High", "medium"),
            ("AI Engineer", "ai-engineer", "Build and deploy artificial intelligence systems.", "Science", "B.Tech/M.Tech", "₹8-50L", "Very High", "high"),
            ("Machine Learning Engineer", "machine-learning-engineer", "Develop ML models and algorithms.", "Science", "B.Tech/M.Sc", "₹6-40L", "Very High", "medium"),
            ("Cybersecurity Analyst", "cybersecurity-analyst", "Protect systems and data from cyber threats.", "Science", "B.Tech/BCA", "₹5-25L", "Very High", "medium"),
            ("Cloud Engineer", "cloud-engineer", "Design and manage cloud infrastructure.", "Science", "B.Tech", "₹6-35L", "Very High", "medium"),
            ("DevOps Engineer", "devops-engineer", "Bridge development and operations for faster delivery.", "Science", "B.Tech", "₹5-30L", "Very High", "medium"),
            ("Game Developer", "game-developer", "Create video games and interactive experiences.", "Science", "B.Tech/B.Des", "₹4-25L", "High", "medium"),
            ("Blockchain Developer", "blockchain-developer", "Build decentralized applications and smart contracts.", "Science", "B.Tech", "₹6-40L", "High", "medium"),
            ("Database Administrator", "database-administrator", "Manage and optimize database systems.", "Science", "B.Tech/B.Sc", "₹4-20L", "High", "medium"),
            ("Network Engineer", "network-engineer", "Design and maintain computer networks.", "Science", "B.Tech", "₹4-18L", "High", "medium"),
            ("Embedded Systems Engineer", "embedded-systems-engineer", "Develop software for hardware devices.", "Science", "B.Tech", "₹4-25L", "High", "medium"),
            ("Robotics Engineer", "robotics-engineer", "Design and build robots and automation systems.", "Science", "B.Tech/M.Tech", "₹5-30L", "Very High", "high"),
            ("Electronics Engineer", "electronics-engineer", "Design electronic circuits and systems.", "Science", "B.Tech", "₹4-22L", "High", "medium"),
            ("Electrical Engineer", "electrical-engineer", "Design electrical systems and power distribution.", "Science", "B.Tech", "₹4-20L", "High", "medium"),
            ("Mechatronics Engineer", "mechatronics-engineer", "Combine mechanical, electrical and software engineering.", "Science", "B.Tech", "₹4-25L", "High", "medium"),
            ("Data Scientist", "data-scientist", "Analyze data to extract insights.", "Science", "B.Tech/M.Sc", "₹6-40L", "Very High", "medium"),
            ("Mechanical Engineer", "mechanical-engineer", "Design and develop mechanical systems.", "Science", "B.Tech", "₹4-25L", "High", "medium"),
            ("Civil Engineer", "civil-engineer", "Design and build infrastructure.", "Science", "B.Tech", "₹4-20L", "High", "medium"),
            # 2. ARCHITECTURE & DESIGN (7)
            ("Architect", "architect", "Design buildings and structures.", "Science", "B.Arch", "₹5-30L", "High", "medium"),
            ("Interior Designer", "interior-designer", "Design indoor spaces for homes and offices.", "Arts", "B.Des/Diploma", "₹3-15L", "High", "low"),
            ("Landscape Architect", "landscape-architect", "Design outdoor spaces and environments.", "Science", "B.Arch/B.L.A", "₹4-18L", "High", "medium"),
            ("Urban Planner", "urban-planner", "Plan and design cities and urban areas.", "Science", "B.Plan/M.Plan", "₹4-20L", "High", "medium"),
            ("Industrial Designer", "industrial-designer", "Design products for mass production.", "Science", "B.Des", "₹4-20L", "High", "medium"),
            ("Product Designer", "product-designer", "Design user-centred products and experiences.", "Arts", "B.Des/Any", "₹5-25L", "Very High", "medium"),
            # 3. MEDICAL & HEALTHCARE (11)
            ("Doctor", "doctor", "Diagnose and treat medical conditions.", "Science", "MBBS", "₹8-80L", "High", "high"),
            ("Dentist", "dentist", "Diagnose and treat dental and oral health.", "Science", "BDS", "₹4-30L", "High", "high"),
            ("Pharmacist", "pharmacist", "Dispense medicines and advise on drug use.", "Science", "B.Pharm", "₹3-12L", "Stable", "medium"),
            ("Nurse", "nurse", "Provide patient care and support in healthcare.", "Science", "B.Sc Nursing", "₹3-10L", "High", "low"),
            ("Physiotherapist", "physiotherapist", "Help patients recover movement and function.", "Science", "B.P.T", "₹3-15L", "High", "medium"),
            ("Psychologist", "psychologist", "Study and support mental health.", "Arts", "M.A./M.Sc Psychology", "₹4-20L", "High", "medium"),
            ("Psychiatrist", "psychiatrist", "Diagnose and treat mental health disorders.", "Science", "MBBS + MD", "₹8-50L", "High", "high"),
            ("Nutritionist", "nutritionist", "Advise on diet and nutrition for health.", "Science", "B.Sc/M.Sc Nutrition", "₹3-12L", "High", "low"),
            ("Radiologist", "radiologist", "Interpret medical imaging for diagnosis.", "Science", "MBBS + MD Radiology", "₹10-60L", "High", "high"),
            ("Medical Lab Technician", "medical-lab-technician", "Conduct lab tests for diagnosis.", "Science", "B.Sc/DMLT", "₹2-8L", "Stable", "low"),
            ("Occupational Therapist", "occupational-therapist", "Help people regain daily living skills.", "Science", "B.O.T", "₹3-12L", "High", "medium"),
            ("Speech Therapist", "speech-therapist", "Treat speech and language disorders.", "Science", "B.ASLP", "₹3-15L", "High", "medium"),
            # 4. COMMERCE & BUSINESS (16)
            ("Accountant", "accountant", "Manage financial records and reporting.", "Commerce", "B.Com", "₹3-15L", "Stable", "low"),
            ("Chartered Accountant", "chartered-accountant", "Financial auditing and advisory.", "Commerce", "CA", "₹6-50L", "Stable", "medium"),
            ("Business Analyst", "business-analyst", "Bridge business needs with technology.", "Commerce", "B.Com/MBA", "₹4-20L", "High", "medium"),
            ("Marketing Manager", "marketing-manager", "Plan and execute marketing strategies.", "Commerce", "BBA/MBA", "₹5-25L", "High", "medium"),
            ("Investment Banker", "investment-banker", "Advise on mergers, acquisitions and fundraising.", "Commerce", "MBA/CA", "₹15-80L", "High", "high"),
            ("Financial Analyst", "financial-analyst", "Analyze financial data for investment decisions.", "Commerce", "B.Com/MBA/CFA", "₹5-25L", "High", "medium"),
            ("Stock Trader", "stock-trader", "Buy and sell securities in financial markets.", "Commerce", "B.Com/MBA", "₹5-50L", "Variable", "medium"),
            ("Economist", "economist", "Study economic trends and policy.", "Commerce", "B.A/M.A Economics", "₹5-25L", "Stable", "medium"),
            ("Auditor", "auditor", "Examine financial records for accuracy.", "Commerce", "B.Com/CA", "₹4-18L", "Stable", "medium"),
            ("Risk Manager", "risk-manager", "Identify and mitigate business risks.", "Commerce", "MBA/FRM", "₹6-30L", "High", "medium"),
            ("Insurance Advisor", "insurance-advisor", "Advise clients on insurance products.", "Commerce", "B.Com/Any", "₹3-15L", "Stable", "low"),
            ("Sales Manager", "sales-manager", "Lead sales teams and drive revenue.", "Commerce", "BBA/Any", "₹5-25L", "High", "medium"),
            ("Human Resource Manager", "hr-manager", "Manage recruitment and employee relations.", "Commerce", "BBA/MBA HR", "₹5-20L", "High", "medium"),
            ("Operations Manager", "operations-manager", "Oversee daily business operations.", "Commerce", "BBA/MBA", "₹5-25L", "High", "medium"),
            ("Product Manager", "product-manager", "Define and deliver product strategy.", "Commerce", "B.Tech/MBA", "₹8-40L", "Very High", "medium"),
            ("Entrepreneur", "entrepreneur", "Start and run your own business.", "Commerce", "Any", "Variable", "Variable", "medium"),
            # 5. ARTS & CREATIVE (11)
            ("Graphic Designer", "graphic-designer", "Create visual content for brands.", "Arts", "B.Des/BFA", "₹3-15L", "High", "low"),
            ("Writer", "writer", "Create written content and books.", "Arts", "Any", "₹2-20L", "Variable", "low"),
            ("Animator", "animator", "Create animated content for films and games.", "Arts", "B.Des/Diploma", "₹3-18L", "High", "medium"),
            ("Illustrator", "illustrator", "Create visual illustrations for books and media.", "Arts", "BFA/B.Des", "₹3-15L", "High", "low"),
            ("Fashion Designer", "fashion-designer", "Design clothing and accessories.", "Arts", "NIFT/B.Des", "₹4-25L", "High", "medium"),
            ("Photographer", "photographer", "Capture images for commercial or artistic use.", "Arts", "Diploma/Any", "₹2-15L", "Variable", "low"),
            ("Filmmaker", "filmmaker", "Direct and produce films and videos.", "Arts", "FTII/Any", "₹3-50L", "Variable", "medium"),
            ("Video Editor", "video-editor", "Edit and produce video content.", "Arts", "Diploma/Any", "₹3-15L", "High", "low"),
            ("VFX Artist", "vfx-artist", "Create visual effects for films and games.", "Arts", "B.Des/Diploma", "₹4-25L", "High", "medium"),
            ("UI/UX Designer", "ui-ux-designer", "Design user interfaces and experiences.", "Arts", "B.Des/Any", "₹5-25L", "Very High", "medium"),
            ("Content Creator", "content-creator", "Create digital content for audiences.", "Arts", "Any", "₹2-20L", "High", "low"),
            ("Script Writer", "script-writer", "Write scripts for films, TV and web.", "Arts", "Any", "₹2-15L", "Variable", "low"),
            # 6. MEDIA & COMMUNICATION (6)
            ("Journalist", "journalist", "Research and report news stories.", "Arts", "B.A/M.A Journalism", "₹3-15L", "Stable", "low"),
            ("News Anchor", "news-anchor", "Present news on TV or radio.", "Arts", "B.A Journalism", "₹5-25L", "Stable", "medium"),
            ("Radio Jockey", "radio-jockey", "Host radio shows and engage listeners.", "Arts", "Any", "₹2-12L", "Stable", "low"),
            ("Public Relations Specialist", "pr-specialist", "Manage public image and communications.", "Arts", "B.A/MBA", "₹4-18L", "High", "medium"),
            ("Copywriter", "copywriter", "Write persuasive copy for ads and marketing.", "Arts", "Any", "₹3-15L", "High", "low"),
            ("Social Media Manager", "social-media-manager", "Manage social media presence for brands.", "Arts", "Any", "₹3-15L", "High", "low"),
            # 7. LAW (6)
            ("Lawyer", "lawyer", "Practice law and represent clients.", "Arts", "LLB", "₹4-50L", "High", "medium"),
            ("Corporate Lawyer", "corporate-lawyer", "Handle corporate and business law.", "Arts", "LLB", "₹8-50L", "High", "medium"),
            ("Criminal Lawyer", "criminal-lawyer", "Defend or prosecute in criminal cases.", "Arts", "LLB", "₹4-40L", "High", "medium"),
            ("Judge", "judge", "Preside over court proceedings and deliver verdicts.", "Arts", "LLB + Experience", "₹15-50L", "Stable", "medium"),
            ("Legal Advisor", "legal-advisor", "Provide legal counsel to organisations.", "Arts", "LLB", "₹5-25L", "High", "medium"),
            ("Company Secretary", "company-secretary", "Ensure corporate compliance and governance.", "Commerce", "CS", "₹5-25L", "Stable", "medium"),
            # 8. EDUCATION (5)
            ("Teacher", "teacher", "Educate students in schools.", "Arts", "B.Ed", "₹3-12L", "Stable", "low"),
            ("Professor", "professor", "Teach and research at colleges and universities.", "Arts", "Ph.D", "₹8-25L", "Stable", "high"),
            ("Tutor", "tutor", "Provide one-on-one or small group tuition.", "Arts", "Any", "₹2-15L", "High", "low"),
            ("Education Counselor", "education-counselor", "Guide students on academic and career choices.", "Arts", "B.A/M.A", "₹3-12L", "High", "low"),
            ("Academic Researcher", "academic-researcher", "Conduct research in universities.", "Science", "Ph.D", "₹6-20L", "Stable", "high"),
            # 9. GOVERNMENT & DEFENCE (8)
            ("IAS Officer", "ias-officer", "Administer districts and policy as civil servant.", "Arts", "Graduation + UPSC", "₹8-25L", "Stable", "low"),
            ("IPS Officer", "ips-officer", "Lead police and maintain law and order.", "Arts", "Graduation + UPSC", "₹8-25L", "Stable", "low"),
            ("IFS Officer", "ifs-officer", "Represent India in diplomacy and trade.", "Arts", "Graduation + UPSC", "₹8-25L", "Stable", "low"),
            ("Army Officer", "army-officer", "Lead and serve in the Indian Army.", "Science", "NDA/CDS", "₹8-20L", "Stable", "low"),
            ("Navy Officer", "navy-officer", "Serve in the Indian Navy.", "Science", "NDA/CDS", "₹8-20L", "Stable", "low"),
            ("Air Force Officer", "air-force-officer", "Serve in the Indian Air Force.", "Science", "NDA/CDS", "₹8-20L", "Stable", "low"),
            ("Police Officer", "police-officer", "Enforce law and protect citizens.", "Arts", "Graduation", "₹5-15L", "Stable", "low"),
            ("Intelligence Officer", "intelligence-officer", "Gather and analyse intelligence.", "Science", "Graduation + UPSC", "₹8-20L", "Stable", "low"),
            # 10. SPORTS (5)
            ("Athlete", "athlete", "Compete in sports at professional level.", "Arts", "Any", "Variable", "Variable", "low"),
            ("Coach", "coach", "Train and develop athletes.", "Arts", "Certification/Experience", "₹3-15L", "High", "low"),
            ("Fitness Trainer", "fitness-trainer", "Help clients achieve fitness goals.", "Arts", "Certification", "₹2-10L", "High", "low"),
            ("Sports Analyst", "sports-analyst", "Analyse sports data and performance.", "Science", "B.Sc/MBA", "₹4-15L", "High", "medium"),
            ("Sports Manager", "sports-manager", "Manage sports teams and events.", "Commerce", "BBA/MBA", "₹5-20L", "High", "medium"),
            # 11. AGRICULTURE & ENVIRONMENT (6)
            ("Agricultural Scientist", "agricultural-scientist", "Research to improve farming and crops.", "Science", "B.Sc/M.Sc Agriculture", "₹5-15L", "High", "medium"),
            ("Farmer", "farmer", "Grow crops and manage agricultural operations.", "Science", "Any", "₹2-15L", "Variable", "low"),
            ("Horticulturist", "horticulturist", "Specialise in fruits, vegetables and ornamental plants.", "Science", "B.Sc Horticulture", "₹3-12L", "High", "low"),
            ("Forestry Officer", "forestry-officer", "Manage forests and natural resources.", "Science", "B.Sc Forestry", "₹5-15L", "Stable", "low"),
            ("Environmental Scientist", "environmental-scientist", "Study and protect the environment.", "Science", "B.Sc/M.Sc Env Science", "₹4-18L", "High", "medium"),
            ("Wildlife Biologist", "wildlife-biologist", "Study and conserve wildlife.", "Science", "B.Sc/M.Sc Zoology", "₹4-15L", "High", "medium"),
            # 12. AVIATION & HOSPITALITY (8)
            ("Pilot", "pilot", "Fly aircraft for airlines or defence.", "Science", "Commercial Pilot License", "₹15-80L", "High", "high"),
            ("Cabin Crew", "cabin-crew", "Ensure passenger safety and comfort on flights.", "Arts", "12th + Training", "₹4-12L", "High", "low"),
            ("Air Traffic Controller", "air-traffic-controller", "Manage aircraft movement and safety.", "Science", "Graduation + Training", "₹8-20L", "Stable", "medium"),
            ("Airport Manager", "airport-manager", "Oversee airport operations.", "Commerce", "MBA/Any", "₹8-25L", "High", "medium"),
            ("Hotel Manager", "hotel-manager", "Manage hotel operations and guest experience.", "Commerce", "BHM/MBA", "₹5-20L", "High", "medium"),
            ("Chef", "chef", "Prepare and create culinary experiences.", "Arts", "Diploma/Any", "₹3-20L", "High", "low"),
            ("Event Manager", "event-manager", "Plan and execute events and conferences.", "Commerce", "Any", "₹4-18L", "High", "medium"),
            ("Travel Consultant", "travel-consultant", "Plan trips and advise on travel.", "Commerce", "Any", "₹2-10L", "High", "low"),
            # 13. VOCATIONAL (7)
            ("Electrician", "electrician", "Install and repair electrical systems.", "Science", "ITI/Diploma", "₹2-8L", "Stable", "low"),
            ("Plumber", "plumber", "Install and repair plumbing systems.", "Science", "ITI/Apprenticeship", "₹2-6L", "Stable", "low"),
            ("Carpenter", "carpenter", "Build and repair wooden structures.", "Arts", "ITI/Apprenticeship", "₹2-8L", "Stable", "low"),
            ("Mechanic", "mechanic", "Repair vehicles and machinery.", "Science", "ITI/Diploma", "₹2-8L", "Stable", "low"),
            ("Technician", "technician", "Repair and maintain equipment and devices.", "Science", "ITI/Diploma", "₹2-10L", "Stable", "low"),
            ("Tailor", "tailor", "Design and stitch clothing.", "Arts", "Apprenticeship", "₹2-8L", "Stable", "low"),
            ("Beautician", "beautician", "Provide beauty and grooming services.", "Arts", "Certification", "₹2-10L", "High", "low"),
            # 14. OPERATIONS & LOGISTICS (4)
            ("Supply Chain Manager", "supply-chain-manager", "Manage flow of goods from source to customer.", "Commerce", "MBA/B.Tech", "₹6-25L", "High", "medium"),
            ("Logistics Manager", "logistics-manager", "Oversee transportation and warehousing.", "Commerce", "MBA/B.Com", "₹5-20L", "High", "medium"),
            ("Warehouse Manager", "warehouse-manager", "Manage inventory and warehouse operations.", "Commerce", "Any", "₹4-12L", "Stable", "low"),
            ("Procurement Specialist", "procurement-specialist", "Source and purchase goods and services.", "Commerce", "B.Com/MBA", "₹4-18L", "High", "medium"),
            # 15. NEW-AGE DIGITAL (6)
            ("Digital Marketer", "digital-marketer", "Market brands through digital channels.", "Commerce", "Any", "₹4-20L", "Very High", "low"),
            ("SEO Specialist", "seo-specialist", "Optimise websites for search engines.", "Commerce", "Any", "₹3-15L", "High", "low"),
            ("Growth Hacker", "growth-hacker", "Drive rapid user and revenue growth.", "Commerce", "Any", "₹5-25L", "High", "medium"),
            ("Influencer", "influencer", "Build audience and promote brands online.", "Arts", "Any", "Variable", "High", "low"),
            ("Ethical Hacker", "ethical-hacker", "Test security by simulating cyber attacks.", "Science", "B.Tech/Certification", "₹5-25L", "Very High", "medium"),
            ("No-Code Developer", "no-code-developer", "Build apps without traditional coding.", "Science", "Any", "₹4-20L", "High", "low"),
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
        self.stdout.write(f"Careers seeded ({len(careers_data)} total).")

    def _seed_weights(self):
        categories = {c.slug: c for c in Category.objects.all()}
        # Category weights: analytical, creative, social, organizational, technical, verbal, scientific
        weights_map = {
            # Tech & Engineering
            "software-engineer": {"analytical": 0.9, "technical": 0.9, "organizational": 0.5},
            "web-developer": {"analytical": 0.8, "technical": 0.9, "creative": 0.5},
            "mobile-app-developer": {"analytical": 0.8, "technical": 0.9, "creative": 0.5},
            "ai-engineer": {"analytical": 0.95, "technical": 0.95, "organizational": 0.5},
            "machine-learning-engineer": {"analytical": 0.95, "technical": 0.9, "organizational": 0.5},
            "cybersecurity-analyst": {"analytical": 0.9, "technical": 0.9, "organizational": 0.6},
            "cloud-engineer": {"analytical": 0.8, "technical": 0.95, "organizational": 0.6},
            "devops-engineer": {"analytical": 0.8, "technical": 0.9, "organizational": 0.8},
            "game-developer": {"analytical": 0.7, "technical": 0.9, "creative": 0.8},
            "blockchain-developer": {"analytical": 0.9, "technical": 0.9, "organizational": 0.5},
            "database-administrator": {"analytical": 0.9, "technical": 0.9, "organizational": 0.7},
            "network-engineer": {"analytical": 0.8, "technical": 0.9, "organizational": 0.6},
            "embedded-systems-engineer": {"analytical": 0.9, "technical": 0.95, "organizational": 0.5},
            "robotics-engineer": {"analytical": 0.9, "technical": 0.95, "organizational": 0.6},
            "electronics-engineer": {"analytical": 0.9, "technical": 0.95, "organizational": 0.5},
            "electrical-engineer": {"analytical": 0.85, "technical": 0.9, "organizational": 0.6},
            "mechatronics-engineer": {"analytical": 0.9, "technical": 0.95, "organizational": 0.5},
            "data-scientist": {"analytical": 0.95, "technical": 0.9, "organizational": 0.5},
            "mechanical-engineer": {"analytical": 0.8, "technical": 0.9, "organizational": 0.5},
            "civil-engineer": {"analytical": 0.8, "technical": 0.8, "organizational": 0.6},
            # Architecture & Design
            "architect": {"creative": 0.8, "analytical": 0.7, "technical": 0.6},
            "interior-designer": {"creative": 0.95, "organizational": 0.6, "technical": 0.4},
            "landscape-architect": {"creative": 0.8, "analytical": 0.6, "technical": 0.5},
            "urban-planner": {"analytical": 0.8, "organizational": 0.8, "creative": 0.5},
            "industrial-designer": {"creative": 0.9, "technical": 0.7, "analytical": 0.6},
            "product-designer": {"creative": 0.9, "analytical": 0.7, "social": 0.6},
            # Medical & Healthcare
            "doctor": {"analytical": 0.7, "social": 0.9, "scientific": 0.95, "organizational": 0.5},
            "dentist": {"analytical": 0.7, "technical": 0.7, "social": 0.7, "scientific": 0.8},
            "pharmacist": {"analytical": 0.8, "organizational": 0.7, "scientific": 0.7},
            "nurse": {"social": 0.95, "organizational": 0.8, "scientific": 0.6},
            "physiotherapist": {"social": 0.8, "technical": 0.6, "scientific": 0.7},
            "psychologist": {"social": 0.95, "verbal": 0.7, "analytical": 0.5},
            "psychiatrist": {"analytical": 0.8, "social": 0.8, "scientific": 0.9},
            "nutritionist": {"scientific": 0.8, "social": 0.7, "verbal": 0.6},
            "radiologist": {"analytical": 0.9, "technical": 0.8, "scientific": 0.9},
            "medical-lab-technician": {"technical": 0.8, "analytical": 0.7, "organizational": 0.7},
            "occupational-therapist": {"social": 0.9, "creative": 0.5, "organizational": 0.7},
            "speech-therapist": {"social": 0.9, "verbal": 0.8, "scientific": 0.6},
            # Commerce & Business
            "accountant": {"analytical": 0.8, "organizational": 0.9, "technical": 0.4},
            "chartered-accountant": {"analytical": 0.9, "organizational": 0.9},
            "business-analyst": {"analytical": 0.7, "organizational": 0.8, "social": 0.6},
            "marketing-manager": {"creative": 0.7, "social": 0.8, "verbal": 0.8},
            "investment-banker": {"analytical": 0.9, "organizational": 0.8, "verbal": 0.6},
            "financial-analyst": {"analytical": 0.95, "organizational": 0.7},
            "stock-trader": {"analytical": 0.9, "organizational": 0.6},
            "economist": {"analytical": 0.95, "verbal": 0.7},
            "auditor": {"analytical": 0.9, "organizational": 0.9},
            "risk-manager": {"analytical": 0.9, "organizational": 0.8},
            "insurance-advisor": {"social": 0.8, "verbal": 0.7, "organizational": 0.6},
            "sales-manager": {"social": 0.9, "verbal": 0.8, "organizational": 0.7},
            "hr-manager": {"social": 0.9, "organizational": 0.8, "verbal": 0.7},
            "operations-manager": {"organizational": 0.95, "analytical": 0.7, "social": 0.5},
            "product-manager": {"organizational": 0.8, "analytical": 0.8, "social": 0.7, "verbal": 0.6},
            "entrepreneur": {"organizational": 0.8, "creative": 0.7, "social": 0.6},
            # Arts & Creative
            "graphic-designer": {"creative": 0.95, "technical": 0.5},
            "writer": {"verbal": 0.95, "creative": 0.8},
            "animator": {"creative": 0.95, "technical": 0.6},
            "illustrator": {"creative": 0.95, "verbal": 0.5},
            "fashion-designer": {"creative": 0.95, "organizational": 0.5},
            "photographer": {"creative": 0.9, "technical": 0.5},
            "filmmaker": {"creative": 0.9, "verbal": 0.7, "organizational": 0.6},
            "video-editor": {"creative": 0.8, "technical": 0.7},
            "vfx-artist": {"creative": 0.9, "technical": 0.8},
            "ui-ux-designer": {"creative": 0.8, "analytical": 0.7, "social": 0.6},
            "content-creator": {"creative": 0.8, "verbal": 0.8, "social": 0.7},
            "script-writer": {"verbal": 0.95, "creative": 0.9},
            # Media & Communication
            "journalist": {"verbal": 0.95, "analytical": 0.7, "social": 0.6},
            "news-anchor": {"verbal": 0.95, "social": 0.7, "organizational": 0.5},
            "radio-jockey": {"verbal": 0.9, "creative": 0.6, "social": 0.8},
            "pr-specialist": {"verbal": 0.9, "social": 0.9, "organizational": 0.7},
            "copywriter": {"verbal": 0.95, "creative": 0.8},
            "social-media-manager": {"creative": 0.7, "verbal": 0.7, "social": 0.8},
            # Law
            "lawyer": {"verbal": 0.9, "analytical": 0.8, "social": 0.6},
            "corporate-lawyer": {"verbal": 0.9, "analytical": 0.9, "organizational": 0.7},
            "criminal-lawyer": {"verbal": 0.9, "analytical": 0.8, "social": 0.7},
            "judge": {"analytical": 0.95, "verbal": 0.9, "organizational": 0.8},
            "legal-advisor": {"verbal": 0.9, "analytical": 0.85, "organizational": 0.7},
            "company-secretary": {"analytical": 0.8, "organizational": 0.9, "verbal": 0.6},
            # Education
            "teacher": {"social": 0.9, "verbal": 0.9, "organizational": 0.6},
            "professor": {"analytical": 0.9, "verbal": 0.9, "organizational": 0.7},
            "tutor": {"social": 0.8, "verbal": 0.8, "organizational": 0.6},
            "education-counselor": {"social": 0.9, "verbal": 0.8, "organizational": 0.7},
            "academic-researcher": {"analytical": 0.95, "organizational": 0.7, "verbal": 0.6},
            # Government & Defence
            "ias-officer": {"organizational": 0.9, "verbal": 0.8, "analytical": 0.8, "social": 0.7},
            "ips-officer": {"organizational": 0.8, "social": 0.8, "analytical": 0.7},
            "ifs-officer": {"verbal": 0.9, "social": 0.9, "organizational": 0.8},
            "army-officer": {"organizational": 0.9, "social": 0.8, "analytical": 0.6},
            "navy-officer": {"organizational": 0.9, "technical": 0.7, "analytical": 0.7},
            "air-force-officer": {"organizational": 0.9, "technical": 0.8, "analytical": 0.7},
            "police-officer": {"organizational": 0.8, "social": 0.8, "analytical": 0.6},
            "intelligence-officer": {"analytical": 0.95, "organizational": 0.8, "verbal": 0.6},
            # Sports
            "athlete": {"organizational": 0.7, "analytical": 0.5},
            "coach": {"social": 0.9, "organizational": 0.8, "verbal": 0.7},
            "fitness-trainer": {"social": 0.8, "organizational": 0.7, "scientific": 0.5},
            "sports-analyst": {"analytical": 0.9, "technical": 0.5, "organizational": 0.5},
            "sports-manager": {"organizational": 0.9, "social": 0.8, "verbal": 0.6},
            # Agriculture & Environment
            "agricultural-scientist": {"analytical": 0.9, "scientific": 0.9, "organizational": 0.5},
            "farmer": {"organizational": 0.8, "technical": 0.5},
            "horticulturist": {"scientific": 0.8, "organizational": 0.6, "technical": 0.5},
            "forestry-officer": {"organizational": 0.8, "scientific": 0.7, "analytical": 0.6},
            "environmental-scientist": {"analytical": 0.9, "scientific": 0.95, "organizational": 0.5},
            "wildlife-biologist": {"scientific": 0.95, "analytical": 0.8, "organizational": 0.5},
            # Aviation & Hospitality
            "pilot": {"technical": 0.8, "organizational": 0.9, "analytical": 0.7},
            "cabin-crew": {"social": 0.95, "organizational": 0.8, "verbal": 0.7},
            "air-traffic-controller": {"analytical": 0.9, "organizational": 0.95, "technical": 0.6},
            "airport-manager": {"organizational": 0.9, "social": 0.7, "analytical": 0.6},
            "hotel-manager": {"organizational": 0.9, "social": 0.9, "verbal": 0.6},
            "chef": {"creative": 0.8, "organizational": 0.7, "technical": 0.5},
            "event-manager": {"organizational": 0.95, "social": 0.9, "creative": 0.6},
            "travel-consultant": {"social": 0.8, "verbal": 0.7, "organizational": 0.7},
            # Vocational
            "electrician": {"technical": 0.9, "analytical": 0.6, "organizational": 0.5},
            "plumber": {"technical": 0.8, "organizational": 0.6},
            "carpenter": {"technical": 0.8, "creative": 0.5, "organizational": 0.6},
            "mechanic": {"technical": 0.9, "analytical": 0.6, "organizational": 0.5},
            "technician": {"technical": 0.9, "analytical": 0.6, "organizational": 0.6},
            "tailor": {"creative": 0.7, "technical": 0.7, "organizational": 0.5},
            "beautician": {"creative": 0.6, "social": 0.8, "technical": 0.5},
            # Operations & Logistics
            "supply-chain-manager": {"organizational": 0.95, "analytical": 0.8, "technical": 0.4},
            "logistics-manager": {"organizational": 0.95, "analytical": 0.7},
            "warehouse-manager": {"organizational": 0.9, "analytical": 0.6},
            "procurement-specialist": {"organizational": 0.9, "analytical": 0.7, "verbal": 0.5},
            # New-age Digital
            "digital-marketer": {"creative": 0.8, "verbal": 0.8, "social": 0.7, "analytical": 0.6},
            "seo-specialist": {"analytical": 0.8, "technical": 0.6, "verbal": 0.6},
            "growth-hacker": {"analytical": 0.8, "creative": 0.7, "organizational": 0.6},
            "influencer": {"creative": 0.8, "social": 0.9, "verbal": 0.8},
            "ethical-hacker": {"analytical": 0.95, "technical": 0.95, "organizational": 0.5},
            "no-code-developer": {"analytical": 0.7, "technical": 0.7, "creative": 0.6},
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
            # Tech & Engineering
            "software-engineer": {"math": 0.9, "science": 0.7, "english": 0.4, "social_science": 0.2},
            "web-developer": {"math": 0.7, "science": 0.5, "english": 0.5, "social_science": 0.2},
            "mobile-app-developer": {"math": 0.8, "science": 0.6, "english": 0.4, "social_science": 0.2},
            "ai-engineer": {"math": 0.95, "science": 0.8, "english": 0.4, "social_science": 0.2},
            "machine-learning-engineer": {"math": 0.95, "science": 0.7, "english": 0.4, "social_science": 0.2},
            "cybersecurity-analyst": {"math": 0.8, "science": 0.6, "english": 0.5, "social_science": 0.2},
            "cloud-engineer": {"math": 0.85, "science": 0.6, "english": 0.4, "social_science": 0.2},
            "devops-engineer": {"math": 0.8, "science": 0.6, "english": 0.4, "social_science": 0.2},
            "game-developer": {"math": 0.7, "science": 0.5, "english": 0.5, "social_science": 0.3},
            "blockchain-developer": {"math": 0.9, "science": 0.6, "english": 0.4, "social_science": 0.2},
            "database-administrator": {"math": 0.9, "science": 0.5, "english": 0.4, "social_science": 0.2},
            "network-engineer": {"math": 0.85, "science": 0.7, "english": 0.4, "social_science": 0.2},
            "embedded-systems-engineer": {"math": 0.9, "science": 0.8, "english": 0.4, "social_science": 0.2},
            "robotics-engineer": {"math": 0.95, "science": 0.9, "english": 0.4, "social_science": 0.2},
            "electronics-engineer": {"math": 0.9, "science": 0.9, "english": 0.4, "social_science": 0.2},
            "electrical-engineer": {"math": 0.9, "science": 0.9, "english": 0.4, "social_science": 0.2},
            "mechatronics-engineer": {"math": 0.95, "science": 0.9, "english": 0.4, "social_science": 0.2},
            "data-scientist": {"math": 0.95, "science": 0.7, "english": 0.4, "social_science": 0.2},
            "mechanical-engineer": {"math": 0.9, "science": 0.9, "english": 0.4, "social_science": 0.2},
            "civil-engineer": {"math": 0.85, "science": 0.8, "english": 0.4, "social_science": 0.3},
            # Architecture & Design
            "architect": {"math": 0.7, "science": 0.5, "english": 0.5, "social_science": 0.4},
            "interior-designer": {"math": 0.4, "science": 0.3, "english": 0.6, "social_science": 0.4},
            "landscape-architect": {"math": 0.5, "science": 0.6, "english": 0.5, "social_science": 0.4},
            "urban-planner": {"math": 0.7, "science": 0.5, "english": 0.6, "social_science": 0.7},
            "industrial-designer": {"math": 0.6, "science": 0.5, "english": 0.5, "social_science": 0.4},
            "product-designer": {"math": 0.5, "science": 0.4, "english": 0.6, "social_science": 0.5},
            # Medical & Healthcare
            "doctor": {"math": 0.6, "science": 0.95, "english": 0.5, "social_science": 0.3},
            "dentist": {"math": 0.6, "science": 0.9, "english": 0.5, "social_science": 0.3},
            "pharmacist": {"math": 0.8, "science": 0.9, "english": 0.5, "social_science": 0.3},
            "nurse": {"math": 0.5, "science": 0.7, "english": 0.5, "social_science": 0.4},
            "physiotherapist": {"math": 0.6, "science": 0.8, "english": 0.5, "social_science": 0.4},
            "psychologist": {"math": 0.5, "science": 0.5, "english": 0.7, "social_science": 0.8},
            "psychiatrist": {"math": 0.6, "science": 0.95, "english": 0.6, "social_science": 0.5},
            "nutritionist": {"math": 0.5, "science": 0.8, "english": 0.5, "social_science": 0.4},
            "radiologist": {"math": 0.7, "science": 0.95, "english": 0.5, "social_science": 0.3},
            "medical-lab-technician": {"math": 0.7, "science": 0.9, "english": 0.4, "social_science": 0.3},
            "occupational-therapist": {"math": 0.5, "science": 0.6, "english": 0.6, "social_science": 0.6},
            "speech-therapist": {"math": 0.4, "science": 0.5, "english": 0.9, "social_science": 0.6},
            # Commerce & Business
            "accountant": {"math": 0.9, "science": 0.3, "english": 0.5, "social_science": 0.3},
            "chartered-accountant": {"math": 0.95, "science": 0.3, "english": 0.5, "social_science": 0.3},
            "business-analyst": {"math": 0.7, "science": 0.4, "english": 0.6, "social_science": 0.5},
            "marketing-manager": {"math": 0.5, "science": 0.3, "english": 0.8, "social_science": 0.5},
            "investment-banker": {"math": 0.95, "science": 0.4, "english": 0.7, "social_science": 0.5},
            "financial-analyst": {"math": 0.95, "science": 0.4, "english": 0.6, "social_science": 0.4},
            "stock-trader": {"math": 0.9, "science": 0.4, "english": 0.5, "social_science": 0.4},
            "economist": {"math": 0.9, "science": 0.5, "english": 0.7, "social_science": 0.8},
            "auditor": {"math": 0.9, "science": 0.3, "english": 0.5, "social_science": 0.3},
            "risk-manager": {"math": 0.9, "science": 0.4, "english": 0.6, "social_science": 0.4},
            "insurance-advisor": {"math": 0.6, "science": 0.3, "english": 0.7, "social_science": 0.5},
            "sales-manager": {"math": 0.5, "science": 0.3, "english": 0.7, "social_science": 0.6},
            "hr-manager": {"math": 0.5, "science": 0.3, "english": 0.8, "social_science": 0.8},
            "operations-manager": {"math": 0.7, "science": 0.4, "english": 0.6, "social_science": 0.5},
            "product-manager": {"math": 0.6, "science": 0.4, "english": 0.7, "social_science": 0.5},
            "entrepreneur": {"math": 0.6, "science": 0.4, "english": 0.7, "social_science": 0.6},
            # Arts & Creative
            "graphic-designer": {"math": 0.3, "science": 0.3, "english": 0.6, "social_science": 0.4},
            "writer": {"math": 0.3, "science": 0.3, "english": 0.95, "social_science": 0.6},
            "animator": {"math": 0.5, "science": 0.4, "english": 0.6, "social_science": 0.4},
            "illustrator": {"math": 0.3, "science": 0.3, "english": 0.7, "social_science": 0.4},
            "fashion-designer": {"math": 0.3, "science": 0.3, "english": 0.6, "social_science": 0.4},
            "photographer": {"math": 0.3, "science": 0.4, "english": 0.5, "social_science": 0.4},
            "filmmaker": {"math": 0.3, "science": 0.3, "english": 0.8, "social_science": 0.5},
            "video-editor": {"math": 0.4, "science": 0.4, "english": 0.5, "social_science": 0.3},
            "vfx-artist": {"math": 0.6, "science": 0.5, "english": 0.5, "social_science": 0.3},
            "ui-ux-designer": {"math": 0.5, "science": 0.4, "english": 0.6, "social_science": 0.5},
            "content-creator": {"math": 0.3, "science": 0.3, "english": 0.8, "social_science": 0.5},
            "script-writer": {"math": 0.3, "science": 0.3, "english": 0.95, "social_science": 0.6},
            # Media & Communication
            "journalist": {"math": 0.4, "science": 0.4, "english": 0.95, "social_science": 0.7},
            "news-anchor": {"math": 0.3, "science": 0.3, "english": 0.95, "social_science": 0.5},
            "radio-jockey": {"math": 0.3, "science": 0.3, "english": 0.8, "social_science": 0.6},
            "pr-specialist": {"math": 0.4, "science": 0.3, "english": 0.9, "social_science": 0.7},
            "copywriter": {"math": 0.3, "science": 0.3, "english": 0.95, "social_science": 0.5},
            "social-media-manager": {"math": 0.4, "science": 0.3, "english": 0.8, "social_science": 0.6},
            # Law
            "lawyer": {"math": 0.5, "science": 0.3, "english": 0.95, "social_science": 0.8},
            "corporate-lawyer": {"math": 0.6, "science": 0.3, "english": 0.9, "social_science": 0.6},
            "criminal-lawyer": {"math": 0.5, "science": 0.3, "english": 0.95, "social_science": 0.7},
            "judge": {"math": 0.6, "science": 0.4, "english": 0.95, "social_science": 0.8},
            "legal-advisor": {"math": 0.5, "science": 0.3, "english": 0.9, "social_science": 0.6},
            "company-secretary": {"math": 0.8, "science": 0.3, "english": 0.7, "social_science": 0.5},
            # Education
            "teacher": {"math": 0.6, "science": 0.6, "english": 0.8, "social_science": 0.7},
            "professor": {"math": 0.7, "science": 0.7, "english": 0.8, "social_science": 0.6},
            "tutor": {"math": 0.6, "science": 0.6, "english": 0.7, "social_science": 0.5},
            "education-counselor": {"math": 0.5, "science": 0.5, "english": 0.8, "social_science": 0.8},
            "academic-researcher": {"math": 0.8, "science": 0.8, "english": 0.7, "social_science": 0.6},
            # Government & Defence
            "ias-officer": {"math": 0.6, "science": 0.5, "english": 0.8, "social_science": 0.9},
            "ips-officer": {"math": 0.5, "science": 0.4, "english": 0.7, "social_science": 0.8},
            "ifs-officer": {"math": 0.5, "science": 0.5, "english": 0.9, "social_science": 0.9},
            "army-officer": {"math": 0.6, "science": 0.6, "english": 0.6, "social_science": 0.5},
            "navy-officer": {"math": 0.7, "science": 0.8, "english": 0.6, "social_science": 0.4},
            "air-force-officer": {"math": 0.7, "science": 0.8, "english": 0.6, "social_science": 0.4},
            "police-officer": {"math": 0.5, "science": 0.4, "english": 0.6, "social_science": 0.7},
            "intelligence-officer": {"math": 0.8, "science": 0.6, "english": 0.7, "social_science": 0.6},
            # Sports
            "athlete": {"math": 0.4, "science": 0.5, "english": 0.5, "social_science": 0.4},
            "coach": {"math": 0.5, "science": 0.5, "english": 0.6, "social_science": 0.7},
            "fitness-trainer": {"math": 0.4, "science": 0.6, "english": 0.5, "social_science": 0.5},
            "sports-analyst": {"math": 0.8, "science": 0.5, "english": 0.6, "social_science": 0.5},
            "sports-manager": {"math": 0.6, "science": 0.4, "english": 0.7, "social_science": 0.6},
            # Agriculture & Environment
            "agricultural-scientist": {"math": 0.7, "science": 0.9, "english": 0.5, "social_science": 0.4},
            "farmer": {"math": 0.4, "science": 0.5, "english": 0.4, "social_science": 0.4},
            "horticulturist": {"math": 0.5, "science": 0.8, "english": 0.5, "social_science": 0.3},
            "forestry-officer": {"math": 0.5, "science": 0.8, "english": 0.5, "social_science": 0.5},
            "environmental-scientist": {"math": 0.7, "science": 0.9, "english": 0.6, "social_science": 0.6},
            "wildlife-biologist": {"math": 0.6, "science": 0.95, "english": 0.6, "social_science": 0.5},
            # Aviation & Hospitality
            "pilot": {"math": 0.8, "science": 0.8, "english": 0.6, "social_science": 0.3},
            "cabin-crew": {"math": 0.4, "science": 0.4, "english": 0.8, "social_science": 0.6},
            "air-traffic-controller": {"math": 0.8, "science": 0.6, "english": 0.6, "social_science": 0.3},
            "airport-manager": {"math": 0.6, "science": 0.5, "english": 0.7, "social_science": 0.5},
            "hotel-manager": {"math": 0.5, "science": 0.4, "english": 0.8, "social_science": 0.7},
            "chef": {"math": 0.3, "science": 0.5, "english": 0.5, "social_science": 0.4},
            "event-manager": {"math": 0.5, "science": 0.3, "english": 0.8, "social_science": 0.7},
            "travel-consultant": {"math": 0.4, "science": 0.3, "english": 0.8, "social_science": 0.6},
            # Vocational
            "electrician": {"math": 0.6, "science": 0.7, "english": 0.4, "social_science": 0.2},
            "plumber": {"math": 0.5, "science": 0.5, "english": 0.4, "social_science": 0.2},
            "carpenter": {"math": 0.5, "science": 0.5, "english": 0.4, "social_science": 0.2},
            "mechanic": {"math": 0.6, "science": 0.7, "english": 0.4, "social_science": 0.2},
            "technician": {"math": 0.6, "science": 0.7, "english": 0.4, "social_science": 0.2},
            "tailor": {"math": 0.3, "science": 0.3, "english": 0.5, "social_science": 0.3},
            "beautician": {"math": 0.3, "science": 0.4, "english": 0.5, "social_science": 0.5},
            # Operations & Logistics
            "supply-chain-manager": {"math": 0.8, "science": 0.5, "english": 0.6, "social_science": 0.5},
            "logistics-manager": {"math": 0.7, "science": 0.4, "english": 0.6, "social_science": 0.5},
            "warehouse-manager": {"math": 0.6, "science": 0.4, "english": 0.5, "social_science": 0.4},
            "procurement-specialist": {"math": 0.7, "science": 0.4, "english": 0.6, "social_science": 0.5},
            # New-age Digital
            "digital-marketer": {"math": 0.5, "science": 0.3, "english": 0.8, "social_science": 0.5},
            "seo-specialist": {"math": 0.6, "science": 0.4, "english": 0.7, "social_science": 0.4},
            "growth-hacker": {"math": 0.7, "science": 0.4, "english": 0.7, "social_science": 0.5},
            "influencer": {"math": 0.3, "science": 0.3, "english": 0.8, "social_science": 0.6},
            "ethical-hacker": {"math": 0.9, "science": 0.7, "english": 0.5, "social_science": 0.2},
            "no-code-developer": {"math": 0.6, "science": 0.5, "english": 0.6, "social_science": 0.4},
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
