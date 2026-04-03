"""
Seed categories, questions, careers, and weights for MVP.
Expanded to 120+ careers across 15 buckets.

Career weights now use 15 explicit scoring dimensions:
  RIASEC (6)  + Core Traits (5) + Personality (4)
"""
from decimal import Decimal

from django.core.management.base import BaseCommand

from apps.assessments.models import AnswerOption, Category, Question
from apps.careers.models import Career, CareerCategoryWeight, CareerSubjectWeight

# ── 15-dimension helper ─────────────────────────────────────────────

_DIMS = [
    "riasec_realistic", "riasec_investigative", "riasec_artistic",
    "riasec_social", "riasec_enterprising", "riasec_conventional",
    "trait_curiosity", "trait_persistence", "trait_initiative",
    "trait_empathy_teamwork", "trait_planning",
    "personality_extroversion", "personality_risk_taking",
    "personality_structure", "personality_self_direction",
]


def _p(r, i, a, s, e, c, cur, per, ini, emp, pln, ext, rsk, strc, slf):
    """Build a 15-dimension career profile dict (compact one-liner per career)."""
    return dict(zip(_DIMS, [r, i, a, s, e, c, cur, per, ini, emp, pln, ext, rsk, strc, slf]))


class Command(BaseCommand):
    help = "Seed categories, sample questions, careers, and weights"

    def handle(self, *args, **options):
        self._seed_categories()
        self._seed_questions()
        self._seed_careers()
        self._seed_weights()
        self._seed_subject_weights()
        self.stdout.write(self.style.SUCCESS("Seed complete."))

    # ── Categories ──────────────────────────────────────────────────

    def _seed_categories(self):
        OLD_SCORING_SLUGS = [
            "analytical", "creative", "social", "organizational",
            "technical", "verbal", "scientific",
        ]
        deleted, _ = Category.objects.filter(slug__in=OLD_SCORING_SLUGS).delete()
        if deleted:
            self.stdout.write(f"Cleaned up {deleted} old scoring categories.")

        scoring_cats = [
            # RIASEC
            ("Realistic",       "riasec_realistic",       "Hands-on, mechanical, physical work"),
            ("Investigative",   "riasec_investigative",   "Analytical, intellectual, research"),
            ("Artistic",        "riasec_artistic",        "Creative, original, independent"),
            ("Social",          "riasec_social",          "Helping, teaching, counselling"),
            ("Enterprising",    "riasec_enterprising",    "Leading, persuading, managing"),
            ("Conventional",    "riasec_conventional",    "Organizing, data, attention to detail"),
            # Core traits
            ("Curiosity",       "trait_curiosity",        "Desire to explore and learn"),
            ("Persistence",     "trait_persistence",      "Sticking with difficult tasks"),
            ("Initiative",      "trait_initiative",       "Taking action without being told"),
            ("Empathy & Teamwork", "trait_empathy_teamwork", "Understanding others and collaborating"),
            ("Planning",        "trait_planning",         "Systematic approach and organization"),
            # Personality
            ("Extroversion",    "personality_extroversion",   "Outgoing vs reserved"),
            ("Risk-taking",     "personality_risk_taking",    "Bold vs cautious"),
            ("Structure",       "personality_structure",      "Organized vs flexible"),
            ("Self-direction",  "personality_self_direction", "Autonomous vs externally guided"),
        ]
        for name, slug, desc in scoring_cats:
            Category.objects.get_or_create(slug=slug, defaults={"name": name, "description": desc})

        section_cats = [
            ("Interests (RIASEC)", "riasec-interests", "Holland-style interest items."),
            ("Traits",             "work-traits",      "Curiosity, persistence, initiative, empathy, planning."),
            ("Personality",        "work-personality",  "Energy, risk, structure, autonomy."),
        ]
        for name, slug, desc in section_cats:
            Category.objects.get_or_create(slug=slug, defaults={"name": name, "description": desc})
        self.stdout.write("Categories seeded (15 scoring + 3 sections).")

    # ── Questions ───────────────────────────────────────────────────

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

    # ── Careers ─────────────────────────────────────────────────────

    def _seed_careers(self):
        careers_data = [
            # 1. TECH & ENGINEERING (18)
            ("Software Engineer", "software-engineer", "Build the apps and systems millions use daily — from social media platforms to banking systems to AI assistants.", "Science", "B.Tech/B.E.", "₹5-50L", "Very High", "medium"),
            ("Web & App Developer", "web-developer", "Create websites and mobile apps that people interact with every day — from e-commerce stores to food delivery apps.", "Science", "B.Tech/BCA", "₹3-25L", "Very High", "medium"),
            ("AI Engineer", "ai-engineer", "Build intelligent systems that can see, speak, and think — from ChatGPT-like assistants to self-driving car technology.", "Science", "B.Tech/M.Tech", "₹8-50L", "Very High", "high"),
            ("Machine Learning Engineer", "machine-learning-engineer", "Train computers to learn from data and make predictions — like how Spotify recommends your next favourite song.", "Science", "B.Tech/M.Sc", "₹6-40L", "Very High", "medium"),
            ("Cybersecurity Analyst", "cybersecurity-analyst", "Protect companies and governments from hackers and cyber attacks — the digital world's security guard.", "Science", "B.Tech/BCA", "₹5-25L", "Very High", "medium"),
            ("Cloud & DevOps Engineer", "cloud-devops-engineer", "Build and manage the massive cloud systems that power Netflix, Instagram, and every major app you use.", "Science", "B.Tech", "₹5-35L", "Very High", "medium"),
            ("Game Developer", "game-developer", "Create video games and interactive experiences — from mobile games to AAA titles on PlayStation and PC.", "Science", "B.Tech/B.Des", "₹4-25L", "High", "medium"),
            ("Blockchain Developer", "blockchain-developer", "Build decentralised apps, cryptocurrencies, and smart contracts — the technology behind Web3.", "Science", "B.Tech", "₹6-40L", "High", "medium"),
            ("Database Administrator", "database-administrator", "Manage and protect the massive databases that store everything from your bank balance to your social media posts.", "Science", "B.Tech/B.Sc", "₹4-20L", "High", "medium"),
            ("Network Engineer", "network-engineer", "Design the networks that connect the world — from office Wi-Fi systems to undersea internet cables.", "Science", "B.Tech", "₹4-18L", "High", "medium"),
            ("Robotics Engineer", "robotics-engineer", "Design and build robots for factories, hospitals, and space exploration — where hardware meets intelligence.", "Science", "B.Tech/M.Tech", "₹5-30L", "Very High", "high"),
            ("Electronics & Hardware Engineer", "electronics-hardware-engineer", "Design the chips, circuits, and devices inside your phone, laptop, and every electronic gadget.", "Science", "B.Tech", "₹4-25L", "High", "medium"),
            ("Data Scientist", "data-scientist", "Find hidden patterns in massive datasets — like predicting disease outbreaks or optimising delivery routes.", "Science", "B.Tech/M.Sc", "₹6-40L", "Very High", "medium"),
            ("Data Engineer", "data-engineer", "Build the pipelines and systems that collect, clean, and organise data for companies to make decisions.", "Science", "B.Tech/B.Sc", "₹5-30L", "Very High", "medium"),
            ("Mechanical Engineer", "mechanical-engineer", "Design machines, engines, and manufacturing systems — from car engines to power plants.", "Science", "B.Tech", "₹4-25L", "High", "medium"),
            ("Civil Engineer", "civil-engineer", "Design and build the bridges, roads, buildings, and dams that shape cities and connect people.", "Science", "B.Tech", "₹4-20L", "High", "medium"),
            ("Aerospace Engineer", "aerospace-engineer", "Design aircraft, rockets, and satellites — the engineers behind ISRO missions and commercial aviation.", "Science", "B.Tech/M.Tech", "₹6-35L", "Very High", "high"),
            ("Biomedical Engineer", "biomedical-engineer", "Create medical devices, prosthetics, and health-tech that saves lives — where engineering meets medicine.", "Science", "B.Tech", "₹5-25L", "Very High", "medium"),
            # 2. ARCHITECTURE & DESIGN (6)
            ("Architect", "architect", "Design buildings and spaces that shape how people live, work, and play — from homes to skyscrapers.", "Science", "B.Arch", "₹5-30L", "High", "medium"),
            ("Interior Designer", "interior-designer", "Transform indoor spaces into beautiful, functional environments for homes, offices, and restaurants.", "Arts", "B.Des/Diploma", "₹3-15L", "High", "low"),
            ("Landscape Architect", "landscape-architect", "Design parks, gardens, and outdoor spaces that bring nature into cities.", "Science", "B.Arch/B.L.A", "₹4-18L", "High", "medium"),
            ("Urban Planner", "urban-planner", "Plan how cities grow — deciding where roads, parks, hospitals, and housing should go.", "Science", "B.Plan/M.Plan", "₹4-20L", "High", "medium"),
            ("Industrial Designer", "industrial-designer", "Design everyday products — from furniture to electronics — making them beautiful and functional.", "Science", "B.Des", "₹4-20L", "High", "medium"),
            ("Product Designer", "product-designer", "Design user-centred digital and physical products — the people who make apps and products easy to use.", "Arts", "B.Des/Any", "₹5-25L", "Very High", "medium"),
            # 3. MEDICAL, HEALTHCARE & BIOTECH (13)
            ("Doctor", "doctor", "Save lives by diagnosing illnesses and treating patients — from routine check-ups to life-saving surgeries.", "Science", "MBBS", "₹8-80L", "High", "high"),
            ("Dentist", "dentist", "Protect and restore oral health — from routine cleanings to complex dental surgeries.", "Science", "BDS", "₹4-30L", "High", "high"),
            ("Pharmacist", "pharmacist", "Ensure safe medicine use and develop new drugs that treat diseases and save lives.", "Science", "B.Pharm", "₹3-12L", "Stable", "medium"),
            ("Nurse", "nurse", "Provide hands-on patient care in hospitals and clinics — the backbone of any healthcare system.", "Science", "B.Sc Nursing", "₹3-10L", "High", "low"),
            ("Physiotherapist", "physiotherapist", "Help injured patients recover movement and strength — from sports injuries to post-surgery rehabilitation.", "Science", "B.P.T", "₹3-15L", "High", "medium"),
            ("Psychologist", "psychologist", "Help people understand their minds, overcome anxiety, and build healthier lives through therapy and counselling.", "Arts", "M.A./M.Sc Psychology", "₹4-20L", "High", "medium"),
            ("Psychiatrist", "psychiatrist", "Diagnose and treat serious mental health disorders using therapy and medication — a medical doctor for the mind.", "Science", "MBBS + MD", "₹8-50L", "High", "high"),
            ("Nutritionist", "nutritionist", "Design personalised diet plans and guide people towards healthier eating habits backed by science.", "Science", "B.Sc/M.Sc Nutrition", "₹3-12L", "High", "low"),
            ("Radiologist", "radiologist", "Read X-rays, MRIs, and CT scans to help doctors find and diagnose diseases — the detective of medicine.", "Science", "MBBS + MD Radiology", "₹10-60L", "High", "high"),
            ("Occupational Therapist", "occupational-therapist", "Help people with disabilities or injuries regain the ability to do everyday tasks independently.", "Science", "B.O.T", "₹3-12L", "High", "medium"),
            ("Speech Therapist", "speech-therapist", "Help children and adults overcome speech, language, and swallowing disorders.", "Science", "B.ASLP", "₹3-15L", "High", "medium"),
            ("Biotechnologist", "biotechnologist", "Use biology and technology together to develop vaccines, genetically improved crops, and new medicines.", "Science", "B.Tech/M.Sc Biotech", "₹4-25L", "Very High", "medium"),
            ("Forensic Scientist", "forensic-scientist", "Analyse crime scene evidence using science — from DNA analysis to toxicology — helping solve criminal cases.", "Science", "B.Sc/M.Sc Forensic Science", "₹4-18L", "High", "medium"),
            # 4. COMMERCE & BUSINESS (16)
            ("Accountant", "accountant", "Manage financial records, prepare tax returns, and keep businesses financially healthy.", "Commerce", "B.Com", "₹3-15L", "Stable", "low"),
            ("Chartered Accountant", "chartered-accountant", "Become the trusted financial brain behind businesses — audit their books, save them taxes, and advise on growth.", "Commerce", "CA", "₹6-50L", "Stable", "medium"),
            ("Business Analyst", "business-analyst", "Bridge the gap between business problems and technology solutions using data and strategy.", "Commerce", "B.Com/MBA", "₹4-20L", "High", "medium"),
            ("Marketing Manager", "marketing-manager", "Plan campaigns that make brands famous — from Zomato's quirky ads to Nike's global strategies.", "Commerce", "BBA/MBA", "₹5-25L", "High", "medium"),
            ("Investment Banker", "investment-banker", "Advise companies on billion-rupee mergers, acquisitions, and fundraising deals — the power players of finance.", "Commerce", "MBA/CA", "₹15-80L", "High", "high"),
            ("Financial Analyst", "financial-analyst", "Analyse markets and financial data to help companies and investors make smarter money decisions.", "Commerce", "B.Com/MBA/CFA", "₹5-25L", "High", "medium"),
            ("Stock Trader", "stock-trader", "Buy and sell stocks, bonds, and currencies in fast-moving financial markets — where quick thinking meets data.", "Commerce", "B.Com/MBA", "₹5-50L", "Variable", "medium"),
            ("Economist", "economist", "Study how economies work — from inflation to GDP — and advise governments and organisations on policy.", "Arts", "B.A/M.A Economics", "₹5-25L", "Stable", "medium"),
            ("Risk Manager", "risk-manager", "Identify what could go wrong in a business and create strategies to prevent financial disasters.", "Commerce", "MBA/FRM", "₹6-30L", "High", "medium"),
            ("Sales Manager", "sales-manager", "Lead sales teams, close deals, and drive revenue — the engine behind every company's growth.", "Commerce", "BBA/Any", "₹5-25L", "High", "medium"),
            ("Human Resource Manager", "hr-manager", "Recruit the right people, build great teams, and create workplaces where people love to work.", "Commerce", "BBA/MBA HR", "₹5-20L", "High", "medium"),
            ("Operations Manager", "operations-manager", "Make sure everything runs smoothly — from factory floors to delivery chains to office processes.", "Commerce", "BBA/MBA", "₹5-25L", "High", "medium"),
            ("Product Manager", "product-manager", "Decide what a product should do and why — the person who turns user needs into features that millions use.", "Science", "B.Tech/MBA", "₹8-40L", "Very High", "medium"),
            ("Entrepreneur", "entrepreneur", "Start and grow your own business from scratch — turning an idea into a company that creates value.", "Commerce", "Any", "Variable", "Variable", "medium"),
            ("Management Consultant", "management-consultant", "Advise top companies on strategy, operations, and growth — the problem-solvers CEOs call when they're stuck.", "Commerce", "MBA/B.Tech", "₹8-40L", "Very High", "high"),
            ("Actuarial Scientist", "actuarial-scientist", "Use advanced math and statistics to calculate risk for insurance and finance — one of the highest-paid analytical careers.", "Commerce", "B.Sc/B.Com + Actuarial Exams", "₹6-40L", "High", "medium"),
            # 5. ARTS & CREATIVE (11)
            ("Graphic Designer", "graphic-designer", "Design the logos, posters, brand identities, and illustrations you see everywhere — from Zomato's app to Nike's ads.", "Arts", "B.Des/BFA", "₹3-15L", "High", "low"),
            ("Writer", "writer", "Craft stories, articles, books, and scripts that inform, entertain, or move people — from novels to Netflix screenplays.", "Arts", "Any", "₹2-20L", "Variable", "low"),
            ("Animator", "animator", "Bring characters and stories to life through animation — for films, games, ads, and streaming shows.", "Arts", "B.Des/Diploma", "₹3-18L", "High", "medium"),
            ("Fashion Designer", "fashion-designer", "Design clothing, accessories, and fashion collections that set trends and define personal style.", "Arts", "NIFT/B.Des", "₹4-25L", "High", "medium"),
            ("Photographer", "photographer", "Capture powerful images for brands, media, weddings, and art — telling stories through a lens.", "Arts", "Diploma/Any", "₹2-15L", "Variable", "low"),
            ("Filmmaker", "filmmaker", "Direct and produce films, documentaries, and web series — from Bollywood to independent cinema.", "Arts", "FTII/Any", "₹3-50L", "Variable", "medium"),
            ("Video Editor", "video-editor", "Edit raw footage into polished videos for YouTube, films, ads, and social media content.", "Arts", "Diploma/Any", "₹3-15L", "High", "low"),
            ("VFX Artist", "vfx-artist", "Create the mind-blowing visual effects you see in Marvel movies, Bollywood blockbusters, and video games.", "Arts", "B.Des/Diploma", "₹4-25L", "High", "medium"),
            ("UI/UX Designer", "ui-ux-designer", "Design the look, feel, and experience of apps and websites — making technology intuitive and beautiful.", "Arts", "B.Des/Any", "₹5-25L", "Very High", "medium"),
            ("Content Creator", "content-creator", "Build an audience by creating engaging digital content — videos, podcasts, blogs, and social media.", "Arts", "Any", "₹2-20L", "High", "low"),
            ("Sound Engineer", "sound-engineer", "Record, mix, and produce audio for music, films, podcasts, and live events — the science behind great sound.", "Arts", "Diploma/B.Sc", "₹3-18L", "High", "low"),
            # 6. MEDIA & COMMUNICATION (5)
            ("Journalist", "journalist", "Investigate and report stories that matter — from political corruption to human interest — keeping society informed.", "Arts", "B.A/M.A Journalism", "₹3-15L", "Stable", "low"),
            ("News Anchor", "news-anchor", "Present news on television, delivering complex stories clearly and confidently to millions of viewers.", "Arts", "B.A Journalism", "₹5-25L", "Stable", "medium"),
            ("Public Relations Specialist", "pr-specialist", "Shape how companies and public figures are perceived — managing reputation and crisis communication.", "Arts", "B.A/MBA", "₹4-18L", "High", "medium"),
            ("Copywriter", "copywriter", "Write the words that sell — from catchy taglines to persuasive ads that make people click, buy, and remember.", "Arts", "Any", "₹3-15L", "High", "low"),
            ("Social Media Manager", "social-media-manager", "Build and grow brand presence on Instagram, YouTube, and LinkedIn — creating viral content strategies.", "Arts", "Any", "₹3-15L", "High", "low"),
            # 7. LAW (4)
            ("Lawyer", "lawyer", "Argue cases in court, draft legal documents, and protect people's rights — from criminal defence to civil disputes.", "Arts", "BA LLB/LLB", "₹4-50L", "High", "medium"),
            ("Corporate Lawyer", "corporate-lawyer", "Handle billion-rupee business deals, mergers, and corporate compliance for top companies and law firms.", "Arts", "BA LLB/LLB", "₹8-50L", "High", "medium"),
            ("Judge", "judge", "Deliver justice by presiding over court cases, interpreting law, and delivering verdicts that shape society.", "Arts", "LLB + Experience", "₹15-50L", "Stable", "medium"),
            ("Company Secretary", "company-secretary", "Ensure companies follow all laws and regulations — a critical governance role in every large organisation.", "Commerce", "CS", "₹5-25L", "Stable", "medium"),
            # 8. EDUCATION & RESEARCH (4)
            ("Teacher", "teacher", "Shape young minds by making complex subjects simple and exciting — one of the most impactful professions.", "Arts", "B.Ed", "₹3-12L", "Stable", "low"),
            ("Professor", "professor", "Teach at universities and conduct cutting-edge research that pushes the boundaries of human knowledge.", "Arts", "Ph.D", "₹8-25L", "Stable", "high"),
            ("Education Counselor", "education-counselor", "Guide students on academic choices, career paths, and personal development — shaping their future direction.", "Arts", "B.A/M.A", "₹3-12L", "High", "low"),
            ("Academic Researcher", "academic-researcher", "Conduct original research in labs and universities, publishing discoveries that advance science and society.", "Science", "Ph.D", "₹6-20L", "Stable", "high"),
            # 9. GOVERNMENT & DEFENCE (4)
            ("Civil Services Officer", "civil-services-officer", "Run districts, shape national policy, and represent India abroad — IAS, IPS, and IFS through UPSC.", "Arts", "Graduation + UPSC", "₹8-25L", "Stable", "low"),
            ("Defence Officer", "defence-officer", "Lead and serve in the Indian Army, Navy, or Air Force — protecting the nation with honour and discipline.", "Science", "NDA/CDS/AFCAT", "₹8-20L", "Stable", "low"),
            ("Police Officer", "police-officer", "Maintain law and order, investigate crimes, and protect citizens at the city and state level.", "Arts", "Graduation", "₹5-15L", "Stable", "low"),
            ("Intelligence Officer", "intelligence-officer", "Gather and analyse intelligence to protect national security — one of the most secretive and strategic roles.", "Science", "Graduation + UPSC", "₹8-20L", "Stable", "low"),
            # 10. SPORTS (5)
            ("Athlete", "athlete", "Compete at the highest level in your sport — representing your state, country, or playing in professional leagues.", "Arts", "Any", "Variable", "Variable", "low"),
            ("Coach", "coach", "Train and develop athletes to reach their full potential — from school teams to Olympic squads.", "Arts", "Certification/Experience", "₹3-15L", "High", "low"),
            ("Fitness Trainer", "fitness-trainer", "Help people achieve their fitness and health goals through personalised training programmes.", "Arts", "Certification", "₹2-10L", "High", "low"),
            ("Sports Analyst", "sports-analyst", "Use data and video analysis to improve team performance — the brains behind modern sports strategy.", "Science", "B.Sc/MBA", "₹4-15L", "High", "medium"),
            ("Sports Manager", "sports-manager", "Manage sports teams, events, and athlete careers — the business side of the sports industry.", "Commerce", "BBA/MBA", "₹5-20L", "High", "medium"),
            # 11. AGRICULTURE & ENVIRONMENT (5)
            ("Agricultural Scientist", "agricultural-scientist", "Research new farming techniques, develop better crop varieties, and help feed a growing population.", "Science", "B.Sc/M.Sc Agriculture", "₹5-15L", "High", "medium"),
            ("Horticulturist", "horticulturist", "Specialise in growing fruits, vegetables, and ornamental plants — from gardens to commercial farms.", "Science", "B.Sc Horticulture", "₹3-12L", "High", "low"),
            ("Forestry Officer", "forestry-officer", "Protect and manage India's forests, wildlife reserves, and natural resources.", "Science", "B.Sc Forestry", "₹5-15L", "Stable", "low"),
            ("Environmental Scientist", "environmental-scientist", "Study pollution, climate change, and ecosystems to find solutions that protect our planet.", "Science", "B.Sc/M.Sc Env Science", "₹4-18L", "High", "medium"),
            ("Wildlife Biologist", "wildlife-biologist", "Study and conserve endangered species and their habitats — from tigers to coral reefs.", "Science", "B.Sc/M.Sc Zoology", "₹4-15L", "High", "medium"),
            # 12. AVIATION & HOSPITALITY (5)
            ("Pilot", "pilot", "Fly commercial aircraft carrying hundreds of passengers, or serve as a fighter pilot in the Air Force.", "Science", "Commercial Pilot License", "₹15-80L", "High", "high"),
            ("Air Traffic Controller", "air-traffic-controller", "Guide aircraft safely through the sky and coordinate takeoffs and landings — lives depend on your precision.", "Science", "Graduation + Training", "₹8-20L", "Stable", "medium"),
            ("Airport Manager", "airport-manager", "Oversee all operations at an airport — from security to logistics to passenger experience.", "Commerce", "MBA/Any", "₹8-25L", "High", "medium"),
            ("Hotel Manager", "hotel-manager", "Run hotels and resorts — managing everything from guest experience to staff to revenue.", "Commerce", "BHM/MBA", "₹5-20L", "High", "medium"),
            ("Event Manager", "event-manager", "Plan and execute events — from corporate conferences to music festivals to weddings.", "Commerce", "Any", "₹4-18L", "High", "medium"),
            # 13. OPERATIONS & LOGISTICS (3)
            ("Supply Chain Manager", "supply-chain-manager", "Manage the flow of goods from factory to customer — ensuring products reach you on time, every time.", "Commerce", "MBA/B.Tech", "₹6-25L", "High", "medium"),
            ("Logistics Manager", "logistics-manager", "Coordinate transportation, warehousing, and delivery at scale — the backbone of e-commerce.", "Commerce", "MBA/B.Com", "₹5-20L", "High", "medium"),
            ("Procurement Specialist", "procurement-specialist", "Source and negotiate the best deals on materials and services that companies need to operate.", "Commerce", "B.Com/MBA", "₹4-18L", "High", "medium"),
            # 14. NEW-AGE DIGITAL (5)
            ("Digital Marketer", "digital-marketer", "Promote brands through Google, Instagram, and YouTube — using data to reach the right people at the right time.", "Commerce", "Any", "₹4-20L", "Very High", "low"),
            ("SEO Specialist", "seo-specialist", "Make websites rank #1 on Google — understanding algorithms and content strategy to drive organic traffic.", "Commerce", "Any", "₹3-15L", "High", "low"),
            ("Growth Hacker", "growth-hacker", "Drive explosive user growth for startups using creative experiments, data, and unconventional strategies.", "Commerce", "Any", "₹5-25L", "High", "medium"),
            ("Influencer", "influencer", "Build a personal brand and loyal audience on social media — turning content into a full-time career.", "Arts", "Any", "Variable", "High", "low"),
            ("Ethical Hacker", "ethical-hacker", "Test security by hacking into systems (legally) to find vulnerabilities before criminals do.", "Science", "B.Tech/Certification", "₹5-25L", "Very High", "medium"),
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

    # ── 15-dimension career weights ─────────────────────────────────

    def _seed_weights(self):
        categories = {c.slug: c for c in Category.objects.filter(slug__in=_DIMS)}
        if len(categories) < 15:
            self.stdout.write(self.style.WARNING("Run seed_categories first – missing scoring dims."))
            return

        CareerCategoryWeight.objects.all().delete()

        #                                    R     I     A     S     E     C    cur   per   ini   emp   pln   ext   rsk   str   slf
        weights_map = {
            # ── TECH & ENGINEERING ──────────────────────────────────
            "software-engineer":          _p(0.50, 0.90, 0.30, 0.20, 0.30, 0.60, 0.90, 0.80, 0.70, 0.40, 0.70, 0.30, 0.50, 0.70, 0.80),
            "web-developer":              _p(0.45, 0.80, 0.50, 0.25, 0.30, 0.50, 0.80, 0.70, 0.70, 0.40, 0.60, 0.35, 0.50, 0.60, 0.80),
            "ai-engineer":                _p(0.40, 0.95, 0.25, 0.20, 0.30, 0.55, 0.95, 0.85, 0.70, 0.30, 0.70, 0.25, 0.55, 0.70, 0.90),
            "machine-learning-engineer":  _p(0.40, 0.95, 0.20, 0.20, 0.25, 0.60, 0.90, 0.85, 0.65, 0.30, 0.75, 0.25, 0.50, 0.75, 0.85),
            "cybersecurity-analyst":      _p(0.50, 0.90, 0.15, 0.20, 0.30, 0.70, 0.85, 0.80, 0.75, 0.30, 0.80, 0.25, 0.60, 0.80, 0.75),
            "cloud-devops-engineer":      _p(0.55, 0.80, 0.15, 0.28, 0.33, 0.70, 0.80, 0.78, 0.65, 0.40, 0.80, 0.33, 0.43, 0.80, 0.70),
            "game-developer":             _p(0.50, 0.70, 0.75, 0.20, 0.30, 0.40, 0.85, 0.70, 0.70, 0.35, 0.55, 0.30, 0.60, 0.50, 0.80),
            "blockchain-developer":       _p(0.40, 0.90, 0.20, 0.15, 0.40, 0.60, 0.90, 0.80, 0.75, 0.25, 0.65, 0.25, 0.70, 0.65, 0.90),
            "database-administrator":     _p(0.55, 0.80, 0.10, 0.20, 0.20, 0.90, 0.65, 0.80, 0.50, 0.30, 0.90, 0.20, 0.20, 0.90, 0.60),
            "network-engineer":           _p(0.65, 0.75, 0.10, 0.20, 0.20, 0.75, 0.65, 0.75, 0.55, 0.30, 0.80, 0.25, 0.30, 0.85, 0.65),
            "robotics-engineer":          _p(0.80, 0.90, 0.35, 0.15, 0.25, 0.50, 0.90, 0.85, 0.75, 0.30, 0.70, 0.25, 0.60, 0.65, 0.80),
            "electronics-hardware-engineer": _p(0.80, 0.84, 0.20, 0.16, 0.23, 0.60, 0.80, 0.81, 0.58, 0.26, 0.71, 0.24, 0.38, 0.80, 0.76),
            "data-scientist":             _p(0.30, 0.95, 0.25, 0.20, 0.30, 0.60, 0.95, 0.80, 0.65, 0.30, 0.70, 0.30, 0.50, 0.70, 0.85),
            "data-engineer":              _p(0.45, 0.85, 0.10, 0.20, 0.30, 0.75, 0.80, 0.80, 0.60, 0.30, 0.85, 0.25, 0.35, 0.85, 0.75),
            "mechanical-engineer":        _p(0.85, 0.80, 0.25, 0.20, 0.25, 0.55, 0.70, 0.80, 0.55, 0.30, 0.70, 0.30, 0.40, 0.75, 0.70),
            "civil-engineer":             _p(0.80, 0.70, 0.30, 0.30, 0.35, 0.60, 0.65, 0.80, 0.55, 0.40, 0.80, 0.40, 0.35, 0.80, 0.65),
            "aerospace-engineer":         _p(0.70, 0.90, 0.20, 0.15, 0.25, 0.55, 0.90, 0.90, 0.65, 0.25, 0.75, 0.25, 0.50, 0.80, 0.80),
            "biomedical-engineer":        _p(0.60, 0.90, 0.20, 0.55, 0.25, 0.55, 0.90, 0.85, 0.60, 0.60, 0.75, 0.35, 0.40, 0.75, 0.75),
            # ── ARCHITECTURE & DESIGN ──────────────────────────────
            "architect":                  _p(0.55, 0.70, 0.80, 0.30, 0.40, 0.50, 0.80, 0.80, 0.65, 0.40, 0.80, 0.40, 0.50, 0.70, 0.80),
            "interior-designer":          _p(0.35, 0.30, 0.95, 0.50, 0.40, 0.30, 0.75, 0.60, 0.65, 0.55, 0.55, 0.50, 0.45, 0.40, 0.75),
            "landscape-architect":        _p(0.55, 0.55, 0.80, 0.30, 0.30, 0.50, 0.70, 0.70, 0.55, 0.35, 0.70, 0.35, 0.40, 0.60, 0.70),
            "urban-planner":              _p(0.40, 0.70, 0.45, 0.50, 0.50, 0.70, 0.80, 0.70, 0.65, 0.55, 0.85, 0.45, 0.35, 0.80, 0.65),
            "industrial-designer":        _p(0.55, 0.60, 0.90, 0.25, 0.35, 0.40, 0.80, 0.70, 0.70, 0.35, 0.60, 0.35, 0.50, 0.50, 0.80),
            "product-designer":           _p(0.35, 0.55, 0.85, 0.55, 0.45, 0.30, 0.85, 0.65, 0.75, 0.55, 0.55, 0.50, 0.55, 0.40, 0.80),
            # ── MEDICAL, HEALTHCARE & BIOTECH ─────────────────────
            "doctor":                     _p(0.50, 0.85, 0.20, 0.90, 0.35, 0.50, 0.80, 0.90, 0.60, 0.90, 0.80, 0.50, 0.40, 0.80, 0.60),
            "dentist":                    _p(0.60, 0.70, 0.25, 0.70, 0.30, 0.55, 0.70, 0.80, 0.55, 0.75, 0.75, 0.45, 0.30, 0.80, 0.60),
            "pharmacist":                 _p(0.40, 0.80, 0.15, 0.50, 0.25, 0.75, 0.70, 0.75, 0.45, 0.55, 0.80, 0.35, 0.20, 0.85, 0.55),
            "nurse":                      _p(0.40, 0.50, 0.15, 0.95, 0.25, 0.60, 0.55, 0.80, 0.50, 0.95, 0.75, 0.50, 0.30, 0.75, 0.40),
            "physiotherapist":            _p(0.55, 0.55, 0.25, 0.80, 0.25, 0.50, 0.65, 0.75, 0.55, 0.85, 0.65, 0.50, 0.30, 0.65, 0.55),
            "psychologist":               _p(0.15, 0.75, 0.25, 0.95, 0.25, 0.40, 0.85, 0.75, 0.50, 0.95, 0.60, 0.40, 0.30, 0.50, 0.70),
            "psychiatrist":               _p(0.20, 0.85, 0.20, 0.85, 0.30, 0.50, 0.85, 0.85, 0.55, 0.90, 0.70, 0.40, 0.35, 0.65, 0.65),
            "nutritionist":               _p(0.30, 0.70, 0.20, 0.75, 0.25, 0.50, 0.70, 0.65, 0.50, 0.75, 0.65, 0.45, 0.25, 0.65, 0.55),
            "radiologist":                _p(0.40, 0.90, 0.15, 0.40, 0.25, 0.65, 0.80, 0.80, 0.45, 0.45, 0.75, 0.25, 0.30, 0.80, 0.65),
            "occupational-therapist":     _p(0.40, 0.50, 0.35, 0.90, 0.25, 0.55, 0.65, 0.70, 0.55, 0.90, 0.65, 0.50, 0.30, 0.60, 0.55),
            "speech-therapist":           _p(0.20, 0.50, 0.30, 0.90, 0.25, 0.45, 0.70, 0.75, 0.50, 0.90, 0.60, 0.45, 0.25, 0.55, 0.55),
            "biotechnologist":            _p(0.55, 0.90, 0.15, 0.35, 0.25, 0.55, 0.90, 0.85, 0.60, 0.35, 0.70, 0.30, 0.45, 0.70, 0.80),
            "forensic-scientist":         _p(0.50, 0.90, 0.10, 0.35, 0.25, 0.70, 0.90, 0.85, 0.60, 0.40, 0.80, 0.30, 0.40, 0.80, 0.70),
            # ── COMMERCE & BUSINESS ────────────────────────────────
            "accountant":                 _p(0.20, 0.50, 0.10, 0.30, 0.30, 0.95, 0.35, 0.75, 0.40, 0.35, 0.90, 0.25, 0.15, 0.95, 0.50),
            "chartered-accountant":       _p(0.20, 0.70, 0.10, 0.30, 0.45, 0.95, 0.55, 0.90, 0.55, 0.30, 0.90, 0.30, 0.20, 0.95, 0.65),
            "business-analyst":           _p(0.25, 0.75, 0.25, 0.55, 0.50, 0.65, 0.80, 0.70, 0.60, 0.55, 0.75, 0.45, 0.40, 0.70, 0.65),
            "marketing-manager":          _p(0.15, 0.40, 0.65, 0.70, 0.80, 0.40, 0.75, 0.65, 0.80, 0.60, 0.65, 0.80, 0.65, 0.50, 0.70),
            "investment-banker":          _p(0.15, 0.80, 0.15, 0.40, 0.85, 0.70, 0.70, 0.90, 0.80, 0.30, 0.75, 0.55, 0.80, 0.70, 0.75),
            "financial-analyst":          _p(0.15, 0.85, 0.10, 0.25, 0.45, 0.80, 0.75, 0.80, 0.55, 0.25, 0.80, 0.30, 0.50, 0.85, 0.70),
            "stock-trader":               _p(0.15, 0.75, 0.10, 0.20, 0.65, 0.55, 0.70, 0.70, 0.80, 0.20, 0.55, 0.40, 0.90, 0.40, 0.90),
            "economist":                  _p(0.15, 0.90, 0.15, 0.35, 0.35, 0.65, 0.90, 0.80, 0.50, 0.40, 0.70, 0.35, 0.40, 0.70, 0.80),
            "risk-manager":               _p(0.20, 0.80, 0.10, 0.35, 0.50, 0.80, 0.75, 0.80, 0.60, 0.35, 0.85, 0.35, 0.55, 0.85, 0.70),
            "sales-manager":              _p(0.15, 0.30, 0.25, 0.75, 0.90, 0.40, 0.55, 0.75, 0.85, 0.65, 0.65, 0.90, 0.65, 0.50, 0.70),
            "hr-manager":                 _p(0.15, 0.40, 0.20, 0.90, 0.65, 0.60, 0.60, 0.65, 0.60, 0.90, 0.75, 0.70, 0.35, 0.65, 0.55),
            "operations-manager":         _p(0.30, 0.55, 0.15, 0.50, 0.65, 0.80, 0.55, 0.80, 0.70, 0.50, 0.90, 0.50, 0.40, 0.90, 0.60),
            "product-manager":            _p(0.20, 0.65, 0.40, 0.65, 0.75, 0.50, 0.85, 0.70, 0.80, 0.65, 0.75, 0.60, 0.55, 0.60, 0.75),
            "entrepreneur":               _p(0.30, 0.55, 0.55, 0.55, 0.90, 0.40, 0.85, 0.90, 0.95, 0.50, 0.65, 0.70, 0.85, 0.40, 0.95),
            "management-consultant":      _p(0.15, 0.80, 0.25, 0.60, 0.85, 0.60, 0.85, 0.85, 0.80, 0.55, 0.80, 0.65, 0.60, 0.70, 0.75),
            "actuarial-scientist":        _p(0.15, 0.90, 0.10, 0.20, 0.35, 0.85, 0.80, 0.90, 0.50, 0.20, 0.90, 0.25, 0.45, 0.90, 0.70),
            # ── ARTS & CREATIVE ────────────────────────────────────
            "graphic-designer":           _p(0.25, 0.25, 0.95, 0.30, 0.20, 0.25, 0.70, 0.60, 0.65, 0.35, 0.50, 0.35, 0.50, 0.35, 0.80),
            "writer":                     _p(0.10, 0.55, 0.90, 0.35, 0.20, 0.25, 0.85, 0.75, 0.60, 0.45, 0.50, 0.20, 0.45, 0.35, 0.90),
            "animator":                   _p(0.35, 0.40, 0.90, 0.25, 0.20, 0.30, 0.75, 0.70, 0.60, 0.35, 0.55, 0.25, 0.45, 0.45, 0.75),
            "fashion-designer":           _p(0.30, 0.35, 0.95, 0.45, 0.55, 0.30, 0.75, 0.65, 0.75, 0.40, 0.55, 0.55, 0.60, 0.40, 0.80),
            "photographer":               _p(0.40, 0.30, 0.90, 0.30, 0.30, 0.20, 0.70, 0.55, 0.65, 0.30, 0.40, 0.35, 0.55, 0.25, 0.85),
            "filmmaker":                  _p(0.35, 0.40, 0.90, 0.50, 0.55, 0.30, 0.80, 0.75, 0.80, 0.50, 0.65, 0.55, 0.65, 0.40, 0.80),
            "video-editor":               _p(0.40, 0.35, 0.80, 0.25, 0.20, 0.40, 0.65, 0.70, 0.50, 0.30, 0.60, 0.25, 0.35, 0.55, 0.75),
            "vfx-artist":                 _p(0.40, 0.50, 0.85, 0.20, 0.20, 0.35, 0.75, 0.70, 0.55, 0.30, 0.55, 0.25, 0.45, 0.50, 0.75),
            "ui-ux-designer":             _p(0.25, 0.55, 0.85, 0.60, 0.35, 0.35, 0.80, 0.65, 0.65, 0.65, 0.55, 0.40, 0.45, 0.45, 0.75),
            "content-creator":            _p(0.20, 0.35, 0.80, 0.65, 0.55, 0.25, 0.70, 0.55, 0.75, 0.55, 0.45, 0.70, 0.60, 0.30, 0.85),
            "sound-engineer":             _p(0.55, 0.50, 0.80, 0.30, 0.25, 0.35, 0.70, 0.70, 0.60, 0.30, 0.55, 0.35, 0.45, 0.50, 0.80),
            # ── MEDIA & COMMUNICATION ──────────────────────────────
            "journalist":                 _p(0.15, 0.60, 0.50, 0.65, 0.45, 0.40, 0.85, 0.70, 0.80, 0.55, 0.55, 0.60, 0.60, 0.40, 0.75),
            "news-anchor":                _p(0.10, 0.40, 0.35, 0.65, 0.60, 0.45, 0.65, 0.65, 0.65, 0.50, 0.60, 0.85, 0.45, 0.55, 0.55),
            "pr-specialist":              _p(0.10, 0.35, 0.40, 0.85, 0.70, 0.55, 0.60, 0.65, 0.65, 0.70, 0.70, 0.75, 0.40, 0.60, 0.55),
            "copywriter":                 _p(0.10, 0.40, 0.85, 0.35, 0.40, 0.35, 0.75, 0.65, 0.60, 0.35, 0.50, 0.35, 0.40, 0.40, 0.80),
            "social-media-manager":       _p(0.15, 0.35, 0.65, 0.70, 0.65, 0.40, 0.70, 0.55, 0.70, 0.55, 0.55, 0.75, 0.55, 0.40, 0.70),
            # ── LAW ────────────────────────────────────────────────
            "lawyer":                     _p(0.10, 0.70, 0.25, 0.60, 0.55, 0.60, 0.75, 0.85, 0.70, 0.55, 0.75, 0.55, 0.50, 0.70, 0.70),
            "corporate-lawyer":           _p(0.10, 0.75, 0.15, 0.45, 0.65, 0.75, 0.70, 0.85, 0.65, 0.40, 0.80, 0.50, 0.45, 0.80, 0.65),
            "judge":                      _p(0.10, 0.80, 0.15, 0.60, 0.45, 0.80, 0.75, 0.90, 0.55, 0.55, 0.85, 0.40, 0.30, 0.90, 0.80),
            "company-secretary":          _p(0.10, 0.55, 0.10, 0.35, 0.40, 0.90, 0.55, 0.80, 0.45, 0.35, 0.90, 0.30, 0.20, 0.90, 0.50),
            # ── EDUCATION & RESEARCH ──────────────────────────────
            "teacher":                    _p(0.15, 0.45, 0.35, 0.90, 0.35, 0.50, 0.70, 0.70, 0.55, 0.90, 0.65, 0.60, 0.25, 0.60, 0.50),
            "professor":                  _p(0.20, 0.85, 0.30, 0.70, 0.35, 0.50, 0.90, 0.85, 0.60, 0.65, 0.70, 0.45, 0.35, 0.65, 0.80),
            "education-counselor":        _p(0.10, 0.45, 0.25, 0.95, 0.40, 0.45, 0.65, 0.60, 0.55, 0.95, 0.60, 0.60, 0.25, 0.50, 0.50),
            "academic-researcher":        _p(0.30, 0.95, 0.25, 0.30, 0.25, 0.55, 0.95, 0.90, 0.60, 0.30, 0.70, 0.25, 0.40, 0.70, 0.90),
            # ── GOVERNMENT & DEFENCE ───────────────────────────────
            "civil-services-officer":     _p(0.25, 0.58, 0.20, 0.72, 0.70, 0.68, 0.67, 0.87, 0.73, 0.67, 0.78, 0.63, 0.43, 0.75, 0.60),
            "defence-officer":            _p(0.77, 0.52, 0.15, 0.55, 0.62, 0.65, 0.55, 0.92, 0.80, 0.58, 0.80, 0.50, 0.67, 0.85, 0.52),
            "police-officer":             _p(0.55, 0.40, 0.15, 0.65, 0.55, 0.60, 0.45, 0.80, 0.70, 0.60, 0.70, 0.55, 0.50, 0.75, 0.45),
            "intelligence-officer":       _p(0.30, 0.85, 0.20, 0.35, 0.40, 0.65, 0.85, 0.85, 0.70, 0.35, 0.75, 0.30, 0.55, 0.70, 0.75),
            # ── SPORTS ─────────────────────────────────────────────
            "athlete":                    _p(0.90, 0.25, 0.15, 0.35, 0.40, 0.35, 0.50, 0.95, 0.85, 0.40, 0.55, 0.55, 0.70, 0.50, 0.75),
            "coach":                      _p(0.50, 0.35, 0.25, 0.85, 0.60, 0.45, 0.60, 0.80, 0.70, 0.85, 0.70, 0.70, 0.45, 0.60, 0.60),
            "fitness-trainer":            _p(0.65, 0.30, 0.20, 0.80, 0.50, 0.35, 0.50, 0.70, 0.65, 0.75, 0.55, 0.75, 0.40, 0.45, 0.60),
            "sports-analyst":             _p(0.25, 0.80, 0.20, 0.35, 0.35, 0.65, 0.80, 0.70, 0.50, 0.30, 0.70, 0.30, 0.40, 0.75, 0.70),
            "sports-manager":             _p(0.25, 0.35, 0.20, 0.65, 0.80, 0.60, 0.55, 0.70, 0.70, 0.60, 0.75, 0.65, 0.45, 0.65, 0.60),
            # ── AGRICULTURE & ENVIRONMENT ──────────────────────────
            "agricultural-scientist":     _p(0.65, 0.85, 0.20, 0.30, 0.25, 0.50, 0.85, 0.80, 0.55, 0.35, 0.65, 0.30, 0.40, 0.65, 0.75),
            "horticulturist":             _p(0.70, 0.65, 0.30, 0.30, 0.20, 0.45, 0.70, 0.70, 0.50, 0.30, 0.60, 0.30, 0.30, 0.60, 0.65),
            "forestry-officer":           _p(0.65, 0.55, 0.15, 0.40, 0.35, 0.55, 0.60, 0.75, 0.55, 0.40, 0.70, 0.35, 0.35, 0.70, 0.55),
            "environmental-scientist":    _p(0.50, 0.85, 0.25, 0.40, 0.30, 0.50, 0.85, 0.80, 0.55, 0.45, 0.65, 0.35, 0.35, 0.65, 0.75),
            "wildlife-biologist":         _p(0.65, 0.85, 0.25, 0.30, 0.20, 0.40, 0.90, 0.80, 0.55, 0.35, 0.55, 0.25, 0.45, 0.50, 0.80),
            # ── AVIATION & HOSPITALITY ─────────────────────────────
            "pilot":                      _p(0.75, 0.55, 0.15, 0.30, 0.40, 0.70, 0.60, 0.85, 0.60, 0.40, 0.85, 0.40, 0.55, 0.90, 0.55),
            "air-traffic-controller":     _p(0.30, 0.70, 0.10, 0.30, 0.35, 0.90, 0.60, 0.90, 0.55, 0.30, 0.95, 0.25, 0.30, 0.95, 0.50),
            "airport-manager":            _p(0.25, 0.45, 0.15, 0.60, 0.70, 0.75, 0.55, 0.75, 0.65, 0.55, 0.85, 0.55, 0.35, 0.80, 0.55),
            "hotel-manager":              _p(0.20, 0.35, 0.30, 0.85, 0.75, 0.60, 0.55, 0.70, 0.70, 0.80, 0.80, 0.75, 0.35, 0.65, 0.55),
            "event-manager":              _p(0.15, 0.30, 0.55, 0.80, 0.80, 0.55, 0.60, 0.70, 0.80, 0.70, 0.80, 0.80, 0.50, 0.60, 0.55),
            # ── OPERATIONS & LOGISTICS ─────────────────────────────
            "supply-chain-manager":       _p(0.30, 0.55, 0.10, 0.45, 0.60, 0.85, 0.60, 0.75, 0.65, 0.45, 0.90, 0.45, 0.35, 0.90, 0.60),
            "logistics-manager":          _p(0.35, 0.45, 0.10, 0.45, 0.55, 0.80, 0.50, 0.75, 0.60, 0.45, 0.85, 0.45, 0.30, 0.85, 0.55),
            "procurement-specialist":     _p(0.25, 0.50, 0.10, 0.50, 0.60, 0.75, 0.55, 0.70, 0.55, 0.45, 0.80, 0.45, 0.35, 0.80, 0.55),
            # ── NEW-AGE DIGITAL ────────────────────────────────────
            "digital-marketer":           _p(0.15, 0.40, 0.60, 0.60, 0.70, 0.40, 0.75, 0.60, 0.75, 0.50, 0.55, 0.70, 0.55, 0.40, 0.70),
            "seo-specialist":             _p(0.20, 0.65, 0.30, 0.30, 0.40, 0.60, 0.70, 0.70, 0.55, 0.30, 0.65, 0.30, 0.35, 0.65, 0.70),
            "growth-hacker":              _p(0.20, 0.65, 0.50, 0.40, 0.75, 0.45, 0.85, 0.65, 0.85, 0.35, 0.55, 0.55, 0.75, 0.35, 0.85),
            "influencer":                 _p(0.10, 0.25, 0.70, 0.80, 0.70, 0.20, 0.60, 0.55, 0.80, 0.55, 0.40, 0.90, 0.65, 0.25, 0.80),
            "ethical-hacker":             _p(0.45, 0.90, 0.15, 0.15, 0.25, 0.60, 0.90, 0.80, 0.75, 0.25, 0.70, 0.20, 0.70, 0.70, 0.85),
        }

        for career in Career.objects.all():
            profile = weights_map.get(career.slug)
            if not profile:
                continue
            for dim_slug, weight in profile.items():
                cat = categories.get(dim_slug)
                if cat:
                    CareerCategoryWeight.objects.create(
                        career=career,
                        category=cat,
                        weight=Decimal(str(weight)),
                    )
        self.stdout.write("15-dimension career weights seeded.")

    # ── Subject weights ────────────────────────────────────────────

    def _seed_subject_weights(self):
        """Subject importance per career: math, science, english, social_science."""
        subject_weights_map = {
            # Tech & Engineering
            "software-engineer": {"math": 0.9, "science": 0.7, "english": 0.4, "social_science": 0.2},
            "web-developer": {"math": 0.7, "science": 0.5, "english": 0.5, "social_science": 0.2},
            "ai-engineer": {"math": 0.95, "science": 0.8, "english": 0.4, "social_science": 0.2},
            "machine-learning-engineer": {"math": 0.95, "science": 0.7, "english": 0.4, "social_science": 0.2},
            "cybersecurity-analyst": {"math": 0.8, "science": 0.6, "english": 0.5, "social_science": 0.2},
            "cloud-devops-engineer": {"math": 0.83, "science": 0.6, "english": 0.4, "social_science": 0.2},
            "game-developer": {"math": 0.7, "science": 0.5, "english": 0.5, "social_science": 0.3},
            "blockchain-developer": {"math": 0.9, "science": 0.6, "english": 0.4, "social_science": 0.2},
            "database-administrator": {"math": 0.9, "science": 0.5, "english": 0.4, "social_science": 0.2},
            "network-engineer": {"math": 0.85, "science": 0.7, "english": 0.4, "social_science": 0.2},
            "robotics-engineer": {"math": 0.95, "science": 0.9, "english": 0.4, "social_science": 0.2},
            "electronics-hardware-engineer": {"math": 0.9, "science": 0.9, "english": 0.4, "social_science": 0.2},
            "data-scientist": {"math": 0.95, "science": 0.7, "english": 0.4, "social_science": 0.2},
            "data-engineer": {"math": 0.9, "science": 0.6, "english": 0.4, "social_science": 0.2},
            "mechanical-engineer": {"math": 0.9, "science": 0.9, "english": 0.4, "social_science": 0.2},
            "civil-engineer": {"math": 0.85, "science": 0.8, "english": 0.4, "social_science": 0.3},
            "aerospace-engineer": {"math": 0.95, "science": 0.9, "english": 0.4, "social_science": 0.2},
            "biomedical-engineer": {"math": 0.85, "science": 0.9, "english": 0.4, "social_science": 0.3},
            # Architecture & Design
            "architect": {"math": 0.7, "science": 0.5, "english": 0.5, "social_science": 0.4},
            "interior-designer": {"math": 0.4, "science": 0.3, "english": 0.6, "social_science": 0.4},
            "landscape-architect": {"math": 0.5, "science": 0.6, "english": 0.5, "social_science": 0.4},
            "urban-planner": {"math": 0.7, "science": 0.5, "english": 0.6, "social_science": 0.7},
            "industrial-designer": {"math": 0.6, "science": 0.5, "english": 0.5, "social_science": 0.4},
            "product-designer": {"math": 0.5, "science": 0.4, "english": 0.6, "social_science": 0.5},
            # Medical, Healthcare & Biotech
            "doctor": {"math": 0.6, "science": 0.95, "english": 0.5, "social_science": 0.3},
            "dentist": {"math": 0.6, "science": 0.9, "english": 0.5, "social_science": 0.3},
            "pharmacist": {"math": 0.8, "science": 0.9, "english": 0.5, "social_science": 0.3},
            "nurse": {"math": 0.5, "science": 0.7, "english": 0.5, "social_science": 0.4},
            "physiotherapist": {"math": 0.6, "science": 0.8, "english": 0.5, "social_science": 0.4},
            "psychologist": {"math": 0.5, "science": 0.5, "english": 0.7, "social_science": 0.8},
            "psychiatrist": {"math": 0.6, "science": 0.95, "english": 0.6, "social_science": 0.5},
            "nutritionist": {"math": 0.5, "science": 0.8, "english": 0.5, "social_science": 0.4},
            "radiologist": {"math": 0.7, "science": 0.95, "english": 0.5, "social_science": 0.3},
            "occupational-therapist": {"math": 0.5, "science": 0.6, "english": 0.6, "social_science": 0.6},
            "speech-therapist": {"math": 0.4, "science": 0.5, "english": 0.9, "social_science": 0.6},
            "biotechnologist": {"math": 0.7, "science": 0.95, "english": 0.5, "social_science": 0.3},
            "forensic-scientist": {"math": 0.7, "science": 0.9, "english": 0.5, "social_science": 0.4},
            # Commerce & Business
            "accountant": {"math": 0.9, "science": 0.3, "english": 0.5, "social_science": 0.3},
            "chartered-accountant": {"math": 0.95, "science": 0.3, "english": 0.5, "social_science": 0.3},
            "business-analyst": {"math": 0.7, "science": 0.4, "english": 0.6, "social_science": 0.5},
            "marketing-manager": {"math": 0.5, "science": 0.3, "english": 0.8, "social_science": 0.5},
            "investment-banker": {"math": 0.95, "science": 0.4, "english": 0.7, "social_science": 0.5},
            "financial-analyst": {"math": 0.95, "science": 0.4, "english": 0.6, "social_science": 0.4},
            "stock-trader": {"math": 0.9, "science": 0.4, "english": 0.5, "social_science": 0.4},
            "economist": {"math": 0.9, "science": 0.5, "english": 0.7, "social_science": 0.8},
            "risk-manager": {"math": 0.9, "science": 0.4, "english": 0.6, "social_science": 0.4},
            "sales-manager": {"math": 0.5, "science": 0.3, "english": 0.7, "social_science": 0.6},
            "hr-manager": {"math": 0.5, "science": 0.3, "english": 0.8, "social_science": 0.8},
            "operations-manager": {"math": 0.7, "science": 0.4, "english": 0.6, "social_science": 0.5},
            "product-manager": {"math": 0.6, "science": 0.4, "english": 0.7, "social_science": 0.5},
            "entrepreneur": {"math": 0.6, "science": 0.4, "english": 0.7, "social_science": 0.6},
            "management-consultant": {"math": 0.8, "science": 0.4, "english": 0.8, "social_science": 0.6},
            "actuarial-scientist": {"math": 0.95, "science": 0.5, "english": 0.5, "social_science": 0.3},
            # Arts & Creative
            "graphic-designer": {"math": 0.3, "science": 0.3, "english": 0.6, "social_science": 0.4},
            "writer": {"math": 0.3, "science": 0.3, "english": 0.95, "social_science": 0.6},
            "animator": {"math": 0.5, "science": 0.4, "english": 0.6, "social_science": 0.4},
            "fashion-designer": {"math": 0.3, "science": 0.3, "english": 0.6, "social_science": 0.4},
            "photographer": {"math": 0.3, "science": 0.4, "english": 0.5, "social_science": 0.4},
            "filmmaker": {"math": 0.3, "science": 0.3, "english": 0.8, "social_science": 0.5},
            "video-editor": {"math": 0.4, "science": 0.4, "english": 0.5, "social_science": 0.3},
            "vfx-artist": {"math": 0.6, "science": 0.5, "english": 0.5, "social_science": 0.3},
            "ui-ux-designer": {"math": 0.5, "science": 0.4, "english": 0.6, "social_science": 0.5},
            "content-creator": {"math": 0.3, "science": 0.3, "english": 0.8, "social_science": 0.5},
            "sound-engineer": {"math": 0.5, "science": 0.5, "english": 0.5, "social_science": 0.3},
            # Media & Communication
            "journalist": {"math": 0.4, "science": 0.4, "english": 0.95, "social_science": 0.7},
            "news-anchor": {"math": 0.3, "science": 0.3, "english": 0.95, "social_science": 0.5},
            "pr-specialist": {"math": 0.4, "science": 0.3, "english": 0.9, "social_science": 0.7},
            "copywriter": {"math": 0.3, "science": 0.3, "english": 0.95, "social_science": 0.5},
            "social-media-manager": {"math": 0.4, "science": 0.3, "english": 0.8, "social_science": 0.6},
            # Law
            "lawyer": {"math": 0.5, "science": 0.3, "english": 0.95, "social_science": 0.8},
            "corporate-lawyer": {"math": 0.6, "science": 0.3, "english": 0.9, "social_science": 0.6},
            "judge": {"math": 0.6, "science": 0.4, "english": 0.95, "social_science": 0.8},
            "company-secretary": {"math": 0.8, "science": 0.3, "english": 0.7, "social_science": 0.5},
            # Education & Research
            "teacher": {"math": 0.6, "science": 0.6, "english": 0.8, "social_science": 0.7},
            "professor": {"math": 0.7, "science": 0.7, "english": 0.8, "social_science": 0.6},
            "education-counselor": {"math": 0.5, "science": 0.5, "english": 0.8, "social_science": 0.8},
            "academic-researcher": {"math": 0.8, "science": 0.8, "english": 0.7, "social_science": 0.6},
            # Government & Defence
            "civil-services-officer": {"math": 0.6, "science": 0.5, "english": 0.85, "social_science": 0.9},
            "defence-officer": {"math": 0.65, "science": 0.7, "english": 0.6, "social_science": 0.5},
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
            "horticulturist": {"math": 0.5, "science": 0.8, "english": 0.5, "social_science": 0.3},
            "forestry-officer": {"math": 0.5, "science": 0.8, "english": 0.5, "social_science": 0.5},
            "environmental-scientist": {"math": 0.7, "science": 0.9, "english": 0.6, "social_science": 0.6},
            "wildlife-biologist": {"math": 0.6, "science": 0.95, "english": 0.6, "social_science": 0.5},
            # Aviation & Hospitality
            "pilot": {"math": 0.8, "science": 0.8, "english": 0.6, "social_science": 0.3},
            "air-traffic-controller": {"math": 0.8, "science": 0.6, "english": 0.6, "social_science": 0.3},
            "airport-manager": {"math": 0.6, "science": 0.5, "english": 0.7, "social_science": 0.5},
            "hotel-manager": {"math": 0.5, "science": 0.4, "english": 0.8, "social_science": 0.7},
            "event-manager": {"math": 0.5, "science": 0.3, "english": 0.8, "social_science": 0.7},
            # Operations & Logistics
            "supply-chain-manager": {"math": 0.8, "science": 0.5, "english": 0.6, "social_science": 0.5},
            "logistics-manager": {"math": 0.7, "science": 0.4, "english": 0.6, "social_science": 0.5},
            "procurement-specialist": {"math": 0.7, "science": 0.4, "english": 0.6, "social_science": 0.5},
            # New-age Digital
            "digital-marketer": {"math": 0.5, "science": 0.3, "english": 0.8, "social_science": 0.5},
            "seo-specialist": {"math": 0.6, "science": 0.4, "english": 0.7, "social_science": 0.4},
            "growth-hacker": {"math": 0.7, "science": 0.4, "english": 0.7, "social_science": 0.5},
            "influencer": {"math": 0.3, "science": 0.3, "english": 0.8, "social_science": 0.6},
            "ethical-hacker": {"math": 0.9, "science": 0.7, "english": 0.5, "social_science": 0.2},
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
