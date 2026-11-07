(() => {
  const data = window.CampusCodeMockData;
  if (!data) {
    throw new Error("CampusCode dashboard mock data failed to load.");
  }

  const iconPath = (filename) => `../assets/icons/${filename}`;
  const student = data.student;
  const toast = document.querySelector("[data-toast]");
  const dialog = document.querySelector("[data-preview-dialog]");
  const notificationPanel = document.querySelector("#notification-panel");
  let toastTimer;

  const previewContent = {
    hackmate: ["04 / HACKMATE AI", "Find your future build team.", "HackMate AI will help students discover collaborators. This is a frontend-only preview; team matching is not connected."],
    ideacheck: ["05 / IDEACHECK AI", "Give your idea a first test.", "IdeaCheck AI is planned as a space to challenge early ideas. This frontend preview does not run an AI evaluation."],
    certificates: ["06 / CERTIFICATES", "A place for what you earn.", "Certificates will be available here when that dashboard section is implemented. No real certificates are shown in this mock."],
    "digital-id": ["07 / DIGITAL ID", "Your student identity, in one place.", "Digital ID is not connected to a student account in this frontend demonstration."],
    rulebot: ["08 / RULEBOT AI", "Make the rules easier to navigate.", "RuleBot AI is a planned event-guidance preview. It does not interpret real event rules yet."],
    "student-guide": ["09 / STUDENT GUIDE", "A useful start for builders.", "The Student Guide section has not been built in this frontend preview."],
    communication: ["10 / OFFICIAL COMMUNICATION", "Updates from CampusCode.", "Official communications are not connected in this mock workspace."],
    community: ["COMMUNITY / COLLABORATE", "Build better, together.", "Community discovery is not part of this Overview preview yet. The panel is intentionally shown as a placeholder, not a live directory."],
    support: ["12 / HELP & SUPPORT", "Get help when you need it.", "Help & Support is not connected in this frontend-only dashboard preview."],
    profile: ["13 / STUDENT PROFILE", "Your builder identity.", "This page uses a mock student identity. Profile editing and account data are not connected."],
    events: ["02 / EVENTS", "Find the right challenge.", "Event discovery will be available in the Events section. The radar on this Overview is illustrative mock content."],
    "events-ai": ["EVENT RADAR / 01", "Artificial intelligence.", "This is a mock opportunity category. Live event listings and registration are not connected."],
    "events-web": ["EVENT RADAR / 02", "Web development.", "This is a mock opportunity category. Live event listings and registration are not connected."],
    "events-smart-tech": ["EVENT RADAR / 03", "Smart technology.", "This is a mock opportunity category. Live event listings and registration are not connected."]
  };

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2800);
  }

  function renderMetrics() {
    const metrics = [
      { number: "01", label: "EVENTS JOINED", value: data.workspace.eventCount, description: "A place to start your journey." },
      { number: "02", label: "ACTIVE PROJECTS", value: data.workspace.activeProjectCount, description: "Ideas in your build queue." },
      { number: "03", label: "CERTIFICATES", value: data.workspace.certificateCount, description: "Demo profile total." },
      { number: "04", label: "BUILD STREAK", value: `${String(data.workspace.buildStreakDays).padStart(2, "0")} DAYS`, description: "A mock consistency marker.", days: true }
    ];

    document.querySelector("[data-metrics]").innerHTML = metrics.map((metric) => `
      <article class="metric">
        <div class="metric__top"><span>${metric.number} — ${metric.label}</span></div>
        <span class="metric__value${metric.days ? " metric__value--days" : ""}">${metric.value}</span>
        <p class="metric__description">${metric.description}</p>
        <i class="metric__accent" aria-hidden="true"></i>
      </article>
    `).join("");
  }

  function renderJourney() {
    const journey = data.journey;
    const track = document.querySelector("[data-journey-track]");
    const currentIndex = journey.stages.findIndex((stage) => stage.id === journey.currentStage);
    const progress = document.createElement("span");
    progress.className = "journey-track__progress";
    progress.setAttribute("aria-hidden", "true");
    progress.style.width = `${Math.max(0, currentIndex) * 25}%`;
    track.append(progress);

    journey.stages.forEach((stage, index) => {
      const button = document.createElement("button");
      button.className = `journey-stage is-${stage.status}`;
      button.type = "button";
      button.dataset.journeyStage = stage.id;
      button.setAttribute("aria-pressed", String(stage.id === journey.currentStage));
      button.setAttribute("aria-label", `Stage ${String(index + 1).padStart(2, "0")}: ${stage.name}, ${stage.status}`);
      button.innerHTML = `<span class="journey-stage__marker" aria-hidden="true"></span><span class="journey-stage__label">${String(index + 1).padStart(2, "0")} — ${stage.name}</span>`;
      track.append(button);
    });

    document.querySelector("[data-journey-stage-label]").textContent =
      `STAGE ${String(currentIndex + 1).padStart(2, "0")} / ${String(journey.stages.length).padStart(2, "0")} — ${journey.stages[currentIndex].name}`;
    setJourneyStage(journey.currentStage);
  }

  function setJourneyStage(stageId) {
    const stage = data.journey.stages.find((item) => item.id === stageId);
    if (!stage) return;
    document.querySelectorAll("[data-journey-stage]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.journeyStage === stageId));
    });
    document.querySelector("[data-journey-stage-detail]").textContent = stage.detail;
  }

  function renderToolkit() {
    document.querySelector("[data-toolkit]").innerHTML = data.tools.map((tool) => `
      <a class="toolkit-item" href="#${tool.id}" data-preview="${tool.id}" aria-label="${tool.name}: ${tool.description} Frontend preview">
        <span class="toolkit-item__icon"><img src="${iconPath(tool.icon)}" alt="" loading="lazy"></span>
        <span class="toolkit-item__copy"><strong>${tool.name}</strong><span>${tool.description}</span></span>
        <span class="toolkit-item__arrow" aria-hidden="true">↗</span>
      </a>
    `).join("");
  }

  function renderActivity() {
    document.querySelector("[data-activity]").innerHTML = data.activity.map((item) => `
      <li class="signal-item">
        <time>${item.time}</time>
        <span class="signal-item__mark signal-item__mark--${item.tone}"><img src="${iconPath(item.icon)}" alt="" loading="lazy"></span>
        <span class="signal-item__copy"><strong>${item.title}</strong><p>${item.detail}</p></span>
      </li>
    `).join("");
  }

  function renderNotifications() {
    document.querySelector("[data-notification-list]").innerHTML = data.notifications.map((item) => `
      <article class="notification-item${item.unread ? "" : " is-read"}">
        <span class="notification-item__dot" aria-hidden="true"></span>
        <strong>${item.title}</strong>
        <time>${item.time}</time>
      </article>
    `).join("");
    const unreadCount = data.notifications.filter((item) => item.unread).length;
    const count = document.querySelector("[data-notification-count]");
    const sideCount = document.querySelector("[data-sidebar-notification-count]");
    count.textContent = String(unreadCount);
    count.hidden = unreadCount === 0;
    sideCount.textContent = String(unreadCount).padStart(2, "0");
    sideCount.hidden = unreadCount === 0;
  }

  function renderRadar() {
    const titleCopy = [
      "Intelligence<br>with intention.",
      "Build for the<br>open web.",
      "Make the everyday<br>smarter."
    ];

    data.opportunities.forEach((opportunity, index) => {
      const label = document.querySelector(`[data-radar-label="${index}"]`);
      const title = document.querySelector(`[data-radar-title="${index}"]`);
      const description = document.querySelector(`[data-radar-description="${index}"]`);
      if (label) {
        label.textContent = `${opportunity.number} / ${opportunity.name}`;
      }
      if (title) {
        title.innerHTML = titleCopy[index];
      }
      if (description) {
        description.textContent = opportunity.description;
      }
      const link = index === 0
        ? document.querySelector(".radar-lead")
        : document.querySelectorAll(".radar-row")[index - 1];
      link.dataset.preview = `events-${opportunity.id}`;
      link.href = `#events-${opportunity.id}`;
      link.setAttribute("aria-label", `${opportunity.name}: open mock opportunity preview`);
    });
  }

  function openPreview(id) {
    const content = previewContent[id] ?? ["CAMPUSCODE / PREVIEW", "This section is not live yet.", "This destination is a clear frontend placeholder. No account data or backend service is connected."];
    document.querySelector("[data-preview-number]").textContent = content[0];
    document.querySelector("[data-preview-title]").textContent = content[1];
    document.querySelector("[data-preview-description]").textContent = content[2];
    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      showToast(`${content[1]} — FRONTEND PREVIEW`);
    }
  }

  function setActiveNavigation(link) {
    document.querySelectorAll("[data-nav-link]").forEach((item) => {
      item.classList.remove("is-active");
      item.removeAttribute("aria-current");
    });
    if (link) {
      link.classList.add("is-active");
      link.setAttribute("aria-current", "page");
    }
  }

  const shell = document.querySelector(".dashboard-shell");
  const menuToggle = document.querySelector("[data-sidebar-toggle]");

  function closeSidebar() {
    shell.classList.remove("is-sidebar-open");
    menuToggle.setAttribute("aria-expanded", "false");
    document.querySelector("[data-sidebar-scrim]").hidden = true;
  }

  function toggleNotifications(force) {
    const shouldOpen = typeof force === "boolean" ? force : notificationPanel.hidden;
    notificationPanel.hidden = !shouldOpen;
    document.querySelectorAll("[data-open-notifications]").forEach((button) => {
      button.setAttribute("aria-expanded", String(shouldOpen));
    });
  }

  document.querySelectorAll("[data-student-name]").forEach((element) => {
    element.textContent = student.name;
  });
  document.querySelectorAll("[data-student-initials]").forEach((element) => {
    element.textContent = student.initials;
  });
  document.querySelector("[data-first-name]").textContent = student.name.split(" ")[0].toUpperCase();
  document.querySelector("[data-workspace-year]").textContent = String(data.workspace.year);
  document.querySelector("[data-current-year]").textContent = String(new Date().getFullYear());
  document.querySelector("[data-workspace-status]").textContent = data.workspace.status;
  document.querySelector("[data-journey-event-name]").textContent = data.journey.eventName;
  document.querySelector("[data-journey-registration]").textContent = data.journey.registrationStatus;
  document.querySelector("[data-journey-participation]").textContent = data.journey.participation;
  document.querySelector("[data-journey-team]").textContent = data.journey.teamName;
  document.querySelector("[data-journey-event-status]").textContent = `${data.journey.eventStatus} / MOCK`;
  renderMetrics();
  renderJourney();
  renderToolkit();
  renderActivity();
  renderNotifications();
  renderRadar();

  document.addEventListener("click", (event) => {
    const previewLink = event.target.closest("[data-preview]");
    if (previewLink) {
      event.preventDefault();
      openPreview(previewLink.dataset.preview);
      closeSidebar();
      return;
    }

    const navLink = event.target.closest("[data-nav-link]");
    if (navLink) {
      setActiveNavigation(navLink);
      closeSidebar();
      if (navLink.dataset.section === "my-events") {
        showToast("CURRENT JOURNEY / MOCK EVENT PREVIEW");
      }
      if (navLink.dataset.section === "events") {
        showToast("OPPORTUNITY RADAR / MOCK EVENT CATEGORIES");
      }
      return;
    }

    if (event.target.closest("[data-open-notifications]")) {
      toggleNotifications();
      return;
    }

    if (event.target.closest("[data-mark-notifications]")) {
      data.notifications.forEach((item) => { item.unread = false; });
      renderNotifications();
      showToast("MOCK NOTIFICATIONS MARKED AS READ");
      return;
    }

    const stage = event.target.closest("[data-journey-stage]");
    if (stage) {
      setJourneyStage(stage.dataset.journeyStage);
      return;
    }

    if (event.target.closest("[data-sidebar-toggle]")) {
      const open = !shell.classList.contains("is-sidebar-open");
      shell.classList.toggle("is-sidebar-open", open);
      menuToggle.setAttribute("aria-expanded", String(open));
      document.querySelector("[data-sidebar-scrim]").hidden = !open;
      return;
    }

    if (event.target.closest("[data-sidebar-close], [data-sidebar-scrim]")) {
      closeSidebar();
      return;
    }

    if (event.target.closest("[data-refresh]")) {
      const button = event.target.closest("[data-refresh]");
      button.classList.remove("is-refreshing");
      window.requestAnimationFrame(() => button.classList.add("is-refreshing"));
      showToast(`WORKSPACE REFRESHED / ${new Intl.DateTimeFormat("en", { hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date())}`);
      window.setTimeout(() => button.classList.remove("is-refreshing"), 750);
      return;
    }

    if (!event.target.closest(".notification-wrap")) {
      toggleNotifications(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      toggleNotifications(false);
      closeSidebar();
    }
  });

  const sectionLinks = new Map([
    ["overview", document.querySelector('[data-nav-link][data-section="overview"]')],
    ["opportunities", document.querySelector('[data-nav-link][data-section="events"]')],
    ["journey", document.querySelector('[data-nav-link][data-section="my-events"]')]
  ]);
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible && sectionLinks.has(visible.target.id)) {
        setActiveNavigation(sectionLinks.get(visible.target.id));
      }
    }, { rootMargin: "-25% 0px -65% 0px", threshold: [0, .2, .5] });
    sectionLinks.forEach((_, id) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });
  }

  document.querySelectorAll("img").forEach((image) => {
    image.addEventListener("error", () => {
      image.dataset.assetError = "true";
      image.setAttribute("aria-label", "CampusCode interface icon unavailable");
    }, { once: true });
  });
})();