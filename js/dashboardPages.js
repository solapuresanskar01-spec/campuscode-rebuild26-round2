(() => {
  const pageData = window.CampusCodePageData;
  const data = window.CampusCodeMockData;
  const keys = {
    profile: "campuscode.demo.profile",
    registrations: "campuscode.demo.registrations",
    idea: "campuscode.demo.idea",
    notifications: "campuscode.demo.notifications",
    communications: "campuscode.demo.communications"
  };
  const state = {
    route: "",
    eventFilter: "All",
    collaboratorFilter: "All",
    guideSearch: "",
    ruleCategory: "All",
    communicationFilter: "All",
    notificationFilter: "All",
    supportCategory: "All",
    certificateId: "",
    analysisTimer: 0,
    matchingRequests: new Set(),
    readCommunications: new Set(),
    notifications: [],
    callbacks: { showToast: () => {}, refreshNotifications: () => {}, goToRoute: () => {} }
  };

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[character]);
  }

  function readStorage(key, fallback) {
    try {
      const saved = window.localStorage.getItem(key);
      return saved ? JSON.parse(saved) : fallback;
    } catch (error) {
      state.callbacks.showToast(`LOCAL PREVIEW DATA COULD NOT BE READ: ${error.message}`);
      return fallback;
    }
  }

  function writeStorage(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      state.callbacks.showToast(`LOCAL PREVIEW DATA COULD NOT BE SAVED: ${error.message}`);
      return false;
    }
  }

  function profile() {
    const saved = readStorage(keys.profile, null);
    if (!saved || typeof saved !== "object" || Array.isArray(saved)) return { ...pageData.profile };
    const merged = { ...pageData.profile };
    for (const field of ["name", "email", "college", "year", "preference"]) {
      if (typeof saved[field] === "string") merged[field] = saved[field];
    }
    for (const field of ["skills", "interests"]) {
      if (Array.isArray(saved[field]) && saved[field].every((item) => typeof item === "string")) merged[field] = saved[field];
    }
    return merged;
  }

  function registeredEvents() {
    const saved = readStorage(keys.registrations, ["rebuild-26"]);
    return Array.isArray(saved) ? [...new Set(["rebuild-26", ...saved])] : ["rebuild-26"];
  }

  function notificationItems() {
    return state.notifications;
  }

  function badge(text, variant = "") {
    return `<span class="page-badge${variant ? ` page-badge--${variant}` : ""}">${escapeHTML(text)}</span>`;
  }

  function pageHeader(index, kicker, title, intro) {
    return `
      <header class="product-page__header">
        <p class="eyebrow">${escapeHTML(index)} — ${escapeHTML(kicker)}</p>
        <h1 tabindex="-1">${title}</h1>
        <p>${escapeHTML(intro)}</p>
      </header>
    `;
  }

  function emptyState(title, message) {
    return `<div class="dashboard-empty"><h2>${escapeHTML(title)}</h2><p>${escapeHTML(message)}</p></div>`;
  }

  function eventIsRegistered(id) {
    return registeredEvents().includes(id);
  }

  function eventCard(event) {
    const registered = eventIsRegistered(event.id);
    return `
      <article class="event-row" data-event-row data-search="${escapeHTML(`${event.title} ${event.category} ${event.format} ${event.tags.join(" ")}`.toLowerCase())}" data-category="${escapeHTML(event.category)}" data-status="${escapeHTML(event.status)}">
        <span class="event-row__date mono">${escapeHTML(event.date)}</span>
        <div class="event-row__copy">
          <div class="event-row__meta">${badge(event.category)} ${badge(event.status, event.status === "Registration open" ? "lime" : "")}</div>
          <h3>${escapeHTML(event.title)}</h3>
          <p>${escapeHTML(event.description)}</p>
          <span class="mono event-row__format">${escapeHTML(event.format)}</span>
        </div>
        <div class="event-row__actions">
          <button type="button" class="text-action" data-event-detail="${escapeHTML(event.id)}">DETAILS <span aria-hidden="true">↗</span></button>
          <button type="button" class="icon-action${registered ? " is-selected" : ""}" data-event-register="${escapeHTML(event.id)}" aria-pressed="${registered}" aria-label="${registered ? "Cancel" : "Register for"} ${escapeHTML(event.title)}">${registered ? "JOINED" : event.status === "Registration open" ? "JOIN" : "SOON"}</button>
        </div>
      </article>
    `;
  }

  function renderEventList() {
    const search = (document.querySelector("[data-event-search]")?.value ?? "").trim().toLowerCase();
    const chosen = state.eventFilter;
    const available = pageData.events.filter((event) => {
      const matchesSearch = `${event.title} ${event.category} ${event.format} ${event.description} ${event.tags.join(" ")}`.toLowerCase().includes(search);
      const matchesFilter = chosen === "All"
        || chosen === "Registration open" && event.status === chosen
        || chosen === "Coming soon" && event.status === chosen
        || event.category === chosen;
      return matchesSearch && matchesFilter;
    });
    const results = document.querySelector("[data-event-results]");
    if (!results) return;
    results.innerHTML = available.length
      ? available.map(eventCard).join("")
      : emptyState("No events match that search.", "Try another phrase or choose a different category.");
    document.querySelector("[data-event-result-count]").textContent = `${String(available.length).padStart(2, "0")} LISTED`;
  }

  function renderEvents() {
    const featured = pageData.events.find((event) => event.featured);
    const categories = ["All", "Registration open", "Coming soon", ...new Set(pageData.events.map((event) => event.category))];
    return `
      ${pageHeader("01", "FIND YOUR ARENA", "Choose a question worth building for.", "A curated field of student-focused challenges. All listings and dates are demonstration content.")}
      <section class="event-feature" aria-labelledby="event-feature-title">
        <div class="event-feature__copy">
          <p class="mono">FEATURED / CAMPUSCODE DEMO LISTING</p>
          <h2 id="event-feature-title">${escapeHTML(featured.title)}</h2>
          <p>${escapeHTML(featured.description)}</p>
          <div class="event-feature__facts"><span>${escapeHTML(featured.date)}</span><span>${escapeHTML(featured.format)}</span></div>
          <div class="event-feature__actions">
            <button type="button" class="dashboard-button" data-event-register="${escapeHTML(featured.id)}">${eventIsRegistered(featured.id) ? "REGISTRATION SAVED" : "REGISTER INTEREST"} <span aria-hidden="true">→</span></button>
            <button type="button" class="dashboard-button dashboard-button--secondary" data-event-detail="${escapeHTML(featured.id)}">READ EVENT NOTE</button>
          </div>
        </div>
        <div class="event-feature__art" aria-hidden="true"><span class="event-feature__orbit"></span><span class="event-feature__orbit event-feature__orbit--inner"></span><span class="event-feature__tile">BUILD<br><b>26</b></span><i></i><i></i></div>
        <span class="event-feature__index mono">CC / 026</span>
      </section>
      <section class="event-detail-panel" data-event-detail-panel aria-live="polite">
        <span class="mono">EVENT NOTE / SELECT DETAILS</span>
        <p>Choose “Details” on an event to read its demonstration brief here.</p>
      </section>
      <section class="event-discovery" aria-labelledby="event-list-title">
        <div class="page-section-heading"><div><p class="eyebrow">01 / OPEN CALLS</p><h2 id="event-list-title">Upcoming events</h2></div><span class="mono" data-event-result-count>00 LISTED</span></div>
        <div class="event-controls">
          <label class="dashboard-search"><span class="sr-only">Search events</span><input type="search" placeholder="Search events, topics, formats" data-event-search></label>
          <div class="dashboard-filter-group" role="group" aria-label="Filter events by category">
            ${categories.map((category) => `<button type="button" class="dashboard-filter" data-event-filter="${escapeHTML(category)}" aria-pressed="${category === state.eventFilter}">${escapeHTML(category)}</button>`).join("")}
          </div>
        </div>
        <div class="event-list" data-event-results><div class="event-loading" data-event-loading><span class="build-loader" aria-hidden="true"><i></i><i></i><i></i></span><span class="mono">LOADING DEMONSTRATION LISTINGS</span></div></div>
      </section>
      <section class="category-ribbon"><span class="mono">EXPLORE BY QUESTION</span><div>${["AI innovation", "Future web", "Campus tech"].map((item, index) => `<button type="button" data-event-filter="${escapeHTML(item)}"><span class="mono">0${index + 1}</span>${escapeHTML(item)}<b aria-hidden="true">↗</b></button>`).join("")}</div></section>
    `;
  }

  function renderMyEvents() {
    const joined = pageData.events.filter((event) => eventIsRegistered(event.id));
    const activeEvents = joined.filter((event) => event.id === "rebuild-26");
    const upcomingEvents = joined.filter((event) => event.id !== "rebuild-26" && event.status !== "Completed");
    const completedEvents = joined.filter((event) => event.status === "Completed");
    const stages = data.journey.stages;
    const currentIndex = stages.findIndex((stage) => stage.id === data.journey.currentStage);
    return `
      ${pageHeader("02", "YOUR BUILD JOURNEY", "Keep your momentum.", "A participation ledger built from local demonstration state. No achievements are inferred or awarded here.")}
      <section class="event-state-grid" aria-label="Participation status summary"><div><span class="mono">REGISTERED</span><strong>${String(joined.length).padStart(2, "0")}</strong><small>LOCAL RECORDS</small></div><div><span class="mono">UPCOMING</span><strong>${String(upcomingEvents.length).padStart(2, "0")}</strong><small>NOT YET ACTIVE</small></div><div><span class="mono">ACTIVE</span><strong>${String(activeEvents.length).padStart(2, "0")}</strong><small>MOCK JOURNEY</small></div><div><span class="mono">COMPLETED</span><strong>${String(completedEvents.length).padStart(2, "0")}</strong><small>NO ACHIEVEMENTS CLAIMED</small></div></section>
      <div class="participation-summary"><span class="mono">YOUR PARTICIPATION</span><strong>${String(joined.length).padStart(2, "0")}</strong><p>event${joined.length === 1 ? "" : "s"} in this local preview</p><a href="#events" data-route-link="events">FIND AN EVENT <span aria-hidden="true">↗</span></a></div>
      <section class="participation-state"><h2>Upcoming</h2>${upcomingEvents.length ? upcomingEvents.map((event) => `<p>${escapeHTML(event.title)} / ${escapeHTML(event.date)}</p>`).join("") : `<p>No upcoming registrations in this sample.</p>`}</section>
      <div class="page-section-heading"><div><p class="eyebrow">01 / CURRENT PARTICIPATION</p><h2>Registered &amp; active</h2></div><span class="mono">LOCAL RECORDS</span></div>
      <section class="participation-list" aria-label="Registered events">
        ${joined.length ? joined.map((event) => `
          <article class="participation-event">
            <div class="participation-event__heading"><p class="mono">REGISTERED / DEMONSTRATION RECORD</p><span class="mono">${escapeHTML(event.date)}</span></div>
            <h2>${escapeHTML(event.title)}</h2>
            <p class="participation-event__intro">${escapeHTML(event.description)}</p>
            <div class="participation-facts"><p><span class="mono">PARTICIPATION</span><strong>${event.id === "rebuild-26" ? "Individual" : "Not selected"}</strong></p><p><span class="mono">TRACKING TEAM</span><strong>${event.id === "rebuild-26" ? "quantum coder" : "Not provided"}</strong></p><p><span class="mono">EVENT STATUS</span><strong>${event.id === "rebuild-26" ? "Active — mock data" : event.status}</strong></p></div>
            ${event.id === "rebuild-26" ? `<div class="participation-timeline" aria-label="Participation timeline">${stages.map((stage, index) => `<div class="participation-step ${index < currentIndex ? "is-complete" : index === currentIndex ? "is-current" : ""}"><span>${String(index + 1).padStart(2, "0")}</span><strong>${escapeHTML(stage.name)}</strong><small>${escapeHTML(stage.detail)}</small></div>`).join("")}</div><p class="participation-note mono">ONLY REGISTRATION IS COMPLETE. LATER STAGES ARE NOT YET REACHED.</p>` : ""}
          </article>
        `).join("") : emptyState("Your next event starts with a search.", "No event registrations are saved in this preview yet.")}
      </section>
      <section class="participation-state${completedEvents.length ? "" : " participation-state--empty"}"><h2>Completed</h2>${completedEvents.length ? completedEvents.map((event) => `<p>${escapeHTML(event.title)} / ${escapeHTML(event.date)}</p>`).join("") : `<p>No completed events or achievements are represented in this demo.</p>`}</section>
      <p class="data-disclaimer mono">LOCAL PREVIEW / REGISTRATION DATA IS NOT SENT TO AN ORGANISER.</p>
    `;
  }

  function renderProfile() {
    const item = profile();
    const edit = state.editProfile === true;
    return `
      ${pageHeader("03", "YOUR STUDENT PROFILE", "Make your builder identity yours.", "A local profile for the details you choose to share. All identity and institution details are sample data.")}
      <section class="profile-layout">
        <div class="profile-identity"><div class="profile-avatar" aria-hidden="true">${escapeHTML(item.name.split(/\s+/).map((part) => part[0] || "").join("").slice(0, 2).toUpperCase())}</div><p class="mono">STUDENT / SAMPLE IDENTITY</p><h2>${escapeHTML(item.name)}</h2><span class="profile-identity__college">${escapeHTML(item.college)}</span><span class="mono profile-identity__status">VISIBLE TO YOU / LOCAL ONLY</span></div>
        <form class="profile-form" data-profile-form>
          <div class="page-section-heading"><div><p class="eyebrow">PROFILE / DETAILS</p><h2>Student details</h2></div><button type="button" class="text-action" data-profile-edit>${edit ? "EDITING" : "EDIT PROFILE"} <span aria-hidden="true">↗</span></button></div>
          <div class="profile-fields">
            <label class="dashboard-form-field">Full name<input name="name" autocomplete="name" required minlength="2" value="${escapeHTML(item.name)}" ${edit ? "" : "readonly"}></label>
            <label class="dashboard-form-field">Email<input name="email" type="email" autocomplete="email" required value="${escapeHTML(item.email)}" ${edit ? "" : "readonly"}></label>
            <label class="dashboard-form-field">College / institution<input name="college" required value="${escapeHTML(item.college)}" ${edit ? "" : "readonly"}></label>
            <label class="dashboard-form-field">Year of study<input name="year" required value="${escapeHTML(item.year)}" ${edit ? "" : "readonly"}></label>
            <label class="dashboard-form-field profile-fields__wide">Skills <span class="mono">COMMA-SEPARATED</span><input name="skills" value="${escapeHTML(item.skills.join(", "))}" ${edit ? "" : "readonly"}></label>
            <label class="dashboard-form-field profile-fields__wide">Interests <span class="mono">COMMA-SEPARATED</span><input name="interests" value="${escapeHTML(item.interests.join(", "))}" ${edit ? "" : "readonly"}></label>
            <label class="dashboard-form-field profile-fields__wide">Collaboration preference<input name="preference" value="${escapeHTML(item.preference)}" ${edit ? "" : "readonly"}></label>
          </div>
          ${edit ? `<div class="form-actions"><button type="submit" class="dashboard-button">SAVE PROFILE <span aria-hidden="true">→</span></button><button type="button" class="dashboard-button dashboard-button--secondary" data-profile-cancel>CANCEL</button></div>` : ""}
          <p class="mono profile-local-note">SAVED TO THIS BROWSER ONLY / NOT A VERIFIED STUDENT RECORD</p>
        </form>
      </section>
    `;
  }

  function qrCells() {
    const pattern = [
      "1111111001001", "1000001010110", "1011101011101", "1011101000010", "1011101010101",
      "1000001001110", "1111111010101", "0001000011010", "1010111110001", "0110100011100",
      "1101111010011", "0010000110101", "1011011101001"
    ];
    return pattern.join("").split("").map((cell) => `<i${cell === "1" ? ' class="is-dark"' : ""}></i>`).join("");
  }

  function renderDigitalId() {
    const item = profile();
    return `
      ${pageHeader("04", "YOUR BUILDER IDENTITY", "An identity card for the arena.", "A printable visual keeps your sample profile together. This card is not official identification and is not verified.")}
      <div class="id-workspace">
        <article class="digital-card" id="digital-card">
          <div class="digital-card__top"><img src="../assets/images/campuscode-logo.png" alt="CampusCode"><span class="mono">STUDENT / DEMO</span></div>
          <div class="digital-card__body"><div><p class="mono">BUILDER IDENTITY / 2026</p><h2>${escapeHTML(item.name)}</h2><p>${escapeHTML(item.college)}</p><span class="digital-card__id mono">DEMO-CC-026-SS</span></div><div class="digital-card__qr" role="img" aria-label="Decorative QR-style pattern, not scannable">${qrCells()}</div></div>
          <div class="digital-card__bottom"><span class="mono">NOT OFFICIAL IDENTIFICATION</span><span>BUILD. COMPETE. SHIP.</span></div>
          <span class="digital-card__watermark" aria-hidden="true">DEMO</span>
        </article>
        <aside class="id-notes"><p class="eyebrow">A SHAREABLE DEMO / NOT A CREDENTIAL</p><h2>Made for a preview, not verification.</h2><p>The QR-style mark is decorative. This local ID does not verify enrolment or grant access to any event.</p><div class="id-actions"><button type="button" class="dashboard-button" data-print-card>PRINT ID <span aria-hidden="true">↗</span></button><button type="button" class="dashboard-button dashboard-button--secondary" data-download-id>DOWNLOAD DETAILS</button></div></aside>
      </div>
    `;
  }

  const certificates = [
    { id: "build-lab", title: "Builder Lab / Participation", event: "CampusCode Builder Lab", date: "SAMPLE / OCT 2026", note: "A non-verifiable example certificate layout for a frontend preview." },
    { id: "web-study", title: "Open Web / Workshop", event: "Open Web Study Session", date: "SAMPLE / SEP 2026", note: "Sample workshop certificate. No attendance record is associated with this example." },
    { id: "team-practice", title: "Team Practice / Completion", event: "CampusCode Team Practice", date: "SAMPLE / AUG 2026", note: "A visual sample only. It does not represent a real award or verified achievement." }
  ];

  function certificateMarkup(item, preview = false) {
    return `<div class="certificate-art${preview ? " certificate-art--preview" : ""}" id="certificate-print"><div class="certificate-art__frame"><span class="mono">CAMPUSCODE / DEMONSTRATION ONLY</span><div class="certificate-art__mark">CC<span>.</span></div><p class="eyebrow">CERTIFICATE OF PARTICIPATION / SAMPLE</p><h2>${escapeHTML(item.title)}</h2><p class="certificate-art__recipient">${escapeHTML(profile().name)}</p><p class="certificate-art__detail">${escapeHTML(item.event)}<br>${escapeHTML(item.date)}</p><div class="certificate-art__seal">DEMO</div><small>NOT AN OFFICIAL AWARD / NOT VERIFIED</small></div></div>`;
  }

  function renderCertificates() {
    return `
      ${pageHeader("05", "BUILDER RECORD", "Keep the work that matters.", "Explore certificate layouts as demonstration samples. They are not verified awards or records of attendance.")}
      <div class="certificate-overview"><div><span class="mono">SAMPLE CERTIFICATES</span><strong>03</strong><small>DEMO ONLY / NO VERIFIED AWARDS</small></div><p>Use the preview to inspect the print layout. No award information is stored as an official record.</p></div>
      <div class="certificate-grid">${certificates.map((item, index) => `<article class="certificate-item"><div class="certificate-item__mini"><span class="mono">SAMPLE / 0${index + 1}</span><strong>${escapeHTML(item.title)}</strong><span>NOT VERIFIED</span></div><div class="certificate-item__copy"><p class="eyebrow">${escapeHTML(item.date)}</p><h2>${escapeHTML(item.title)}</h2><p>${escapeHTML(item.note)}</p><div><button type="button" class="text-action" data-certificate-preview="${item.id}">PREVIEW <span aria-hidden="true">↗</span></button><button type="button" class="text-action" data-certificate-print="${item.id}">PRINT <span aria-hidden="true">→</span></button></div></div></article>`).join("")}</div>
      <dialog class="page-dialog" data-certificate-dialog aria-labelledby="certificate-dialog-title"><div class="page-dialog__head"><p class="mono">SAMPLE CERTIFICATE / NOT VERIFIED</p><button type="button" aria-label="Close preview" data-dialog-close>×</button></div><div data-certificate-preview-content></div><div class="page-dialog__actions"><button type="button" class="dashboard-button" data-certificate-print-current>PRINT SAMPLE</button><button type="button" class="dashboard-button dashboard-button--secondary" data-dialog-close>CLOSE</button></div></dialog>
    `;
  }

  function collaboratorScore(item, user) {
    const sharedSkills = item.skills.filter((skill) => user.skills.some((own) => own.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(own.toLowerCase()))).length;
    const sharedInterests = item.interests.filter((interest) => user.interests.includes(interest)).length;
    return sharedSkills + sharedInterests;
  }

  function renderCollaborators() {
    const user = profile();
    const search = (document.querySelector("[data-collaborator-search]")?.value ?? "").trim().toLowerCase();
    const results = pageData.collaborators.filter((item) => {
      const text = `${item.name} ${item.field} ${item.skills.join(" ")} ${item.interests.join(" ")}`.toLowerCase();
      const matchesSearch = text.includes(search);
      const matchesFilter = state.collaboratorFilter === "All" || item.interests.includes(state.collaboratorFilter) || item.skills.some((skill) => skill.toLowerCase().includes(state.collaboratorFilter.toLowerCase()));
      return matchesSearch && matchesFilter;
    }).sort((a, b) => collaboratorScore(b, user) - collaboratorScore(a, user));
    const container = document.querySelector("[data-collaborator-results]");
    if (!container) return;
    container.innerHTML = results.length ? results.map((item, index) => `
      <article class="collaborator-row">
        <div class="collaborator-avatar collaborator-avatar--${item.color}">${escapeHTML(item.name.split(" ").map((part) => part[0]).join(""))}</div>
        <div class="collaborator-row__identity"><span class="mono">DEMO BUILDER / 0${index + 1}</span><h3>${escapeHTML(item.name)}</h3><p>${escapeHTML(item.field)}</p></div>
        <div class="collaborator-row__tags">${item.skills.slice(0, 3).map((skill) => badge(skill)).join("")}</div>
        <p class="collaborator-row__preference">${escapeHTML(item.preference)}</p>
        <div class="collaborator-row__actions"><button type="button" class="text-action" data-collaborator-preview="${item.id}">PROFILE <span aria-hidden="true">↗</span></button><button type="button" class="dashboard-button${state.matchingRequests.has(item.id) ? " dashboard-button--secondary" : ""}" data-collaborator-connect="${item.id}" aria-pressed="${state.matchingRequests.has(item.id)}">${state.matchingRequests.has(item.id) ? "REQUESTED" : "CONNECT"}</button></div>
      </article>
    `).join("") : emptyState("No builders found.", "Try another skill, interest, or filter.");
    document.querySelector("[data-collaborator-count]").textContent = `${String(results.length).padStart(2, "0")} SUGGESTED`;
  }

  function renderHackmate() {
    const filters = ["All", ...new Set(pageData.collaborators.flatMap((item) => item.interests))];
    const user = profile();
    return `
      ${pageHeader("06", "FIND YOUR PEOPLE", "A good team starts with a conversation.", "Browse fictional collaborator profiles and find complementary interests. Matching is a simple local demo, not an AI or live directory.")}
      <section class="collaboration-profile"><div><p class="mono">YOUR COLLABORATION SIGNAL / SAMPLE PROFILE</p><h2>${escapeHTML(user.preference)}</h2><p>Based on your saved profile: ${user.skills.map(escapeHTML).join(" / ")}.</p></div><a href="#profile" data-route-link="profile">EDIT YOUR PROFILE <span aria-hidden="true">↗</span></a></section>
      <div class="collaborator-controls"><label class="dashboard-search"><span class="sr-only">Search collaborators</span><input type="search" placeholder="Search skills, names, interests" data-collaborator-search></label><div class="dashboard-filter-group" role="group" aria-label="Filter collaborators">${filters.map((filter) => `<button class="dashboard-filter" type="button" data-collaborator-filter="${escapeHTML(filter)}" aria-pressed="${filter === state.collaboratorFilter}">${escapeHTML(filter)}</button>`).join("")}</div></div>
      <div class="collaborator-list-head mono"><span>BUILDER / DEMO PROFILE</span><span>SKILLS / INTERESTS</span><span><span data-collaborator-count>00 SUGGESTED</span> / COLLABORATION</span></div>
      <section class="collaborator-list" data-collaborator-results></section>
      <p class="data-disclaimer mono">SIMULATED SUGGESTIONS / NO MESSAGES ARE SENT AND NO STUDENT DIRECTORY IS CONNECTED.</p>
      <dialog class="page-dialog page-dialog--compact" data-collaborator-dialog><div class="page-dialog__head"><p class="mono">DEMO BUILDER PROFILE</p><button type="button" aria-label="Close profile" data-dialog-close>×</button></div><div data-collaborator-preview-content></div></dialog>
    `;
  }

  function renderIdeaCheck() {
    const saved = readStorage(keys.idea, null);
    const item = saved && typeof saved === "object" ? saved : {};
    return `
      ${pageHeader("07", "PRESSURE-TEST AN IDEA", "Start with a problem you can name.", "Organise an early idea and receive a deterministic checklist of prompts. No AI model or remote analysis is used.")}
      <div class="idea-workspace">
        <form class="idea-form" data-idea-form>
          <p class="eyebrow">01 / YOUR IDEA BRIEF</p>
          <label class="dashboard-form-field">Idea title<input name="title" maxlength="80" required placeholder="e.g. A calmer campus wayfinder" value="${escapeHTML(item.title ?? "")}"></label>
          <label class="dashboard-form-field">Problem statement<textarea name="problem" maxlength="600" required placeholder="Who experiences what problem, and when?">${escapeHTML(item.problem ?? "")}</textarea></label>
          <label class="dashboard-form-field">Proposed solution<textarea name="solution" maxlength="600" required placeholder="What could you make to address it?">${escapeHTML(item.solution ?? "")}</textarea></label>
          <label class="dashboard-form-field">Target audience<input name="audience" maxlength="140" required placeholder="Who would use or benefit from this?" value="${escapeHTML(item.audience ?? "")}"></label>
          <div class="idea-form__actions"><button type="submit" class="dashboard-button" data-analyze-idea>RUN LOCAL CHECK <span aria-hidden="true">→</span></button><button type="button" class="dashboard-button dashboard-button--secondary" data-save-idea>SAVE BRIEF</button></div>
        </form>
        <aside class="idea-analysis" aria-live="polite"><div class="idea-analysis__top"><p class="mono">02 / STRUCTURED REVIEW</p><span class="idea-analysis__stamp">LOCAL<br>DEMO</span></div><div class="idea-checklist" data-idea-checklist><p>Submit a brief to see what you've described and which questions might help next.</p></div><div class="idea-results" data-idea-results hidden></div></aside>
      </div>
      <p class="data-disclaimer mono">NOT AI / CHECKLIST RULES ARE FIXED / RESULTS ARE NOT EXPERT OR MARKET VALIDATION.</p>
    `;
  }

  function renderRulebotResults() {
    const query = (document.querySelector("[data-rule-search]")?.value ?? "").trim().toLowerCase();
    const matches = pageData.rules.filter((rule) => {
      const categoryMatches = state.ruleCategory === "All" || rule.category === state.ruleCategory;
      const queryMatches = !query || `${rule.category} ${rule.question} ${rule.answer}`.toLowerCase().includes(query);
      return categoryMatches && queryMatches;
    });
    const container = document.querySelector("[data-rule-results]");
    if (!container) return;
    container.innerHTML = matches.length ? matches.map((rule) => `
      <details class="rule-item" data-rule-item><summary><span class="mono">${escapeHTML(rule.category)}</span><strong>${escapeHTML(rule.question)}</strong><i aria-hidden="true">+</i></summary><p>${escapeHTML(rule.answer)}</p></details>
    `).join("") : emptyState("No guidance found.", "Try another phrase or select All topics.");
  }

  function renderRulebot() {
    const categories = ["All", ...new Set(pageData.rules.map((rule) => rule.category))];
    return `
      ${pageHeader("08", "CLARITY FOR THE COMPETITION", "Find a clearer read on the rules.", "Search predefined guidance and common questions. RuleBot is a local content demo, not an AI service or an official rules source.")}
      <section class="rulebot-question"><div><p class="mono">ASK A QUESTION / PREDEFINED MATCH</p><h2>What do you need to know?</h2></div><form data-rule-question-form><label class="dashboard-search"><span class="sr-only">Ask a rules question</span><input type="search" name="question" required placeholder="Try: team size, original work, submissions"></label><button type="submit" class="dashboard-button">FIND GUIDANCE <span aria-hidden="true">→</span></button></form></section>
      <div class="rulebot-controls"><label class="dashboard-search"><span class="sr-only">Search all guidance</span><input type="search" data-rule-search placeholder="Search questions and answers"></label><div class="dashboard-filter-group" role="group" aria-label="Filter guidance categories">${categories.map((category) => `<button type="button" class="dashboard-filter" data-rule-filter="${escapeHTML(category)}" aria-pressed="${category === state.ruleCategory}">${escapeHTML(category)}</button>`).join("")}</div></div>
      <section class="rule-list" data-rule-results></section>
      <p class="data-disclaimer mono">PREDEFINED DEMONSTRATION GUIDANCE / ALWAYS CHECK THE EVENT ORGANISER'S PUBLISHED RULES.</p>
    `;
  }

  function renderGuideItems() {
    const query = state.guideSearch.trim().toLowerCase();
    const items = pageData.guide.filter((item) => `${item.title} ${item.category} ${item.body}`.toLowerCase().includes(query));
    const container = document.querySelector("[data-guide-list]");
    if (!container) return;
    container.innerHTML = items.length ? items.map((item) => `
      <details class="guide-chapter" data-guide-chapter><summary><span class="guide-chapter__number mono">${item.number}</span><span class="guide-chapter__title"><small class="mono">${escapeHTML(item.category)}</small><strong>${escapeHTML(item.title)}</strong></span><i aria-hidden="true">+</i></summary><div class="guide-chapter__body"><p>${escapeHTML(item.body)}</p><span class="mono">FIELD NOTE / ${item.number}</span></div></details>
    `).join("") : emptyState("No guide notes match.", "Try a different search.");
  }

  function renderGuide() {
    return `
      ${pageHeader("09", "A FIELD GUIDE FOR BUILDERS", "Start with a useful next step.", "An editorial guide to finding events, joining in, and making your CampusCode workspace useful.")}
      <section class="guide-intro"><span class="mono">A PRACTICAL FIELD GUIDE / 05 NOTES</span><p>There is no one way to start building. Pick the next decision you can make, then learn from what happens.</p><label class="dashboard-search"><span class="sr-only">Search guide</span><input type="search" placeholder="Search chapters" data-guide-search></label></section>
      <section class="guide-layout"><nav class="guide-index" aria-label="Guide chapters">${pageData.guide.map((item) => `<a href="#guide-${item.id}" data-guide-jump="${item.id}"><span class="mono">${item.number}</span>${escapeHTML(item.category)}</a>`).join("")}</nav><div class="guide-list" data-guide-list></div></section>
      <section class="guide-faq"><p class="eyebrow">QUICK QUESTIONS</p><h2>Before you begin</h2><div>${pageData.support.slice(0, 3).map((item) => `<details class="rule-item"><summary><strong>${escapeHTML(item.question)}</strong><i aria-hidden="true">+</i></summary><p>${escapeHTML(item.answer)}</p></details>`).join("")}</div></section>
    `;
  }

  function saveReadCommunications() {
    writeStorage(keys.communications, [...state.readCommunications]);
  }

  function renderCommunicationList() {
    const search = (document.querySelector("[data-communication-search]")?.value ?? "").trim().toLowerCase();
    const container = document.querySelector("[data-communication-list]");
    if (!container) return;
    const items = pageData.communications.filter((item) => {
      const unread = item.unread && !state.readCommunications.has(item.id);
      const matchesFilter = state.communicationFilter === "All" || (state.communicationFilter === "Unread" ? unread : item.category === state.communicationFilter);
      const matchesSearch = `${item.category} ${item.title} ${item.body}`.toLowerCase().includes(search);
      return matchesFilter && matchesSearch;
    });
    container.innerHTML = items.length ? items.map((item) => {
      const unread = item.unread && !state.readCommunications.has(item.id);
      return `<article class="bulletin-item${unread ? " is-unread" : ""}" data-communication-item="${item.id}"><div class="bulletin-item__date"><time class="mono">${escapeHTML(item.date)}</time><button type="button" class="text-action" data-communication-read="${item.id}">${unread ? "MARK READ" : "MARK UNREAD"}</button></div><details data-communication-details="${item.id}"><summary><span class="bulletin-item__meta">${badge(item.category)}${item.pinned ? badge("PINNED", "lime") : ""}${unread ? '<i class="unread-dot" aria-label="Unread"></i>' : ""}</span><h2>${escapeHTML(item.title)}</h2><span class="mono">${unread ? "UNREAD" : "READ"} / OPEN <b aria-hidden="true">↘</b></span></summary><p>${escapeHTML(item.body)}</p></details></article>`;
    }).join("") : emptyState("No announcements found.", "Try a different search or category.");
  }

  function renderCommunications() {
    const categories = ["All", "Unread", ...new Set(pageData.communications.map((item) => item.category))];
    return `
      ${pageHeader("10", "CAMPUSCODE BULLETIN", "A clear signal from the arena.", "Sample notices and product notes, with local read status. These are not official event announcements.")}
      <section class="bulletin-lead"><p class="mono">BULLETIN / LOCAL DEMONSTRATION</p><h2>Useful updates, without the noise.</h2><span class="bulletin-lead__count">${String(pageData.communications.filter((item) => item.unread && !state.readCommunications.has(item.id)).length).padStart(2, "0")}<small>UNREAD</small></span></section>
      <div class="bulletin-controls"><label class="dashboard-search"><span class="sr-only">Search announcements</span><input type="search" placeholder="Search announcements" data-communication-search></label><div class="dashboard-filter-group" role="group" aria-label="Filter announcements">${categories.map((category) => `<button type="button" class="dashboard-filter" data-communication-filter="${escapeHTML(category)}" aria-pressed="${category === state.communicationFilter}">${escapeHTML(category)}</button>`).join("")}</div></div>
      <section class="bulletin-list" data-communication-list></section>
      <p class="data-disclaimer mono">SAMPLE BULLETIN / NO OFFICIAL CAMPUSCODE OR EVENT ORGANISER UPDATES ARE CONNECTED.</p>
    `;
  }

  function persistNotifications() {
    writeStorage(keys.notifications, state.notifications);
    state.callbacks.refreshNotifications();
  }

  function renderNotificationList() {
    const query = (document.querySelector("[data-notification-search]")?.value ?? "").trim().toLowerCase();
    const container = document.querySelector("[data-notification-results]");
    if (!container) return;
    const results = state.notifications.filter((item) => {
      const matchesQuery = `${item.title} ${item.detail} ${item.category}`.toLowerCase().includes(query);
      const matchesFilter = state.notificationFilter === "All"
        || (state.notificationFilter === "Unread" ? item.unread : state.notificationFilter === "Read" ? !item.unread : item.category === state.notificationFilter);
      return matchesQuery && matchesFilter;
    });
    container.innerHTML = results.length ? results.map((item) => `
      <article class="notification-full-row${item.unread ? " is-unread" : ""}"><span class="notification-full-row__mark" aria-hidden="true"></span><div><p class="mono">${escapeHTML(item.category)} / ${escapeHTML(item.time)}</p><h2>${escapeHTML(item.title)}</h2><p>${escapeHTML(item.detail)}</p></div><button type="button" class="text-action" data-notification-toggle="${escapeHTML(item.id)}">${item.unread ? "MARK READ" : "MARK UNREAD"} <span aria-hidden="true">↗</span></button></article>
    `).join("") : emptyState("Nothing in this view.", query ? "Try another search or filter." : "Notifications matching this filter will appear here.");
    const unread = state.notifications.filter((item) => item.unread).length;
    const read = state.notifications.length - unread;
    document.querySelector("[data-notification-summary]").innerHTML = `<span><strong>${String(state.notifications.length).padStart(2, "0")}</strong><small>ALL</small></span><span><strong>${String(unread).padStart(2, "0")}</strong><small>UNREAD</small></span><span><strong>${String(read).padStart(2, "0")}</strong><small>READ</small></span>`;
  }

  function renderNotificationsPage() {
    const categories = ["All", "Unread", "Read", ...new Set(state.notifications.map((item) => item.category))];
    return `
      ${pageHeader("11", "YOUR SIGNALS", "Keep up with what's moving.", "Manage local demonstration notifications. Read state and clear actions persist in this browser only.")}
      <section class="notification-center">
        <div class="notification-summary" data-notification-summary></div>
        <div class="notification-center__actions"><button type="button" class="dashboard-button dashboard-button--secondary" data-notifications-all-read>MARK ALL READ</button><button type="button" class="text-action text-action--danger" data-notifications-clear> CLEAR ALL <span aria-hidden="true">×</span></button></div>
        <div class="notification-center__controls"><label class="dashboard-search"><span class="sr-only">Search notifications</span><input type="search" placeholder="Search your signals" data-notification-search></label><div class="dashboard-filter-group" role="group" aria-label="Filter notifications">${categories.map((category) => `<button type="button" class="dashboard-filter" data-notification-filter="${escapeHTML(category)}" aria-pressed="${category === state.notificationFilter}">${escapeHTML(category)}</button>`).join("")}</div></div>
        <div class="notification-full-list" data-notification-results></div>
      </section>
      <div class="confirm-strip" data-notification-confirm hidden><p>Clear every local demonstration notification?</p><div><button type="button" class="dashboard-button dashboard-button--secondary" data-notifications-cancel>KEEP THEM</button><button type="button" class="dashboard-button" data-notifications-confirm>YES, CLEAR ALL</button></div></div>
      <p class="data-disclaimer mono">LOCAL PREVIEW / CLEARING THESE NOTIFICATIONS DOES NOT AFFECT AN ACCOUNT.</p>
    `;
  }

  function renderSupportResults() {
    const query = (document.querySelector("[data-support-search]")?.value ?? "").trim().toLowerCase();
    const results = pageData.support.filter((item) => (state.supportCategory === "All" || item.category === state.supportCategory)
      && `${item.question} ${item.answer} ${item.category}`.toLowerCase().includes(query));
    const container = document.querySelector("[data-support-faq]");
    if (!container) return;
    container.innerHTML = results.length ? results.map((item) => `<details class="rule-item"><summary><strong>${escapeHTML(item.question)}</strong><i aria-hidden="true">+</i></summary><p>${escapeHTML(item.answer)}</p></details>`).join("") : emptyState("No help articles found.", "Try a different search.");
  }

  function renderSupport() {
    return `
      ${pageHeader("12", "A HAND WHEN YOU NEED ONE", "Find a way through.", "Browse practical help or try a validated request form. Submissions are not sent or stored anywhere.")}
      <div class="support-layout">
        <section class="support-search-section"><p class="eyebrow">01 / HELP ARTICLES</p><h2>Start with a quick answer.</h2><label class="dashboard-search"><span class="sr-only">Search help articles</span><input type="search" placeholder="Search help and FAQs" data-support-search></label><div class="support-categories">${["Account & privacy", "Events & registration", "Workspace tools"].map((item, index) => `<button type="button" class="support-category" data-support-category="${escapeHTML(item)}" aria-pressed="${state.supportCategory === item}"><span class="mono">0${index + 1}</span>${escapeHTML(item)}<b aria-hidden="true">↘</b></button>`).join("")}</div><div class="support-faq" data-support-faq></div></section>
        <form class="support-form" data-support-form><p class="eyebrow">02 / LOCAL DEMONSTRATION</p><h2>Send a practice request.</h2><p>This form validates in your browser and does not send a message.</p><label class="dashboard-form-field">Topic<select name="category" required><option value="">Choose a topic</option><option>Account & privacy</option><option>Events & registration</option><option>Workspace tools</option><option>Other</option></select></label><label class="dashboard-form-field">Your email<input type="email" name="email" required placeholder="you@example.test" autocomplete="email"></label><label class="dashboard-form-field">What do you need help with?<textarea name="message" minlength="12" maxlength="800" required placeholder="Share a little context (12 characters minimum)"></textarea></label><button type="submit" class="dashboard-button">SUBMIT LOCAL REQUEST <span aria-hidden="true">→</span></button><p class="mono">DO NOT ENTER SENSITIVE INFORMATION.</p><div class="support-success" data-support-success role="status" hidden></div></form>
      </div>
    `;
  }

  const renderers = {
    events: renderEvents,
    "my-events": renderMyEvents,
    profile: renderProfile,
    "digital-id": renderDigitalId,
    certificates: renderCertificates,
    hackmate: renderHackmate,
    ideacheck: renderIdeaCheck,
    rulebot: renderRulebot,
    "student-guide": renderGuide,
    communications: renderCommunications,
    notifications: renderNotificationsPage,
    support: renderSupport
  };

  function render(routeId) {
    if (routeId !== state.route) {
      state.editProfile = false;
      state.eventFilter = "All";
      state.collaboratorFilter = "All";
      state.ruleCategory = "All";
      state.communicationFilter = "All";
      state.notificationFilter = "All";
    }
    state.route = routeId;
    const renderPage = renderers[routeId];
    if (!renderPage) return "";
    const html = renderPage();
    window.requestAnimationFrame(() => {
      if (routeId === "events") window.setTimeout(renderEventList, 260);
      if (routeId === "hackmate") renderCollaborators();
      if (routeId === "rulebot") renderRulebotResults();
      if (routeId === "student-guide") renderGuideItems();
      if (routeId === "communications") renderCommunicationList();
      if (routeId === "notifications") renderNotificationList();
      if (routeId === "support") renderSupportResults();
    });
    return html;
  }

  function toggleRegistration(id) {
    const event = pageData.events.find((item) => item.id === id);
    if (!event) return;
    if (event.status !== "Registration open" && !eventIsRegistered(id)) {
      state.callbacks.showToast("REGISTRATION IS NOT OPEN IN THIS DEMO LISTING");
      return;
    }
    let registrations = registeredEvents();
    if (registrations.includes(id)) {
      if (id === "rebuild-26") {
        state.callbacks.showToast("THE SAMPLE REBUILD REGISTRATION CANNOT BE REMOVED");
        return;
      }
      registrations = registrations.filter((item) => item !== id);
      state.callbacks.showToast("LOCAL REGISTRATION REMOVED");
    } else {
      registrations.push(id);
      state.callbacks.showToast("DEMO REGISTRATION SAVED IN THIS BROWSER");
    }
    if (writeStorage(keys.registrations, registrations)) {
      if (state.route === "events") render("events");
      if (state.route === "my-events") render("my-events");
    }
  }

  function saveProfile(form) {
    const values = new FormData(form);
    const result = {
      name: values.get("name").trim(),
      email: values.get("email").trim(),
      college: values.get("college").trim(),
      year: values.get("year").trim(),
      skills: values.get("skills").split(",").map((item) => item.trim()).filter(Boolean),
      interests: values.get("interests").split(",").map((item) => item.trim()).filter(Boolean),
      preference: values.get("preference").trim()
    };
    if (writeStorage(keys.profile, result)) {
      state.editProfile = false;
      document.querySelector("#route-page").innerHTML = render("profile");
      state.callbacks.showToast("SAMPLE PROFILE SAVED LOCALLY");
    }
  }

  function openCertificate(id, print = false) {
    const item = certificates.find((certificate) => certificate.id === id);
    if (!item) return;
    state.certificateId = id;
    if (print) {
      printPageContent(certificateMarkup(item, true));
      return;
    }
    const dialog = document.querySelector("[data-certificate-dialog]");
    document.querySelector("[data-certificate-preview-content]").innerHTML = certificateMarkup(item, true);
    dialog.showModal();
  }

  function printPageContent(content) {
    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) {
      state.callbacks.showToast("PRINT WINDOW BLOCKED / USE THE PREVIEW PRINT BUTTON");
      return;
    }
    printWindow.document.write(`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>CampusCode demonstration print</title><link rel="stylesheet" href="../css/global.css"><link rel="stylesheet" href="../css/dashboard.css"><link rel="stylesheet" href="../css/dashboard-pages.css"></head><body class="dashboard-page print-document">${content}<script>window.addEventListener("load",()=>window.print());</script></body></html>`);
    printWindow.document.close();
  }

  function downloadText(filename, content) {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    state.callbacks.showToast("DEMONSTRATION DETAILS DOWNLOADED");
  }

  function analyzeIdea(form) {
    window.clearTimeout(state.analysisTimer);
    const values = new FormData(form);
    const fields = ["title", "problem", "solution", "audience"];
    const submitted = Object.fromEntries(fields.map((field) => [field, String(values.get(field)).trim()]));
    const checklist = document.querySelector("[data-idea-checklist]");
    const results = document.querySelector("[data-idea-results]");
    checklist.innerHTML = `<div class="idea-progress"><span class="build-loader" aria-hidden="true"><i></i><i></i><i></i></span><p>CHECKING THE SHAPE OF YOUR BRIEF</p><div><i></i></div></div>`;
    results.hidden = true;
    state.analysisTimer = window.setTimeout(() => {
      const checks = [
        ["A named idea", `“${submitted.title}” is the label you can use to talk about the concept.`],
        ["A problem to investigate", `${submitted.problem.length} characters describe a problem. Ask someone in the target audience whether it matches their experience.`],
        ["A proposed response", `${submitted.solution.length} characters describe a response. What is the smallest part you can prototype?`],
        ["A specific audience", `You named “${submitted.audience}”. Check that you can reach and learn from a few people in that group.`]
      ];
      checklist.innerHTML = checks.map(([title, detail], index) => `<div class="idea-result-row"><span class="mono">0${index + 1}</span><div><strong>${escapeHTML(title)}</strong><p>${escapeHTML(detail)}</p></div></div>`).join("");
      results.hidden = false;
      results.innerHTML = `<p class="mono">NEXT QUESTIONS / NOT AI-GENERATED</p><ul><li>What evidence would change your mind about the problem?</li><li>What could you build and test in one short session?</li><li>What should your prototype deliberately leave out?</li></ul>`;
      state.callbacks.showToast("LOCAL CHECKLIST COMPLETE / NO AI USED");
    }, 850);
  }

  function answerRuleQuestion(form) {
    const input = form.elements.question;
    const query = input.value.trim().toLowerCase();
    if (!query) return;
    const ignored = new Set(["about", "does", "from", "have", "what", "when", "where", "which", "with", "your"]);
    const queryTerms = new Set(query.split(/\W+/).filter((word) => word.length > 2 && !ignored.has(word)));
    const match = pageData.rules.map((rule) => {
      const ruleTerms = new Set(`${rule.category} ${rule.question}`.toLowerCase().split(/\W+/));
      const score = [...queryTerms].filter((word) => ruleTerms.has(word)).length;
      return { rule, score };
    }).filter((item) => item.score > 0).sort((a, b) => b.score - a.score)[0]?.rule;
    const container = document.querySelector("[data-rule-results]");
    const answer = match
      ? `<div class="rule-answer"><span class="mono">PREDEFINED MATCH / ${escapeHTML(match.category)}</span><h2>${escapeHTML(match.question)}</h2><p>${escapeHTML(match.answer)}</p></div>`
      : `<div class="rule-answer"><span class="mono">NO EXACT PREDEFINED MATCH</span><h2>Try a related topic.</h2><p>Search eligibility, teams, submissions, conduct, or support. For official details, check the event organiser's published rules.</p></div>`;
    container.insertAdjacentHTML("afterbegin", answer);
    container.firstElementChild.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  function setNotificationRead(id, unread) {
    const item = state.notifications.find((notification) => notification.id === id);
    if (!item) return;
    item.unread = unread;
    persistNotifications();
    if (state.route === "notifications") renderNotificationList();
    state.callbacks.showToast(unread ? "DEMO NOTIFICATION MARKED UNREAD" : "DEMO NOTIFICATION MARKED READ");
  }

  function handleClick(event) {
    const target = event.target.closest("button, a, summary");
    if (!target) return false;

    if (target.matches("[data-event-register]")) {
      toggleRegistration(target.dataset.eventRegister);
      return true;
    }
    if (target.matches("[data-event-detail]")) {
      const item = pageData.events.find((event) => event.id === target.dataset.eventDetail);
      if (item) {
        const panel = document.querySelector("[data-event-detail-panel]");
        panel.innerHTML = `<span class="mono">${escapeHTML(item.category.toUpperCase())} / DEMONSTRATION BRIEF</span><h3>${escapeHTML(item.title)}</h3><p>${escapeHTML(item.detail)}</p><span class="mono">${escapeHTML(item.date)} / ${escapeHTML(item.format)}</span>`;
        panel.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
      return true;
    }
    if (target.matches("[data-event-filter]")) {
      state.eventFilter = target.dataset.eventFilter;
      document.querySelectorAll("[data-event-filter]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.eventFilter === state.eventFilter)));
      renderEventList();
      return true;
    }
    if (target.matches("[data-dialog-close]") && target.closest("#route-page")) {
      target.closest("dialog")?.close();
      return true;
    }
    if (target.matches("[data-profile-edit]")) {
      state.editProfile = true;
      const page = document.querySelector("#route-page");
      page.innerHTML = render("profile");
      page.querySelector('[name="name"]').focus();
      return true;
    }
    if (target.matches("[data-profile-cancel]")) {
      state.editProfile = false;
      document.querySelector("#route-page").innerHTML = render("profile");
      return true;
    }
    if (target.matches("[data-print-card]")) {
      window.print();
      return true;
    }
    if (target.matches("[data-download-id]")) {
      const item = profile();
      downloadText("campuscode-demo-student-id.txt", `CAMPUSCODE / DEMONSTRATION ONLY\nStudent: ${item.name}\nCollege: ${item.college}\nEmail: ${item.email}\nDemo ID: DEMO-CC-026-SS\nNot official identification. Not verified.`);
      return true;
    }
    if (target.matches("[data-certificate-preview]")) {
      openCertificate(target.dataset.certificatePreview);
      return true;
    }
    if (target.matches("[data-certificate-print]")) {
      openCertificate(target.dataset.certificatePrint, true);
      return true;
    }
    if (target.matches("[data-certificate-print-current]")) {
      const item = certificates.find((certificate) => certificate.id === state.certificateId);
      if (item) printPageContent(certificateMarkup(item, true));
      return true;
    }
    if (target.matches("[data-collaborator-filter]")) {
      state.collaboratorFilter = target.dataset.collaboratorFilter;
      document.querySelectorAll("[data-collaborator-filter]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.collaboratorFilter === state.collaboratorFilter)));
      renderCollaborators();
      return true;
    }
    if (target.matches("[data-support-category]")) {
      state.supportCategory = state.supportCategory === target.dataset.supportCategory ? "All" : target.dataset.supportCategory;
      document.querySelectorAll("[data-support-category]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.supportCategory === state.supportCategory)));
      renderSupportResults();
      return true;
    }
    if (target.matches("[data-collaborator-connect]")) {
      const id = target.dataset.collaboratorConnect;
      if (state.matchingRequests.has(id)) state.matchingRequests.delete(id);
      else state.matchingRequests.add(id);
      renderCollaborators();
      state.callbacks.showToast(state.matchingRequests.has(id) ? "SIMULATED CONNECT REQUEST SAVED" : "SIMULATED REQUEST WITHDRAWN");
      return true;
    }
    if (target.matches("[data-collaborator-preview]")) {
      const person = pageData.collaborators.find((item) => item.id === target.dataset.collaboratorPreview);
      if (person) {
        document.querySelector("[data-collaborator-preview-content]").innerHTML = `<div class="collaborator-profile-preview"><div class="collaborator-avatar collaborator-avatar--${person.color}">${escapeHTML(person.name.split(" ").map((part) => part[0]).join(""))}</div><h2>${escapeHTML(person.name)}</h2><p>${escapeHTML(person.field)}</p><p>${escapeHTML(person.preference)} / ${escapeHTML(person.availability)}</p><div>${person.skills.map((skill) => badge(skill)).join("")}</div><p class="mono">FICTIONAL DEMO PROFILE / NOT A REAL STUDENT</p></div>`;
        document.querySelector("[data-collaborator-dialog]").showModal();
      }
      return true;
    }
    if (target.matches("[data-save-idea]")) {
      const form = document.querySelector("[data-idea-form]");
      if (!form.reportValidity()) return true;
      const values = Object.fromEntries(new FormData(form));
      if (writeStorage(keys.idea, values)) state.callbacks.showToast("IDEA BRIEF SAVED LOCALLY");
      return true;
    }
    if (target.matches("[data-rule-filter]")) {
      state.ruleCategory = target.dataset.ruleFilter;
      document.querySelectorAll("[data-rule-filter]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.ruleFilter === state.ruleCategory)));
      renderRulebotResults();
      return true;
    }
    if (target.matches("[data-guide-jump]")) {
      event.preventDefault();
      const entry = pageData.guide.find((item) => item.id === target.dataset.guideJump);
      let rendered = [...document.querySelectorAll("[data-guide-chapter]")].find((item) => item.querySelector("summary")?.textContent.includes(entry?.title));
      if (rendered) {
        rendered.open = true;
        rendered.scrollIntoView({ block: "center", behavior: "smooth" });
      } else if (entry) {
        document.querySelector("[data-guide-search]").value = "";
        state.guideSearch = "";
        renderGuideItems();
        window.requestAnimationFrame(() => {
          rendered = [...document.querySelectorAll("[data-guide-chapter]")].find((item) => item.querySelector("summary")?.textContent.includes(entry.title));
          if (rendered) {
            rendered.open = true;
            rendered.scrollIntoView({ block: "center", behavior: "smooth" });
          }
        });
      }
      return true;
    }
    if (target.matches("[data-communication-filter]")) {
      state.communicationFilter = target.dataset.communicationFilter;
      document.querySelectorAll("[data-communication-filter]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.communicationFilter === state.communicationFilter)));
      renderCommunicationList();
      return true;
    }
    if (target.matches("[data-communication-read]")) {
      const id = target.dataset.communicationRead;
      if (state.readCommunications.has(id)) state.readCommunications.delete(id);
      else state.readCommunications.add(id);
      saveReadCommunications();
      renderCommunicationList();
      return true;
    }
    if (target.matches("[data-notification-filter]")) {
      state.notificationFilter = target.dataset.notificationFilter;
      document.querySelectorAll("[data-notification-filter]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.notificationFilter === state.notificationFilter)));
      renderNotificationList();
      return true;
    }
    if (target.matches("[data-notification-toggle]")) {
      const item = state.notifications.find((notification) => notification.id === target.dataset.notificationToggle);
      if (item) setNotificationRead(item.id, !item.unread);
      return true;
    }
    if (target.matches("[data-notifications-all-read]")) {
      state.notifications.forEach((item) => { item.unread = false; });
      persistNotifications();
      renderNotificationList();
      state.callbacks.showToast("ALL DEMO NOTIFICATIONS MARKED READ");
      return true;
    }
    if (target.matches("[data-notifications-clear]")) {
      document.querySelector("[data-notification-confirm]").hidden = false;
      document.querySelector("[data-notifications-confirm]").focus();
      return true;
    }
    if (target.matches("[data-notifications-cancel]")) {
      document.querySelector("[data-notification-confirm]").hidden = true;
      return true;
    }
    if (target.matches("[data-notifications-confirm]")) {
      state.notifications = [];
      persistNotifications();
      document.querySelector("[data-notification-confirm]").hidden = true;
      renderNotificationList();
      state.callbacks.showToast("LOCAL DEMONSTRATION NOTIFICATIONS CLEARED");
      return true;
    }
    return false;
  }

  function handleSubmit(event) {
    const form = event.target;
    if (form.matches("[data-profile-form]")) {
      event.preventDefault();
      if (!form.reportValidity()) return true;
      saveProfile(form);
      return true;
    }
    if (form.matches("[data-idea-form]")) {
      event.preventDefault();
      if (!form.reportValidity()) return true;
      analyzeIdea(form);
      return true;
    }
    if (form.matches("[data-rule-question-form]")) {
      event.preventDefault();
      answerRuleQuestion(form);
      return true;
    }
    if (form.matches("[data-support-form]")) {
      event.preventDefault();
      if (!form.reportValidity()) return true;
      const confirmation = form.querySelector("[data-support-success]");
      confirmation.hidden = false;
      confirmation.textContent = "Practice request validated. Nothing was sent or stored.";
      form.reset();
      state.callbacks.showToast("LOCAL REQUEST COMPLETE / NOTHING WAS SENT");
      return true;
    }
    return false;
  }

  function handleInput(event) {
    if (event.target.matches("[data-event-search]")) renderEventList();
    if (event.target.matches("[data-collaborator-search]")) renderCollaborators();
    if (event.target.matches("[data-rule-search]")) renderRulebotResults();
    if (event.target.matches("[data-guide-search]")) {
      state.guideSearch = event.target.value;
      renderGuideItems();
    }
    if (event.target.matches("[data-communication-search]")) renderCommunicationList();
    if (event.target.matches("[data-notification-search]")) renderNotificationList();
    if (event.target.matches("[data-support-search]")) renderSupportResults();
  }

  function init(callbacks) {
    state.callbacks = { ...state.callbacks, ...callbacks };
    state.notifications = readStorage(keys.notifications, pageData.notifications.map((item) => ({ ...item })));
    if (!Array.isArray(state.notifications)) state.notifications = pageData.notifications.map((item) => ({ ...item }));
    state.readCommunications = new Set(readStorage(keys.communications, []));
  }

  window.CampusCodeDashboardPages = {
    init,
    render,
    handleClick,
    handleSubmit,
    handleInput,
    getNotifications: notificationItems,
    markAllNotificationsRead() {
      state.notifications.forEach((item) => { item.unread = false; });
      persistNotifications();
    }
  };
})();
