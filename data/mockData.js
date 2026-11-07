window.CampusCodeMockData = {
  student: {
    name: "Sanskar Solapure",
    role: "STUDENT",
    initials: "SS"
  },
  dashboardRoutes: {
    overview: {
      label: "Overview",
      eyebrow: "01 / STUDENT WORKSPACE",
      headline: "Make something matter.",
      description: "Your workspace, current journey, builder status and opportunities — together in one view.",
      icon: "layout-dashboard.png",
      status: "OVERVIEW / AVAILABLE",
      preview: "The Overview is the primary student workspace surface with demonstration progress, opportunities, and builder tools."
    },
    events: {
      label: "Events",
      eyebrow: "02 / FIND YOUR ARENA",
      headline: "Find your next challenge.",
      description: "A dedicated home for upcoming hackathons, event categories, discovery and registration.",
      icon: "calendar-days.png",
      status: "LOCAL EVENT LISTINGS / DEMO",
      preview: "Event search, category filters, detail briefs, and local demonstration registration are available."
    },
    "my-events": {
      label: "My Events",
      eyebrow: "03 / YOUR BUILD JOURNEY",
      headline: "Keep your momentum.",
      description: "Track the events you join and understand what comes next in each participation journey.",
      icon: "trophy.png",
      status: "PARTICIPATION TRACKING / DEMO",
      preview: "The ReBuild '26 sample record includes an individual participation path and the tracking team name supplied for this project. Later stages remain incomplete."
    },
    hackmate: {
      label: "HackMate AI",
      eyebrow: "04 / FIND YOUR PEOPLE",
      headline: "Build better, together.",
      description: "A collaboration workspace for discovering students whose skills and interests complement your own.",
      icon: "bot.png",
      status: "SIMULATED MATCHING / DEMO",
      preview: "Suggested collaborators and simple matching use fictional local profiles. No AI service or live student directory is connected."
    },
    ideacheck: {
      label: "IdeaCheck AI",
      eyebrow: "05 / PRESSURE-TEST AN IDEA",
      headline: "Give a first thought a fair test.",
      description: "Shape a problem, articulate your proposed solution and explore ways an idea could improve.",
      icon: "lightbulb.png",
      status: "LOCAL CHECKLIST / DEMO",
      preview: "A deterministic checklist organises the idea brief and offers fixed reflection prompts. No AI model or remote analysis is connected."
    },
    certificates: {
      label: "Certificates",
      eyebrow: "06 / BUILDER RECORD",
      headline: "Keep the work that matters.",
      description: "Browse sample certificate layouts and print a non-verifiable demonstration preview.",
      icon: "certificate.png",
      status: "SAMPLE CERTIFICATES / NOT VERIFIED",
      preview: "Certificate examples are visual demonstrations only and do not represent verified awards or attendance."
    },
    "digital-id": {
      label: "Digital ID",
      eyebrow: "07 / YOUR BUILDER IDENTITY",
      headline: "A student identity, ready to share.",
      description: "A branded student identity card with a decorative code and local print/download actions.",
      icon: "qr-code.png",
      status: "DEMONSTRATION ID / NOT VERIFIED",
      preview: "No ID is verified by CampusCode. This card uses sample identity details and a decorative, non-scannable pattern."
    },
    rulebot: {
      label: "RuleBot AI",
      eyebrow: "08 / CLARITY FOR THE COMPETITION",
      headline: "Make the rules easier to navigate.",
      description: "A searchable, well-organised guide to common event rules, requirements and FAQs.",
      icon: "circle-question-mark.png",
      status: "PREDEFINED GUIDANCE / DEMO",
      preview: "Rule search and responses use predefined demonstration guidance. Verify event-specific details with the organiser."
    },
    "student-guide": {
      label: "Student Guide",
      eyebrow: "09 / A FIELD GUIDE FOR BUILDERS",
      headline: "Start with a useful next step.",
      description: "A practical guide to finding events, joining in and using the CampusCode workspace.",
      icon: "book-open.png",
      status: "EDITORIAL GUIDE / DEMO",
      preview: "Browse getting-started chapters and quick answers in an interactive field guide."
    },
    communications: {
      label: "Official Communication",
      eyebrow: "10 / CAMPUSCODE BULLETIN",
      headline: "A clear signal from the arena.",
      description: "A future bulletin for mock announcements, event notices and important updates.",
      icon: "megaphone.png",
      status: "SAMPLE BULLETIN / LOCAL",
      preview: "Search and filter sample announcements; opening and marking items read updates local demonstration state."
    },
    notifications: {
      label: "Notifications",
      eyebrow: "11 / YOUR SIGNALS",
      headline: "Keep up with what’s moving.",
      description: "A notification centre to review updates, separate unread items and manage demo signals.",
      icon: "bell.png",
      status: "LOCAL DEMONSTRATION / PERSISTED",
      preview: "Search, category filters, read state, mark-all-read, and confirmed clearing are available for local sample notifications."
    },
    support: {
      label: "Help & Support",
      eyebrow: "12 / A HAND WHEN YOU NEED ONE",
      headline: "Find a way through.",
      description: "Searchable guidance and a frontend help-request flow for common student questions.",
      icon: "circle-question-mark.png",
      status: "HELP CONTENT / LOCAL DEMO",
      preview: "Search help articles and validate a practice request. Nothing is sent or stored."
    },
    profile: {
      label: "Profile",
      eyebrow: "13 / YOUR STUDENT PROFILE",
      headline: "Make your builder identity yours.",
      description: "A student profile for skills, interests, college details and collaboration preferences.",
      icon: "square-user-round.png",
      status: "SAMPLE IDENTITY / LOCAL",
      preview: "Sanskar Solapure is sample identity data. Profile changes can be saved to this browser only."
    }
  },
  workspace: {
    year: 2026,
    status: "READY TO BUILD",
    eventCount: 1,
    activeProjectCount: 2,
    certificateCount: 3,
    buildStreakDays: 5
  },
  journey: {
    eventName: "ReBuild '26",
    registrationStatus: "REGISTERED",
    participation: "INDIVIDUAL",
    teamName: "quantum coder",
    eventStatus: "ACTIVE",
    currentStage: "preparation",
    stages: [
      { id: "registered", name: "REGISTERED", status: "complete", detail: "Your mock registration is confirmed." },
      { id: "preparation", name: "PREPARATION", status: "current", detail: "The current mock stage. Explore the challenge and plan your approach." },
      { id: "build", name: "BUILD", status: "upcoming", detail: "This stage has not started in the mock journey." },
      { id: "submission", name: "SUBMISSION", status: "upcoming", detail: "Submission is an upcoming stage in this mock journey." },
      { id: "results", name: "RESULTS", status: "upcoming", detail: "Results have not been published in this mock journey." }
    ]
  },
  opportunities: [
    {
      id: "ai",
      number: "01",
      name: "ARTIFICIAL INTELLIGENCE",
      description: "Explore challenges where machine intelligence meets meaningful problems.",
      accent: "purple",
      icon: "bot.png"
    },
    {
      id: "web",
      number: "02",
      name: "WEB DEVELOPMENT",
      description: "Design and ship thoughtful digital experiences for the next generation.",
      accent: "lime",
      icon: "layout-dashboard.png"
    },
    {
      id: "smart-tech",
      number: "03",
      name: "SMART TECHNOLOGY",
      description: "Connect useful ideas, emerging tools and the world around you.",
      accent: "ink",
      icon: "sparkles.png"
    }
  ],
  tools: [
    { id: "hackmate", name: "HackMate AI", description: "Find the right people for your next build.", icon: "bot.png", status: "PREVIEW" },
    { id: "ideacheck", name: "IdeaCheck AI", description: "Pressure-test an early project idea.", icon: "lightbulb.png", status: "PREVIEW" },
    { id: "rulebot", name: "RuleBot AI", description: "Get a clearer read on event guidelines.", icon: "circle-question-mark.png", status: "PREVIEW" },
    { id: "digital-id", name: "Digital ID", description: "Your student identity, ready to share.", icon: "qr-code.png", status: "PREVIEW" },
    { id: "certificates", name: "Certificates", description: "Keep your achievements together.", icon: "certificate.png", status: "PREVIEW" },
    { id: "student-guide", name: "Student Guide", description: "A starting point for your CampusCode journey.", icon: "book-open.png", status: "PREVIEW" }
  ],
  activity: [
    { time: "12:10", title: "Your workspace is ready.", detail: "A mock system signal for this preview.", icon: "sparkles.png", tone: "lime" },
    { time: "11:30", title: "New opportunity available.", detail: "Explore the mock categories in On Your Radar.", icon: "lightbulb.png", tone: "purple" },
    { time: "10:15", title: "Student profile updated.", detail: "Profile activity shown as demonstration data.", icon: "contact-round.png", tone: "ink" },
    { time: "09:42", title: "ReBuild '26 registration confirmed.", detail: "Mock registration status for the Overview preview.", icon: "circle-check.png", tone: "lime" }
  ],
  notifications: [
    { time: "12:10", title: "Your workspace is ready.", unread: true },
    { time: "11:30", title: "A new opportunity is on your radar.", unread: true },
    { time: "09:42", title: "ReBuild '26 registration confirmed.", unread: true }
  ]
};