document.documentElement.classList.add("js");

const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const navigation = document.querySelector("[data-navigation]");

const heroTopline = document.querySelector(".hero__topline");
if (header && heroTopline && "IntersectionObserver" in window) {
  const headerObserver = new IntersectionObserver(([entry]) => {
    header.classList.toggle("is-scrolled", !entry.isIntersecting);
  }, { threshold: 0, rootMargin: "-96px 0px 0px" });
  headerObserver.observe(heroTopline);
}

menuToggle?.addEventListener("click", () => {
  const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isExpanded));
  navigation?.classList.toggle("is-open", !isExpanded);
});

navigation?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menuToggle?.setAttribute("aria-expanded", "false");
    navigation.classList.remove("is-open");
  });
});

const revealItems = document.querySelectorAll("[data-reveal]");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (reducedMotion.matches || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  try {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
      if (!document.querySelector("[data-reveal]:not(.is-visible)")) observer.disconnect();
    }, { threshold: 0.12 });

    revealItems.forEach((item) => revealObserver.observe(item));
    document.documentElement.classList.add("motion-ready");
  } catch {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }
}

const hero = document.querySelector(".hero");
const heroArt = document.querySelector(".hero-art");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
if (hero && heroArt) {
  hero.addEventListener("pointermove", (event) => {
    if (!finePointer.matches || reducedMotion.matches) return;
    const bounds = hero.getBoundingClientRect();
    const pointerX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 10;
    const pointerY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 10;
    heroArt.style.setProperty("--hero-x", `${pointerX}px`);
    heroArt.style.setProperty("--hero-y", `${pointerY}px`);
  }, { passive: true });
  const clearHeroOffset = () => {
    heroArt.style.removeProperty("--hero-x");
    heroArt.style.removeProperty("--hero-y");
  };
  hero.addEventListener("pointerleave", clearHeroOffset);
  reducedMotion.addEventListener("change", (event) => {
    if (event.matches) clearHeroOffset();
  });
  finePointer.addEventListener("change", (event) => {
    if (!event.matches) clearHeroOffset();
  });
}

document.querySelectorAll("[data-loop-step]").forEach((step) => {
  step.addEventListener("mouseenter", () => {
    document.querySelectorAll("[data-loop-step]").forEach((otherStep) => {
      otherStep.classList.toggle("is-active", otherStep === step);
    });
  });
});