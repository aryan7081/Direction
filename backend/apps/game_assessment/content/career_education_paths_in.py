"""
Typical academic and professional routes in India for report copy.

These are general, widely published pathways (boards, UGC-recognised degrees,
professional bodies such as NMC, BCI, ICAI, ICSI, DGCA, etc.). They are not
individual counselling or a guarantee of eligibility; students should confirm
current rules with institutions and regulators.
"""

from __future__ import annotations

from typing import Dict


def default_education_path_by_stream(stream: str) -> str:
    """Conservative generic route when a career slug has no dedicated line."""
    s = (stream or "").strip().lower()
    if s in ("science", "sci", "pcm", "pcb", "pcmb"):
        return (
            "Class 11–12 Science (PCM or PCB as required for your goal) → relevant "
            "undergraduate programme (e.g. B.Tech, B.Sc, MBBS track) → national or "
            "university entrance tests for PG or licensing where applicable."
        )
    if s in ("commerce", "commercial", "comm"):
        return (
            "Class 11–12 Commerce → B.Com / BBA / B.Econ or a professional track "
            "(e.g. CA/CMA/CS) as applicable → PG (MBA, M.Com) or professional finals "
            "per institute and regulator rules."
        )
    if s in ("arts", "art", "humanities", "humanity"):
        return (
            "Class 11–12 Arts/Humanities → BA in a relevant discipline → MA, "
            "professional diploma, or competitive exams for the sector you choose "
            "(civil services, law, design, media, etc.)."
        )
    return (
        "Class 11–12 aligned with your target field → UG degree from a recognised "
        "university → PG, internship, or licensing exams as required for that role."
    )


def education_path_for_career(slug: str, stream: str = "") -> str:
    return EDUCATION_PATH_INDIA.get(slug) or default_education_path_by_stream(stream)


