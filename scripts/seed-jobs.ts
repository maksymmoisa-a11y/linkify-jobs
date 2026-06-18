/**
 * Seed database with realistic job data for development/demo.
 * Usage: npx tsx scripts/seed-jobs.ts
 */
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/lib/db/schema";
import { eq } from "drizzle-orm";

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://linkify:linkify_dev_2024@localhost:5434/linkify_jobs";

const companies = [
  { name: "SAP SE", info: { industry: "Enterprise Software", size: "100.000+", description: "Globaler Marktführer für Unternehmenssoftware und ERP-Systeme.", website: "https://sap.com" } },
  { name: "Siemens AG", info: { industry: "Technologie & Industrie", size: "50.000+", description: "Internationaler Technologiekonzern mit Fokus auf Automatisierung und Digitalisierung.", website: "https://siemens.com" } },
  { name: "Deutsche Telekom IT", info: { industry: "Telekommunikation", size: "20.000+", description: "IT-Dienstleister der Deutschen Telekom.", website: "https://telekom.de" } },
  { name: "BMW Group", info: { industry: "Automobil", size: "50.000+", description: "Premium-Automobilhersteller mit starkem Fokus auf Digitalisierung.", website: "https://bmw.com" } },
  { name: "Zalando SE", info: { industry: "E-Commerce & Fashion", size: "10.000+", description: "Europas führende Online-Plattform für Mode und Lifestyle.", website: "https://zalando.de" } },
  { name: "Check24", info: { industry: "Vergleichsportal", size: "5.000+", description: "Deutschlands größtes Vergleichsportal für Versicherungen, Finanzen und mehr.", website: "https://check24.de" } },
  { name: "Delivery Hero SE", info: { industry: "Food-Tech", size: "10.000+", description: "Globale Plattform für Essenslieferungen.", website: "https://deliveryhero.com" } },
  { name: "N26 GmbH", info: { industry: "FinTech", size: "1.500+", description: "Mobile Bank mit über 8 Millionen Kunden in Europa.", website: "https://n26.com" } },
  { name: "Bosch Digital", info: { industry: "IoT & Industrie", size: "5.000+", description: "Digitale Einheit von Bosch für IoT und Cloud-Lösungen.", website: "https://bosch.com" } },
  { name: "Celonis SE", info: { industry: "Process Mining", size: "3.000+", description: "Weltmarktführer im Bereich Process Mining und Execution Management.", website: "https://celonis.com" } },
  { name: "FlixBus / Flix SE", info: { industry: "Mobilität", size: "2.000+", description: "Europas größter Fernbusanbieter mit Tech-DNA.", website: "https://flixbus.de" } },
  { name: "TeamViewer AG", info: { industry: "Remote Connectivity", size: "1.500+", description: "Globaler Anbieter von Remote-Konnektivitätslösungen.", website: "https://teamviewer.com" } },
];

