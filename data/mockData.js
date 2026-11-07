window.CampusCodeMockData = {
  student: {
    name: "Sanskar Solapure",
    role: "STUDENT",
    initials: "SS"
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