# One-line “India typical” routes: Class 12 → UG → PG/licensing where standard.
EDUCATION_PATH_INDIA: Dict[str, str] = {
    # Tech & engineering
    "software-engineer": (
        "Class 11–12 Science (PCM) → JEE Main/Advanced or state engineering entrance "
        "→ B.Tech CSE/IT (AICTE-approved) → placements or GATE for M.Tech/research roles."
    ),
    "web-developer": (
        "Class 11–12 Science or Commerce with Math → B.Tech CS/IT, BCA, or B.Sc IT → "
        "internships; MCA or PG diplomas optional for deeper CS foundations."
    ),
    "ai-engineer": (
        "Class 11–12 PCM → B.Tech with AI/ML/CSE focus at IIT/NIT/state university "
        "→ M.Tech/MS or research programmes; strong math and programming portfolio."
    ),
    "machine-learning-engineer": (
        "Class 11–12 PCM → B.Tech CSE/ECE with statistics & ML electives → M.Tech/MS "
        "or industry roles; GATE CS/Data Science useful for PG."
    ),
    "cybersecurity-analyst": (
        "Class 11–12 PCM → B.Tech CS/IT or B.Sc CS → vendor/security certifications "
        "(e.g. CEH-style programmes) plus internships; M.Tech Information Security optional."
    ),
    "cloud-devops-engineer": (
        "Class 11–12 PCM → B.Tech IT/CSE → cloud platform training (AWS/Azure/GCP) "
        "and Linux/networking skills; experience via internships and certifications."
    ),
    "game-developer": (
        "Class 11–12 PCM or Arts with portfolio → B.Tech game dev / B.Sc animation / "
        "B.Des digital game design where offered → studio portfolio and internships."
    ),
    "blockchain-developer": (
        "Class 11–12 PCM → B.Tech CSE with strong DSA and systems → self-paced "
        "blockchain courses and projects; PG in CS/fintech optional."
    ),
    "database-administrator": (
        "Class 11–12 PCM → B.Tech CS/IT or BCA+MCA track → database certifications "
        "and on-the-job DBA experience."
    ),
    "network-engineer": (
        "Class 11–12 PCM → B.Tech ECE/IT → routing/switching certifications and "
        "campus networking labs; GATE for PSU MTech pathways where applicable."
    ),
    "robotics-engineer": (
        "Class 11–12 PCM → B.Tech mechatronics/EE/ECE → M.Tech robotics/automation "
        "or R&D roles in manufacturing and automation firms."
    ),
    "electronics-hardware-engineer": (
        "Class 11–12 PCM → B.Tech ECE → M.Tech VLSI/embedded or industry in hardware "
        "design, testing, and manufacturing."
    ),
    "data-scientist": (
        "Class 11–12 PCM → B.Tech CS or B.Stat/B.Sc Mathematics & Statistics → "
        "M.Sc Statistics / M.Tech Data Science / MBA analytics at recognised universities."
    ),
    "data-engineer": (
        "Class 11–12 PCM → B.Tech CS/IT or B.Sc CS → skills in SQL, ETL, big-data "
        "tools via projects and certifications; MCA/M.Tech optional."
    ),
    "mechanical-engineer": (
        "Class 11–12 PCM → JEE/state entrance → B.Tech Mechanical (AICTE) → "
        "campus placement, GATE for PSU MTech, or industry design roles."
    ),
    "civil-engineer": (
        "Class 11–12 PCM → B.Tech Civil → GATE for MTech/PSU jobs; site engineer "
        "roles via campus and contractor networks."
    ),
    "aerospace-engineer": (
        "Class 11–12 PCM → B.Tech Aerospace at IIT/IIST or Mechanical/Aeronautical "
        "at other universities → MTech/GATE AE or defence/ISRO-sector pathways."
    ),
    "biomedical-engineer": (
        "Class 11–12 PCB or PCM → B.Tech Biomedical/Biotech → MTech BME, hospital "
        "engineering, or med-tech industry R&D."
    ),
    # Architecture & design
    "architect": (
        "Class 11–12 PCM → NATA + JEE Paper 2 where applicable → five-year B.Arch "
        "(Council of Architecture recognised) → COA registration and internship."
    ),
    "interior-designer": (
        "Class 11–12 any stream with portfolio → B.Des Interior / B.Sc interior "
        "design or recognised diploma → practice under market and institute norms."
    ),
    "landscape-architect": (
        "Class 11–12 Science/Arts → B.Arch planning/landscape tracks or B.Planning "
        "where offered → M.Planning/landscape postgraduate programmes."
    ),
    "urban-planner": (
        "Class 11–12 PCM or Arts → B.Planning / B.Arch → M.Planning at SPA/IIT "
        "planning departments or equivalent recognised PG."
    ),
    "industrial-designer": (
        "Class 11–12 any stream with portfolio → B.Des Industrial Design (NID, IIT "
        "IDC, etc.) via national design entrance → industry placements."
    ),
    "product-designer": (
        "Class 11–12 any stream → B.Des Product/Interaction or B.Tech design "
        "engineering where offered → UX/product roles via portfolio."
    ),
    # Medical & allied (NMC/PCI/RCI norms change — keep degree-level description)
    "doctor": (
        "Class 11–12 PCB → NEET-UG → MBBS (NMC-recognised college) → NEET-PG / "
        "INI-CET for MD/MS/DNB in chosen specialty."
    ),
    "dentist": (
        "Class 11–12 PCB → NEET-UG → BDS (Dental Council of India recognised) → "
        "NEET MDS for MDS specialisation."
    ),
    "pharmacist": (
        "Class 11–12 PCB/PCM → B.Pharm (PCI-approved) → GPAT for M.Pharm; register "
        "as pharmacist per State Pharmacy Council rules."
    ),
    "nurse": (
        "Class 11–12 PCB → B.Sc Nursing / GNM / PB B.Sc as applicable (INC syllabus) "
        "→ staff nurse recruitment exams in government and private hospitals."
    ),
    "physiotherapist": (
        "Class 11–12 PCB → Bachelor of Physiotherapy (4.5 years, recognised) → "
        "MPT optional; state registration where required."
    ),
    "psychologist": (
        "Class 11–12 Arts/Science → BA/B.Sc Psychology → MA/M.Sc Psychology; for "
        "licensed clinical practice in India follow RCI-approved M.Phil Clinical "
        "Psychology (two-year) route where applicable."
    ),
    "psychiatrist": (
        "Class 11–12 PCB → NEET-UG → MBBS → MD/DNB Psychiatry through NEET-PG "
        "or institute entrance."
    ),
    "nutritionist": (
        "Class 11–12 PCB/Home Science → B.Sc Nutrition/Dietetics or related UG → "
        "M.Sc and internships; check UGC/institute accreditation."
    ),
    "radiologist": (
        "Class 11–12 PCB → NEET-UG → MBBS → MD/DNB Radiodiagnosis (PG entrance)."
    ),
    "occupational-therapist": (
        "Class 11–12 PCB → Bachelor of Occupational Therapy (RCI-recognised "
        "institute) → MOT optional."
    ),
    "speech-therapist": (
        "Class 11–12 PCB/Arts → BASLP (four-year, RCI-recognised) → clinical "
        "audiology & speech-language pathology practice."
    ),
    "biotechnologist": (
        "Class 11–12 PCB/PCM → B.Tech Biotechnology / B.Sc Life Sciences → "
        "M.Tech/M.Sc and CSIR-UGC NET / DBT fellowships for research careers."
    ),
    "forensic-scientist": (
        "Class 11–12 PCB/PCM → B.Sc/M.Sc Forensic Science from recognised university "
        "→ recruitment via state/central forensic labs and agency exams."
    ),
    # Commerce & business
    "accountant": (
        "Class 11–12 Commerce → B.Com → M.Com / MBA Finance / CMA(ACMA)/ACCA track "
        "as chosen; articleship where professional course selected."
    ),
    "chartered-accountant": (
        "Class 11–12 Commerce (Math recommended) → CA Foundation → Intermediate → "
        "three-year articleship → CA Final (ICAI regulations)."
    ),
    "business-analyst": (
        "Class 11–12 Commerce or Science → B.Com/BBA/B.Tech → MBA or PGDM analytics "
        "or domain experience; certifications in tools/PM optional."
    ),
    "marketing-manager": (
        "Class 11–12 Commerce or Arts → BBA/B.Com/BA → MBA Marketing or PGDM from "
        "AICTE/UGC-recognised B-school → brand, digital, or sales leadership roles."
    ),
    "investment-banker": (
        "Class 11–12 Commerce/Science → strong UG (Economics, B.Com Hons, B.Tech) "
        "→ MBA Finance from reputed B-school / CFA charter pathway alongside experience."
    ),
    "financial-analyst": (
        "Class 11–12 Commerce → B.Com/BBA Finance / B.Econ → MBA Finance, CFA, or "
        "FRM depending on employer track."
    ),
    "stock-trader": (
        "Class 11–12 Commerce/Science → relevant UG → mandatory NISM certifications "
        "for SEBI-registered intermediaries; employer broker training programmes."
    ),
    "economist": (
        "Class 11–12 Arts/Science → BA Economics (university programme) → MA/M.Phil "
        "Economics, PhD, or policy school as per research/teaching goal."
    ),
    "risk-manager": (
        "Class 11–12 Commerce/Science → B.Com/B.Tech + MBA Risk/Finance or FRM/PRM "
        "professional exams with banking/IT experience."
    ),
    "sales-manager": (
        "Class 11–12 any stream → BBA/B.Com/ domain UG → MBA marketing or sales "
        "leadership through experience and company programmes."
    ),
    "hr-manager": (
        "Class 11–12 any stream → BBA/B.Com / Psychology UG → MBA HR / PGDHRM "
        "from recognised university."
    ),
    "operations-manager": (
        "Class 11–12 any stream → B.Tech/BBA → MBA operations/supply chain or "
        "graduate trainee programmes in industry."
    ),
    "product-manager": (
        "Class 11–12 PCM or Commerce → B.Tech/BBA + MBA (often tech + business) "
        "or internal promotion path in product companies."
    ),
    "entrepreneur": (
        "No fixed degree route; common pattern is UG in any discipline plus domain "
        "experience, optional MBA, and registering a business (MSME/Udyam, GST, etc.)."
    ),
    "management-consultant": (
        "Strong undergraduate record → CAT/XAT/GMAT → MBA/PGDM from reputed "
        "institute → campus consulting recruitment; domain PhD alternate in niche firms."
    ),
    "actuarial-scientist": (
        "Class 11–12 PCM strong → B.Sc Mathematics/Statistics or B.Com → "
        "Actuarial exams of IAI/IFOA (UK) alongside employment in insurance/analytics."
    ),
    # Arts & creative
    "graphic-designer": (
        "Class 11–12 any stream with portfolio → B.Des Graphic / visual communication "
        "or BFA → portfolio-based hiring."
    ),
    "writer": (
        "Class 11–12 Arts preferred → BA English/Journalism/Mass Communication → "
        "MA, PG diplomas in writing, or editorial/media entry roles."
    ),
    "animator": (
        "Class 11–12 any stream → B.Sc Animation / B.Des Animation / diploma from "
        "recognised institute → studio portfolio."
    ),
    "fashion-designer": (
        "Class 11–12 any stream → NIFT/NID B.Des Fashion Design or equivalent "
        "four-year programme via national entrance."
    ),
    "photographer": (
        "Class 11–12 any stream → BFA Photography / diploma in commercial photography "
        "→ freelance or media house experience."
    ),
    "filmmaker": (
        "Class 11–12 any stream → diploma/degree from FTII/SRFTI-type film schools or "
        "BA Mass Media → assistant director/editor track in industry."
    ),
    "video-editor": (
        "Class 11–12 any stream → diploma/UG in mass media, film, or broadcast "
        "technology → post-production houses and OTT workflows."
    ),
    "vfx-artist": (
        "Class 11–12 any stream → diploma/B.Sc in animation & VFX from recognised "
        "institute → studio reel and internships."
    ),
    "ui-ux-designer": (
        "Class 11–12 any stream → B.Des Interaction/HCI or B.Tech with design minors "
        "→ portfolio and UX internships."
    ),
    "content-creator": (
        "No single regulated pathway; common routes include BA Mass Comm/English, "
        "BBA digital marketing, or self-taught skills with portfolio and compliance "
        "for income and contracts."
    ),
    "sound-engineer": (
        "Class 11–12 PCM or Arts → diploma/degree in audio engineering / film school "
        "sound course → studio and broadcast internships."
    ),
    # Media & communication
    "journalist": (
        "Class 11–12 Arts/Science → BA Journalism/Mass Communication → PG diploma or "
        "MA; recruitment via media tests and internships."
    ),
    "news-anchor": (
        "Class 11–12 any stream → BA Journalism/Mass Comm → broadcast diploma and "
        "on-camera training; entry via trainee newsroom roles."
    ),
    "pr-specialist": (
        "Class 11–12 any stream → BA Public Relations / Mass Comm → MBA communication "
        "or PG diploma PR from recognised institute."
    ),
    "copywriter": (
        "Class 11–12 Arts → BA English/Advertising/Journalism → portfolio and "
        "agency trainee programmes."
    ),
    "social-media-manager": (
        "Class 11–12 any stream → BBA digital marketing / BA Mass Comm → "
        "certifications in ads platforms and analytics plus internships."
    ),
    # Law
    "lawyer": (
        "Class 11–12 any stream → CLAT/LSAT-AILET etc. → five-year BA LLB / BBA LLB "
        "from recognised law school → AIBE for enrolment with State Bar Council."
    ),
    "corporate-lawyer": (
        "Class 11–12 any stream → national law entrance → BA LLB/B.Com LLB → "
        "corporate law practice after enrolment; LLM optional."
    ),
    "judge": (
        "LLB (integrated or three-year) + enrolment as advocate → Judicial Services "
        "Examination of states or Higher Judicial Service as per seniority rules."
    ),
    "company-secretary": (
        "Class 11–12 Commerce (or graduate route) → CSEET → CS Executive & "
        "Professional modules + practical training (ICSI regulations)."
    ),
    # Education & research
    "teacher": (
        "Graduation in teaching subject → B.Ed. (two-year) as per NCTE norms → "
        "TET/CTET and state teacher recruitment for school posts."
    ),
    "professor": (
        "UG in discipline → PG → UGC NET/JRF → PhD → postdoctoral/research "
        "experience → college/university appointments per UGC/institute rules."
    ),
    "education-counselor": (
        "Class 11–12 any stream → BA Psychology / B.Ed guidance & counselling "
        "where offered → PG diploma/certificate in career counselling from recognised body."
    ),
    "academic-researcher": (
        "Class 11–12 Science → UG in discipline → integrated PhD or M.Sc + PhD → "
        "postdoc and research positions (CSIR, DBT, university labs)."
    ),
    # Government & defence
    "civil-services-officer": (
        "Bachelor degree in any discipline → UPSC Civil Services Examination "
        "(Preliminary, Mains, Interview) for IAS/IPS/IFS etc."
    ),
    "defence-officer": (
        "Class 12 Science stream for technical entries → NDA (UPSC) / TES / "
        "University Entry Scheme or graduate CDS/AFCAT per service advertisement."
    ),
    "police-officer": (
        "Varies by state: Class 12 or graduation as per notification → state PSC/"
        "police recruitment board written test, physical tests, and medical."
    ),
    "intelligence-officer": (
        "Bachelor degree (specified disciplines in notification) → SSC CGL / "
        "department-specific examinations for investigative and intelligence cadres."
    ),
    # Agriculture & environment
    "agricultural-scientist": (
        "Class 11–12 PCB/PCM → B.Sc Agriculture via ICAR AIEEA or state agriculture "
        "university → M.Sc/PhD in agronomy, genetics, extension, etc."
    ),
    "horticulturist": (
        "Class 11–12 PCB → B.Sc Horticulture / Agriculture → state agriculture "
        "department or ICAR scientist recruitment via ASRB."
    ),
    "forestry-officer": (
        "Class 11–12 PCM/PCB → B.Sc Forestry → Indian Forest Service (UPSC) or "
        "state forest service examinations as per current rules."
    ),
    "environmental-scientist": (
        "Class 11–12 Science → B.Sc Environmental Science → M.Sc / MoEFCC and "
        "consulting firm roles; GATE for some PG programmes."
    ),
    "wildlife-biologist": (
        "Class 11–12 PCB → B.Sc Zoology/Wildlife Biology → M.Sc Wildlife Sciences "
        "at WII-type programmes or research careers."
    ),
    # Aviation & hospitality
    "pilot": (
        "Class 12 with Physics & Mathematics (and English) → Class 1 medical → "
        "CPL training at DGCA-approved flying training organisation → ATPL exams "
        "and airline cadet programme or hour building."
    ),
    "air-traffic-controller": (
        "Typically B.Tech/B.E. in branches notified by Airports Authority of India "
        "→ selection through AAI recruitment exam and ATC training course after appointment."
    ),
    "airport-manager": (
        "Class 11–12 any stream → BBA Aviation / BHM aviation / MBA aviation "
        "management from recognised institute → airport operations traineeships."
    ),
    "hotel-manager": (
        "Class 11–12 any stream → three-year BHM from IHMs under NCHM JEE → "
        "hotel operations management trainee programmes."
    ),
    "event-manager": (
        "Class 11–12 any stream → diploma/degree event management or MBA marketing "
        "→ experiential roles with agencies and corporates."
    ),
    # Operations & logistics
    "supply-chain-manager": (
        "Class 11–12 Commerce/Science → B.Tech/BBA → MBA operations/supply chain "
        "or APICS-style certifications with industry experience."
    ),
    "logistics-manager": (
        "Class 11–12 Commerce/Science → BBA Logistics / B.Com / B.Tech → PG supply "
        "chain or management trainee in logistics firms."
    ),
    "procurement-specialist": (
        "Class 11–12 Commerce → B.Com/BBA materials management → MBA supply chain "
        "or certification in procurement with corporate experience."
    ),
    # New-age digital
    "digital-marketer": (
        "Class 11–12 any stream → BBA/MBA marketing or Mass Comm UG → Google/Meta "
        "skill certificates and performance marketing internships."
    ),
    "seo-specialist": (
        "Class 11–12 any stream → Mass Comm/CS UG → technical SEO, analytics, and "
        "content strategy skills via courses and agency work."
    ),
    "growth-hacker": (
        "Often B.Tech/BBA + product/analytics skills → startup growth roles; "
        "MBA marketing/analytics optional; no single regulated syllabus."
    ),
    "influencer": (
        "No regulated degree; many combine UG (media, arts, business) with platform "
        "skills; comply with income tax, advertising standards, and contract law."
    ),
    "ethical-hacker": (
        "Class 11–12 PCM → B.Tech CSE/IT → CEH/OSCP-style certifications and "
        "bug-bounty/legal disclosure practice; cyber law awareness essential."
    ),
}