const jobTemplates = [
  { title: "Senior Frontend Developer (React)", requirements: ["React", "TypeScript", "Next.js", "Tailwind CSS", "REST API", "Git"], salaryMin: 65000, salaryMax: 85000, description: "Wir suchen einen erfahrenen Frontend-Entwickler (m/w/d) zur Verstärkung unseres Teams. Du arbeitest an modernen Web-Applikationen mit React und TypeScript.\n\n**Deine Aufgaben:**\n- Entwicklung und Wartung von React-basierten Web-Anwendungen\n- Enge Zusammenarbeit mit UX/UI-Designern und Backend-Entwicklern\n- Code Reviews und Mentoring von Junior-Entwicklern\n- Performance-Optimierung und Testing\n\n**Dein Profil:**\n- 3+ Jahre Erfahrung mit React und TypeScript\n- Erfahrung mit modernen Frontend-Tools (Vite, Next.js)\n- Kenntnisse in Responsive Design und Accessibility\n- Teamfähigkeit und eigenverantwortliches Arbeiten" },
  { title: "Backend Engineer (Python/FastAPI)", requirements: ["Python", "FastAPI", "PostgreSQL", "Docker", "Redis", "AWS"], salaryMin: 60000, salaryMax: 80000, description: "Für unser wachsendes Engineering-Team suchen wir einen Backend Engineer (m/w/d) mit Schwerpunkt Python.\n\n**Deine Aufgaben:**\n- Design und Implementierung von RESTful APIs mit FastAPI\n- Datenbankdesign und -optimierung (PostgreSQL)\n- Microservice-Architektur und Container-Orchestrierung\n- CI/CD Pipeline Wartung und Verbesserung\n\n**Dein Profil:**\n- 2+ Jahre Erfahrung mit Python-Backend-Entwicklung\n- Solide Kenntnisse in SQL und relationalen Datenbanken\n- Erfahrung mit Docker und Cloud-Services (AWS/GCP)\n- Verständnis von Clean Code und SOLID-Prinzipien" },
  { title: "DevOps Engineer (Kubernetes)", requirements: ["Kubernetes", "Docker", "Terraform", "AWS", "CI/CD", "Linux", "Prometheus"], salaryMin: 70000, salaryMax: 95000, description: "Als DevOps Engineer (m/w/d) bist du verantwortlich für unsere Cloud-Infrastruktur und Deployment-Pipelines.\n\n**Deine Aufgaben:**\n- Verwaltung und Optimierung unserer Kubernetes-Cluster\n- Infrastructure as Code mit Terraform\n- Monitoring und Alerting (Prometheus, Grafana)\n- Automatisierung von Deployment-Prozessen\n\n**Dein Profil:**\n- 3+ Jahre Erfahrung im DevOps/SRE-Bereich\n- Tiefgreifende Kubernetes-Kenntnisse\n- Erfahrung mit mindestens einem Cloud-Provider (AWS/GCP/Azure)\n- Scripting-Kenntnisse (Bash, Python)" },
  { title: "Fullstack Developer (TypeScript)", requirements: ["TypeScript", "React", "Node.js", "PostgreSQL", "GraphQL", "Docker"], salaryMin: 55000, salaryMax: 75000, description: "Werde Teil unseres cross-funktionalen Teams als Fullstack Developer (m/w/d).\n\n**Deine Aufgaben:**\n- End-to-End Feature-Entwicklung (Frontend bis Backend)\n- API-Design und Implementierung\n- Datenbankmodellierung\n- Agile Softwareentwicklung im Scrum-Team\n\n**Dein Profil:**\n- Erfahrung mit TypeScript im Frontend und Backend\n- React und Node.js Kenntnisse\n- Verständnis von Datenbankdesign\n- Leidenschaft für sauberen Code" },
  { title: "Data Engineer", requirements: ["Python", "Apache Spark", "SQL", "Airflow", "AWS", "dbt", "Snowflake"], salaryMin: 65000, salaryMax: 90000, description: "Als Data Engineer (m/w/d) baust du skalierbare Datenpipelines und unterstützt unser Data-Team.\n\n**Deine Aufgaben:**\n- Aufbau und Wartung von ETL/ELT-Pipelines\n- Datenmodellierung und Data Warehouse Design\n- Optimierung von Datenverarbeitungsprozessen\n- Zusammenarbeit mit Data Scientists und Analysten\n\n**Dein Profil:**\n- 2+ Jahre Erfahrung als Data Engineer\n- Starke SQL-Kenntnisse\n- Erfahrung mit Spark, Airflow oder vergleichbaren Tools\n- Cloud-Erfahrung (AWS/GCP)" },
  { title: "Mobile Developer (React Native)", requirements: ["React Native", "TypeScript", "iOS", "Android", "REST API", "Redux"], salaryMin: 55000, salaryMax: 75000, description: "Wir suchen einen Mobile Developer (m/w/d) für unsere cross-platform App.\n\n**Deine Aufgaben:**\n- Entwicklung und Wartung unserer React Native App\n- Implementierung neuer Features für iOS und Android\n- Performance-Optimierung und Bugfixing\n- App Store Deployment und Release Management\n\n**Dein Profil:**\n- 2+ Jahre Erfahrung mit React Native\n- Kenntnisse in nativer iOS oder Android-Entwicklung von Vorteil\n- Erfahrung mit State Management (Redux/MobX)\n- Auge für gutes UI/UX" },
  { title: "IT-Projektmanager (agil)", requirements: ["Scrum", "Jira", "Confluence", "Stakeholder Management", "Budget Management"], salaryMin: 60000, salaryMax: 80000, description: "Als IT-Projektmanager (m/w/d) steuerst du komplexe Softwareprojekte.\n\n**Deine Aufgaben:**\n- Leitung von IT-Projekten im agilen Umfeld\n- Stakeholder-Management und Reporting\n- Budget- und Ressourcenplanung\n- Risikomanagement und Qualitätssicherung\n\n**Dein Profil:**\n- 3+ Jahre Erfahrung im IT-Projektmanagement\n- Zertifizierung (PSM, PMI oder vergleichbar)\n- Erfahrung mit Jira und Confluence\n- Kommunikationsstärke auf Deutsch und Englisch" },
  { title: "Cloud Architect (AWS)", requirements: ["AWS", "Azure", "Terraform", "Microservices", "Security", "Python", "Serverless"], salaryMin: 80000, salaryMax: 110000, description: "Als Cloud Architect (m/w/d) gestaltest du unsere Cloud-Strategie.\n\n**Deine Aufgaben:**\n- Design von skalierbaren Cloud-Architekturen\n- Migration von Legacy-Systemen in die Cloud\n- Security- und Compliance-Bewertungen\n- Technische Beratung und Mentoring\n\n**Dein Profil:**\n- 5+ Jahre Erfahrung mit Cloud-Technologien\n- AWS Solutions Architect Zertifizierung\n- Tiefes Verständnis von Microservice-Architekturen\n- Erfahrung mit Infrastructure as Code" },
  { title: "QA Engineer / Testautomatisierung", requirements: ["Selenium", "Cypress", "Jest", "CI/CD", "Python", "API Testing"], salaryMin: 50000, salaryMax: 70000, description: "Verstärke unser QA-Team als Test-Automatisierungsingenieur (m/w/d).\n\n**Deine Aufgaben:**\n- Aufbau und Wartung von Testautomatisierungs-Frameworks\n- Erstellung von E2E-, Integration- und Unit-Tests\n- Integration von Tests in CI/CD-Pipelines\n- Qualitätssicherung und Testplanung\n\n**Dein Profil:**\n- 2+ Jahre Erfahrung in der Testautomatisierung\n- Kenntnisse in Cypress, Selenium oder Playwright\n- Programmierkenntnisse (Python, JavaScript/TypeScript)\n- ISTQB-Zertifizierung von Vorteil" },
  { title: "Machine Learning Engineer", requirements: ["Python", "PyTorch", "TensorFlow", "MLOps", "Docker", "SQL", "NLP"], salaryMin: 70000, salaryMax: 100000, description: "Wir suchen einen ML Engineer (m/w/d) für unser KI-Team.\n\n**Deine Aufgaben:**\n- Entwicklung und Deployment von ML-Modellen\n- Feature Engineering und Datenaufbereitung\n- MLOps: Modell-Monitoring und Retraining-Pipelines\n- Forschung und Prototyping neuer KI-Ansätze\n\n**Dein Profil:**\n- Master/PhD in Informatik, Mathematik oder verwandtem Gebiet\n- 2+ Jahre Erfahrung mit PyTorch oder TensorFlow\n- Starke Python-Kenntnisse\n- Erfahrung mit MLOps-Tools (MLflow, Kubeflow)" },
  { title: "Product Owner (Digital)", requirements: ["Scrum", "Jira", "User Stories", "Stakeholder Management", "A/B Testing", "Analytics"], salaryMin: 65000, salaryMax: 90000, description: "Als Product Owner (m/w/d) verantwortest du die Weiterentwicklung unseres digitalen Produkts.\n\n**Deine Aufgaben:**\n- Pflege und Priorisierung des Product Backlogs\n- Definition und Verfeinerung von User Stories\n- Enge Zusammenarbeit mit Entwicklungsteam und Stakeholdern\n- Datengetriebene Produktentscheidungen\n\n**Dein Profil:**\n- 3+ Jahre Erfahrung als Product Owner oder Product Manager\n- Erfahrung mit agilen Methoden (Scrum/Kanban)\n- Analytisches Denken und datengetriebene Arbeitsweise\n- Exzellente Kommunikationsfähigkeiten" },
  { title: "Security Engineer", requirements: ["Penetration Testing", "OWASP", "SIEM", "AWS Security", "Python", "ISO 27001"], salaryMin: 70000, salaryMax: 95000, description: "Als Security Engineer (m/w/d) sicherst du unsere Infrastruktur und Anwendungen ab.\n\n**Deine Aufgaben:**\n- Durchführung von Sicherheitsaudits und Penetration Tests\n- Implementierung von Security-Maßnahmen\n- Incident Response und forensische Analyse\n- Security Awareness Training\n\n**Dein Profil:**\n- 3+ Jahre Erfahrung im IT-Security-Bereich\n- Kenntnisse in OWASP Top 10 und gängigen Angriffsvektoren\n- Erfahrung mit Cloud Security (AWS/Azure)\n- Zertifizierungen (CISSP, CEH) von Vorteil" },
];

