(() => {
  const data = window.CampusCodeMockData;
  const pages = window.CampusCodeDashboardPages;
  if (!data || !pages) {
    throw new Error("CampusCode dashboard data or page module failed to load.");
  }

  const routes = data.dashboardRoutes;
  const shell = document.querySelector(".dashboard-shell");
  const sidebar = document.querySelector("#student-sidebar");
  const sidebarToggle = document.querySelector("[data-sidebar-toggle]");
  const sidebarScrim = document.querySelector("[data-sidebar-scrim]");
  const notificationPanel = document.querySelector("#notification-panel");
  const toast = document.querySelector("[data-toast]");
  const routePage = document.querySelector("#route-page");
  const overviewView = document.querySelector('[data-route-view="overview"]');
  const dashboardDialog = document.querySelector("[data-dashboard-dialog]");
  const refreshButton = document.querySelector("[data-refresh]");
  const refreshIcon = refreshButton.querySelector("img");
  const refreshLoader = document.querySelector("[data-refresh-loader]");
  let toastTimer;
  let refreshTimer;
  let pointerFrame = 0;
  let pointerX = -100;
  let pointerY = -100;
  let cursorVisible = false;
  let cursorInteractionsEnabled = false;
  const cursor = document.querySelector("[data-cursor]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

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

  function setJourneyStage(stageId) {
    const stage = data.journey.stages.find((item) => item.id === stageId);
    if (!stage) return;
    document.querySelectorAll("[data-journey-stage]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.journeyStage === stageId));
    });
    document.querySelector("[data-journey-stage-detail]").textContent = stage.detail;
  }

  function renderJourney() {
    const journey = data.journey;
    const track = document.querySelector("[data-journey-track]");
    const currentIndex = journey.stages.findIndex((stage) => stage.id === journey.currentStage);
    const progress = document.createElement("span");
    progress.className = "journey-track__progress";
    progress.setAttribute("aria-hidden", "true");
    progress.style.width = `${Math.max(0, currentIndex) * (100 / (journey.stages.length - 1))}%`;
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

  function renderToolkit() {
    document.querySelector("[data-toolkit]").innerHTML = data.tools.map((tool) => `
      <a class="toolkit-item" href="#${tool.id}" data-route-link="${tool.id}" aria-label="${tool.name}: ${tool.description}">
        <span class="toolkit-item__icon"><img src="../assets/icons/${tool.icon}" alt="" loading="lazy"></span>
        <span class="toolkit-item__copy"><strong>${tool.name}</strong><span>${tool.description}</span></span>
        <span class="toolkit-item__arrow" aria-hidden="true">↗</span>
      </a>
    `).join("");
  }

  function renderActivity() {
    document.querySelector("[data-activity]").innerHTML = data.activity.map((item) => `
      <li class="signal-item">
        <time>${item.time}</time>
        <span class="signal-item__mark signal-item__mark--${item.tone}"><img src="../assets/icons/${item.icon}" alt="" loading="lazy"></span>
        <span class="signal-item__copy"><strong>${item.title}</strong><p>${item.detail}</p></span>
      </li>
    `).join("");
  }

  function renderNotifications() {
    const notifications = pages.getNotifications();
    document.querySelector("[data-notification-list]").innerHTML = notifications.length ? notifications.slice(0, 3).map((item) => `
      <article class="notification-item${item.unread ? "" : " is-read"}">
        <span class="notification-item__dot" aria-hidden="true"></span>
        <strong>${item.title}</strong>
        <time>${item.time}</time>
      </article>
    `).join("") : '<p class="notification-panel__note">No local demonstration notifications.</p>';
    const unreadCount = notifications.filter((item) => item.unread).length;
    const count = document.querySelector("[data-notification-count]");
    const sideCount = document.querySelector("[data-sidebar-notification-count]");
    count.textContent = String(unreadCount);
    count.hidden = unreadCount === 0;
    sideCount.textContent = String(unreadCount).padStart(2, "0");
    sideCount.hidden = unreadCount === 0;
  }

  function renderRoutePage(routeId) {
    const route = routes[routeId];
    routePage.dataset.routeId = routeId;
    routePage.innerHTML = pages.render(routeId);
    pages.afterRender(routeId);
    observeImages();
  }

  function setActiveNavigation(routeId) {
    document.querySelectorAll("[data-nav-link]").forEach((link) => {
      const active = link.dataset.routeLink === routeId;
      link.classList.toggle("is-active", active);
      if (active) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  function closeSidebar({ restoreFocus = false } = {}) {
    shell.classList.remove("is-sidebar-open");
    sidebarToggle.setAttribute("aria-expanded", "false");
    sidebarScrim.hidden = true;
    if (restoreFocus) {
      window.requestAnimationFrame(() => sidebarToggle.focus({ preventScroll: true }));
    }
  }

  function setNotificationPanel(open) {
    notificationPanel.hidden = !open;
    document.querySelectorAll("[data-open-notifications]").forEach((button) => {
      button.setAttribute("aria-expanded", String(open));
    });
  }

  function renderRoute({ scroll = true, routeId = window.location.hash.slice(1) } = {}) {
    if (!Object.hasOwn(routes, routeId)) return false;

    const route = routes[routeId];
    const isOverview = routeId === "overview";
    overviewView.hidden = !isOverview;
    routePage.hidden = isOverview;
    document.querySelector("[data-page-title]").textContent = route.label.toUpperCase();
    document.title = `${route.label} — CampusCode Student Workspace`;
    setActiveNavigation(routeId);
    closeSidebar();
    setNotificationPanel(false);

    if (!isOverview) {
      renderRoutePage(routeId);
    }

    const activeView = isOverview ? overviewView : routePage;
    activeView.classList.remove("is-entering");
    window.requestAnimationFrame(() => activeView.classList.add("is-entering"));

    if (scroll) {
      window.scrollTo({ top: 0, behavior: reducedMotion.matches ? "auto" : "smooth" });
      activeView.querySelector("h1, h2")?.focus({ preventScroll: true });
    }
    return true;
  }

  function goToRoute(routeId) {
    if (!Object.hasOwn(routes, routeId)) return;
    if (window.location.hash === `#${routeId}`) {
      renderRoute();
    } else {
      window.location.hash = routeId;
    }
  }

  function beginRefresh() {
    refreshButton.classList.add("is-refreshing");
    refreshButton.setAttribute("aria-busy", "true");
    refreshIcon.hidden = true;
    refreshLoader.hidden = false;
    showToast("LOCAL PREVIEW / NOTHING TO SYNC");
    window.clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(() => {
      refreshButton.classList.remove("is-refreshing");
      refreshButton.removeAttribute("aria-busy");
      refreshIcon.hidden = false;
      refreshLoader.hidden = true;
    }, 650);
  }

  function updateCursor() {
    pointerFrame = 0;
    cursor.style.transform = `translate3d(${pointerX - 12.5}px, ${pointerY - 12.5}px, 0)`;
  }

  function setCursorVisibility(visible) {
    if (cursorVisible === visible) return;
    cursorVisible = visible;
    cursor.classList.toggle("is-visible", visible);
  }

  function handleCursorMove(event) {
    pointerX = event.clientX;
    pointerY = event.clientY;
    setCursorVisibility(true);
    if (!pointerFrame) pointerFrame = window.requestAnimationFrame(updateCursor);

    const magnetic = event.target.closest("[data-magnetic]");
    if (magnetic) {
      const bounds = magnetic.getBoundingClientRect();
      const dx = (event.clientX - (bounds.left + bounds.width / 2)) / bounds.width;
      const dy = (event.clientY - (bounds.top + bounds.height / 2)) / bounds.height;
      magnetic.style.setProperty("--mag-x", `${Math.max(-3, Math.min(3, dx * 5))}px`);
      magnetic.style.setProperty("--mag-y", `${Math.max(-3, Math.min(3, dy * 5))}px`);
    }
  }

  function handleCursorOver(event) {
    const interactive = event.target.closest("a, button, input, select, textarea, summary, [role='button']");
    cursor.classList.toggle("is-interactive", Boolean(interactive));
  }

  function handleCursorOut(event) {
    if (!event.relatedTarget) setCursorVisibility(false);
    const magnetic = event.target.closest?.("[data-magnetic]");
    if (magnetic && !magnetic.contains(event.relatedTarget)) {
      magnetic.style.removeProperty("--mag-x");
      magnetic.style.removeProperty("--mag-y");
    }
    if (!event.relatedTarget?.closest("a, button, input, select, textarea, summary, [role='button']")) {
      cursor.classList.remove("is-interactive");
    }
  }

  function handleWindowBlur() {
    setCursorVisibility(false);
  }

  function handlePointerDown() {
    cursor.classList.add("is-pressed");
  }

  function handlePointerUp() {
    cursor.classList.remove("is-pressed");
  }

  function updateCursorInteractions() {
    const shouldEnable = finePointer.matches && !reducedMotion.matches;
    if (shouldEnable === cursorInteractionsEnabled) return;
    cursorInteractionsEnabled = shouldEnable;

    if (shouldEnable) {
      cursor.hidden = false;
      document.body.classList.add("has-cursor-follower");
      document.addEventListener("pointermove", handleCursorMove, { passive: true });
      document.addEventListener("pointerover", handleCursorOver);
      document.addEventListener("pointerout", handleCursorOut);
      document.addEventListener("pointerdown", handlePointerDown);
      document.addEventListener("pointerup", handlePointerUp);
      window.addEventListener("blur", handleWindowBlur);
      return;
    }

    document.removeEventListener("pointermove", handleCursorMove);
    document.removeEventListener("pointerover", handleCursorOver);
    document.removeEventListener("pointerout", handleCursorOut);
    document.removeEventListener("pointerdown", handlePointerDown);
    document.removeEventListener("pointerup", handlePointerUp);
    window.removeEventListener("blur", handleWindowBlur);
    if (pointerFrame) window.cancelAnimationFrame(pointerFrame);
    pointerFrame = 0;
    cursor.hidden = true;
    cursor.classList.remove("is-interactive", "is-pressed");
    setCursorVisibility(false);
    document.body.classList.remove("has-cursor-follower");
    document.querySelectorAll("[data-magnetic]").forEach((element) => {
      element.style.removeProperty("--mag-x");
      element.style.removeProperty("--mag-y");
    });
  }

  function observeImages() {
    document.querySelectorAll("img").forEach((image) => {
      if (image.dataset.assetObserved) return;
      image.dataset.assetObserved = "true";
      image.addEventListener("error", () => {
        image.dataset.assetError = "true";
        image.setAttribute("aria-label", "CampusCode interface image unavailable");
      }, { once: true });
    });
  }

  document.querySelectorAll("[data-student-name]").forEach((element) => {
    element.textContent = data.student.name;
  });
  document.querySelectorAll("[data-student-initials]").forEach((element) => {
    element.textContent = data.student.initials;
  });
  document.querySelector("[data-first-name]").textContent = data.student.name.split(" ")[0].toUpperCase();
  document.querySelector("[data-workspace-year]").textContent = String(data.workspace.year);
  document.querySelector("[data-current-year]").textContent = String(new Date().getFullYear());
  document.querySelector("[data-workspace-status]").textContent = data.workspace.status;
  document.querySelector("[data-journey-event-name]").textContent = data.journey.eventName;
  document.querySelector("[data-journey-registration]").textContent = data.journey.registrationStatus;
  document.querySelector("[data-journey-participation]").textContent = data.journey.participation;
  document.querySelector("[data-journey-team]").textContent = data.journey.teamName;
  document.querySelector("[data-journey-event-status]").textContent = `${data.journey.eventStatus} / MOCK`;
  pages.init({
    showToast,
    refreshNotifications: renderNotifications,
    goToRoute
  });
  renderMetrics();
  renderJourney();
  renderToolkit();
  renderActivity();
  renderNotifications();
  observeImages();

  document.addEventListener("click", (event) => {
    if (pages.handleClick(event)) return;

    const routeLink = event.target.closest("[data-route-link]");
    if (routeLink) {
      event.preventDefault();
      goToRoute(routeLink.dataset.routeLink);
      return;
    }

    const navLink = event.target.closest("[data-nav-link]");
    if (navLink) {
      closeSidebar();
      return;
    }

    if (event.target.closest("[data-open-notifications]")) {
      setNotificationPanel(notificationPanel.hidden);
      return;
    }

    if (event.target.closest("[data-mark-notifications]")) {
      pages.markAllNotificationsRead();
      renderNotifications();
      showToast("DEMO NOTIFICATIONS MARKED AS READ");
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
      sidebarToggle.setAttribute("aria-expanded", String(open));
      sidebarScrim.hidden = !open;
      if (open) sidebar.querySelector("a")?.focus();
      return;
    }

    if (event.target.closest("[data-sidebar-close], [data-sidebar-scrim]")) {
      closeSidebar({ restoreFocus: true });
      return;
    }

    if (event.target.closest("[data-refresh]")) {
      beginRefresh();
      return;
    }

    if (event.target.closest("[data-logout]")) {
      event.preventDefault();
      if (typeof dashboardDialog.showModal === "function") dashboardDialog.showModal();
      else showToast("DEMO SESSION / RETURN TO LOGIN");
      return;
    }

    if (event.target.closest("[data-dialog-close]")) {
      dashboardDialog.close();
      return;
    }

    if (!event.target.closest(".notification-wrap")) {
      setNotificationPanel(false);
    }
  });

  document.addEventListener("submit", (event) => {
    pages.handleSubmit(event);
  });

  document.addEventListener("input", (event) => {
    pages.handleInput(event);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      const notificationsOpen = !notificationPanel.hidden;
      const sidebarOpen = shell.classList.contains("is-sidebar-open");
      setNotificationPanel(false);
      closeSidebar({ restoreFocus: sidebarOpen && !notificationsOpen });
      if (notificationsOpen) {
        document.querySelector("[data-open-notifications]").focus();
      }
    }
  });

  window.addEventListener("hashchange", () => {
    if (renderRoute()) return;
    const anchor = document.getElementById(window.location.hash.slice(1));
    if (anchor && overviewView.contains(anchor)) {
      if (overviewView.hidden) {
        renderRoute({ scroll: false, routeId: "overview" });
        window.requestAnimationFrame(() => anchor.scrollIntoView({
          block: "start",
          behavior: reducedMotion.matches ? "auto" : "smooth"
        }));
      }
      setActiveNavigation("overview");
    } else {
      goToRoute("overview");
    }
  });

  const initialHash = window.location.hash.slice(1);
  const initialAnchor = document.getElementById(initialHash);
  const isOverviewAnchor = initialAnchor && overviewView.contains(initialAnchor);
  if (!routes[initialHash] && !isOverviewAnchor) {
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#overview`);
  }
  renderRoute({ scroll: false });
  if (isOverviewAnchor && initialHash !== "overview") {
    initialAnchor.scrollIntoView({ block: "start" });
  }
  updateCursorInteractions();
  reducedMotion.addEventListener("change", updateCursorInteractions);
  finePointer.addEventListener("change", updateCursorInteractions);
})();