const cities = [
  { name: "Berlin", plz: "10115" },
  { name: "München", plz: "80331" },
  { name: "Hamburg", plz: "20095" },
  { name: "Frankfurt am Main", plz: "60311" },
  { name: "Köln", plz: "50667" },
  { name: "Stuttgart", plz: "70173" },
  { name: "Düsseldorf", plz: "40213" },
  { name: "Leipzig", plz: "04109" },
  { name: "Nürnberg", plz: "90402" },
  { name: "Hannover", plz: "30159" },
  { name: "Dresden", plz: "01067" },
  { name: "Mannheim", plz: "68159" },
];

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

async function main() {
  console.log("Connecting to database...");
  const client = postgres(DATABASE_URL, { max: 5 });
  const db = drizzle(client, { schema });

  // Generate 120 realistic jobs
  const jobRows = [];
  for (let i = 0; i < 120; i++) {
    const template = randomPick(jobTemplates);
    const company = randomPick(companies);
    const city = randomPick(cities);
    const isRemote = Math.random() > 0.7;
    const postedDaysAgo = Math.floor(Math.random() * 30);
    const salaryVariance = Math.floor(Math.random() * 10000) - 5000;

    const location = isRemote
      ? `${city.name}, ${city.plz} (Remote möglich)`
      : `${city.name}, ${city.plz}`;

    const searchText = [
      template.title,
      company.name,
      city.name,
      template.description,
      ...template.requirements,
      company.info.industry,
    ].join(" ");

    jobRows.push({
      externalId: `seed-${i}-${Date.now()}`,
      sourcePortal: "bundesagentur",
      title: template.title,
      companyName: company.name,
      companyInfo: company.info,
      location,
      remote: isRemote,
      salaryMin: template.salaryMin + salaryVariance,
      salaryMax: template.salaryMax + salaryVariance,
      salaryCurrency: "EUR",
      description: template.description,
      requirements: template.requirements,
      applicationFields: [
        { name: "anschreiben", type: "textarea" as const, label: "Anschreiben", required: true },
        { name: "lebenslauf", type: "file" as const, label: "Lebenslauf (PDF)", required: true },
        { name: "gehaltsvorstellung", type: "text" as const, label: "Gehaltsvorstellung", required: false },
        { name: "eintrittsdatum", type: "text" as const, label: "Frühester Eintrittstermin", required: false },
      ],
      matchKeywords: searchText,
      createdAt: daysAgo(postedDaysAgo),
      expiresAt: daysAgo(postedDaysAgo - 60),
      isActive: true,
    });
  }

  // Insert in batches
  console.log(`Inserting ${jobRows.length} jobs...`);
  const BATCH = 50;
  for (let i = 0; i < jobRows.length; i += BATCH) {
    await db.insert(schema.jobs).values(jobRows.slice(i, i + BATCH));
    console.log(`  Batch ${Math.floor(i / BATCH) + 1}: ${Math.min(i + BATCH, jobRows.length)} / ${jobRows.length}`);
  }

  // Create/update portal entry
  const existing = await db.select().from(schema.portals).where(eq(schema.portals.slug, "bundesagentur")).limit(1);
  if (existing.length === 0) {
    await db.insert(schema.portals).values({
      name: "Bundesagentur für Arbeit",
      slug: "bundesagentur",
      type: "api",
      status: "active",
      jobsCount: jobRows.length,
      lastSyncAt: new Date(),
    });
  } else {
    await db.update(schema.portals)
      .set({ jobsCount: jobRows.length, lastSyncAt: new Date(), status: "active" })
      .where(eq(schema.portals.slug, "bundesagentur"));
  }

  console.log(`\n✓ Done! Seeded ${jobRows.length} jobs from 12 companies across 12 cities`);
  console.log("✓ Portal: Bundesagentur für Arbeit (active)");

  await client.end();
}

main().catch(console.error);
