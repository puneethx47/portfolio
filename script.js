(() => {
  "use strict";

  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
  const root = document.documentElement;

  function setupNavigation() {
    const header = document.querySelector("[data-header]");
    const toggle = document.querySelector("[data-menu-toggle]");
    const menu = document.querySelector("[data-nav-menu]");
    const links = [...document.querySelectorAll("[data-nav-link]")];
    const sections = [...document.querySelectorAll("main section[id]")];

    if (!header || !toggle || !menu) return;

    let ticking = false;
    const updateActiveNavigation = () => {
      let currentId = "";
      const activationLine = window.innerHeight * 0.34;

      sections.forEach((section) => {
        if (section.getBoundingClientRect().top <= activationLine) currentId = section.id;
      });

      links.forEach((link) => {
        const isActive = link.hash === `#${currentId}`;
        link.classList.toggle("is-active", isActive);
        if (isActive) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    };

    const updateHeader = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 24);
      updateActiveNavigation();
      ticking = false;
    };

    window.addEventListener("scroll", () => {
      if (!ticking) {
        window.requestAnimationFrame(updateHeader);
        ticking = true;
      }
    }, { passive: true });
    updateHeader();
    window.addEventListener("load", () => {
      window.requestAnimationFrame(() => window.requestAnimationFrame(updateHeader));
    }, { once: true });
    window.addEventListener("hashchange", () => window.requestAnimationFrame(updateHeader));

    const setMenu = (isOpen, returnFocus = false) => {
      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
      menu.classList.toggle("is-open", isOpen);
      document.body.classList.toggle("menu-open", isOpen);

      if (isOpen) {
        menu.querySelector("a")?.focus();
      } else if (returnFocus) {
        toggle.focus();
      }
    };

    toggle.addEventListener("click", () => {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });

    links.forEach((link) => link.addEventListener("click", () => setMenu(false)));

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setMenu(false, true);
      }
    });

    document.addEventListener("click", (event) => {
      if (toggle.getAttribute("aria-expanded") !== "true") return;
      if (!menu.contains(event.target) && !toggle.contains(event.target)) setMenu(false);
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 900 && toggle.getAttribute("aria-expanded") === "true") setMenu(false);
      updateActiveNavigation();
    }, { passive: true });
  }

  function observeAnimation(element, animation) {
    if (!element) return;

    let isVisible = true;
    const syncPlayback = () => {
      if (isVisible && !document.hidden) animation.play();
      else animation.pause();
    };

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(([entry]) => {
        isVisible = entry.isIntersecting;
        syncPlayback();
      }, { threshold: 0.08 });
      observer.observe(element);
    }

    document.addEventListener("visibilitychange", syncPlayback);
    syncPlayback();
  }

  function setupMotion() {
    if (reducedMotionQuery.matches) return;

    root.classList.add("motion-ready");
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => root.classList.add("motion-entered"));
    });

    const revealElements = [...document.querySelectorAll("[data-reveal]")];
    if ("IntersectionObserver" in window) {
      const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        });
      }, { rootMargin: "0px 0px -8%", threshold: 0.06 });

      revealElements.forEach((element) => revealObserver.observe(element));
    } else revealElements.forEach((element) => element.classList.add("is-revealed"));

    if (!("animate" in Element.prototype)) return;

    document.querySelectorAll(".flow-line span").forEach((packet, index) => {
      const distance = Math.max(0, packet.parentElement.clientWidth - packet.clientWidth);
      const animation = packet.animate([
        { transform: "translateX(0)" },
        { transform: `translateX(${distance}px)` }
      ], {
        duration: 1700 + index * 220,
        iterations: Infinity,
        easing: "linear"
      });
      observeAnimation(document.querySelector("[data-system-map]"), animation);
    });

    const cacheRing = document.querySelector(".cache-ring");
    if (cacheRing) {
      const cacheAnimation = cacheRing.animate([
        { transform: "rotate(0deg)" },
        { transform: "rotate(360deg)" }
      ], {
        duration: 14000,
        iterations: Infinity,
        easing: "linear"
      });
      observeAnimation(document.querySelector(".cache-diagram"), cacheAnimation);
    }
  }

  function setupMagneticButtons() {
    if (reducedMotionQuery.matches || !finePointerQuery.matches) return;

    document.querySelectorAll(".magnetic").forEach((button) => {
      button.addEventListener("pointermove", (event) => {
        const bounds = button.getBoundingClientRect();
        const x = (event.clientX - bounds.left - bounds.width / 2) * 0.14;
        const y = (event.clientY - bounds.top - bounds.height / 2) * 0.18;
        button.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      });

      button.addEventListener("pointerleave", () => {
        button.style.transform = "";
      });
    });
  }

  function setupResumeViewer() {
    const modal = document.querySelector("[data-resume-modal]");
    const openers = [...document.querySelectorAll("[data-resume-open]")];
    const closeButton = modal?.querySelector("[data-resume-close]");
    const zoomOut = modal?.querySelector("[data-resume-zoom-out]");
    const zoomIn = modal?.querySelector("[data-resume-zoom-in]");
    const zoomLabel = modal?.querySelector("[data-resume-zoom-label]");
    const canvas = modal?.querySelector("[data-resume-canvas]");

    if (!modal || !closeButton || !zoomOut || !zoomIn || !zoomLabel || !canvas || typeof modal.showModal !== "function") return;

    const zoomLevels = [75, 100, 125, 150];
    let zoomIndex = window.innerWidth <= 680 ? 0 : 1;
    let returnFocus = null;
    let closeTimer = 0;

    const applyZoom = () => {
      const zoom = zoomLevels[zoomIndex];
      canvas.dataset.zoom = String(zoom);
      zoomLabel.textContent = `${zoom}%`;
      zoomOut.disabled = zoomIndex === 0;
      zoomIn.disabled = zoomIndex === zoomLevels.length - 1;
    };

    const finishClose = () => {
      window.clearTimeout(closeTimer);
      if (modal.open) modal.close();
      document.body.classList.remove("resume-open");
      returnFocus?.focus();
      returnFocus = null;
    };

    const closeModal = () => {
      if (!modal.open || modal.classList.contains("is-closing")) return;
      modal.classList.add("is-closing");
      modal.classList.remove("is-visible");
      closeTimer = window.setTimeout(finishClose, reducedMotionQuery.matches ? 20 : 520);
    };

    const openModal = (opener) => {
      returnFocus = opener;
      const menuToggle = document.querySelector("[data-menu-toggle]");
      const menu = document.querySelector("[data-nav-menu]");
      if (menuToggle?.getAttribute("aria-expanded") === "true") {
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open navigation menu");
        menu?.classList.remove("is-open");
        document.body.classList.remove("menu-open");
      }
      zoomIndex = window.innerWidth <= 680 ? 0 : 1;
      applyZoom();
      modal.classList.remove("is-closing");
      if (!modal.open) modal.showModal();
      document.body.classList.add("resume-open");
      window.requestAnimationFrame(() => window.requestAnimationFrame(() => modal.classList.add("is-visible")));
      closeButton.focus();
    };

    openers.forEach((opener) => opener.addEventListener("click", () => openModal(opener)));
    closeButton.addEventListener("click", closeModal);
    zoomOut.addEventListener("click", () => { if (zoomIndex > 0) { zoomIndex -= 1; applyZoom(); } });
    zoomIn.addEventListener("click", () => { if (zoomIndex < zoomLevels.length - 1) { zoomIndex += 1; applyZoom(); } });
    modal.addEventListener("click", (event) => { if (event.target === modal) closeModal(); });
    modal.addEventListener("cancel", (event) => { event.preventDefault(); closeModal(); });
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || !modal.open) return;
      event.preventDefault();
      closeModal();
    });
    modal.addEventListener("close", () => modal.classList.remove("is-visible", "is-closing"));
    applyZoom();
  }

  async function setupVisitorCount() {
    const output = document.querySelector("[data-visitor-count]");
    if (!output) return;

    const isLocalPreview = location.protocol === "file:" || ["localhost", "127.0.0.1", "::1"].includes(location.hostname);
    const counterId = "puneethx47-portfolio-visits-v2";
    const counterBaseUrl = "https://tick.rs";
    const lastVisitKey = "puneeth-portfolio-last-visit-v2";
    const cachedCountKey = "puneeth-portfolio-count-v2";
    const visitWindowMs = 30 * 60 * 1000;
    const formatCount = (count) => new Intl.NumberFormat().format(count);

    let lastVisitAt = 0;
    let cachedCount = null;
    try {
      lastVisitAt = Number(localStorage.getItem(lastVisitKey)) || 0;
      const storedCountValue = localStorage.getItem(cachedCountKey);
      const storedCount = Number(storedCountValue);
      if (storedCountValue !== null && Number.isFinite(storedCount) && storedCount >= 0) cachedCount = storedCount;
    } catch (_) { /* Storage can be disabled without breaking the counter. */ }

    if (cachedCount !== null) output.textContent = formatCount(cachedCount);

    const shouldCountVisit = !isLocalPreview && Date.now() - lastVisitAt >= visitWindowMs;
    const requestCount = async (increment) => {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 6000);
      const operation = increment ? "c+" : "c";

      try {
        const response = await fetch(`${counterBaseUrl}/${operation}/${counterId}.json`, {
          mode: "cors",
          cache: "no-store",
          signal: controller.signal
        });
        if (!response.ok) throw new Error(`Counter returned ${response.status}`);
        const data = await response.json();
        const count = Number(typeof data === "object" ? data.count ?? data.value : data);
        if (!Number.isFinite(count) || count < 0) throw new Error("Counter response did not include a valid number");
        return count;
      } finally {
        window.clearTimeout(timeoutId);
      }
    };

    try {
      const count = await requestCount(shouldCountVisit);
      output.textContent = formatCount(count);
      output.classList.remove("is-unavailable");

      try {
        localStorage.setItem(cachedCountKey, String(count));
        if (shouldCountVisit) localStorage.setItem(lastVisitKey, String(Date.now()));
      } catch (_) { /* The count still succeeded. */ }
    } catch (error) {
      if (cachedCount === null) {
        output.textContent = "—";
        output.classList.add("is-unavailable");
      }
      console.warn("Visitor count could not be loaded.", error);
    }
  }

  function setupCursor() {
    const cursor = document.querySelector("[data-cursor]");
    if (!cursor || reducedMotionQuery.matches || !finePointerQuery.matches) return;

    document.documentElement.classList.add("cursor-enabled");

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let ringX = targetX;
    let ringY = targetY;
    let frameId = 0;

    const render = () => {
      ringX += (targetX - ringX) * 0.18;
      ringY += (targetY - ringY) * 0.18;
      cursor.style.setProperty("--cursor-x", `${targetX}px`);
      cursor.style.setProperty("--cursor-y", `${targetY}px`);
      cursor.style.setProperty("--ring-x", `${ringX}px`);
      cursor.style.setProperty("--ring-y", `${ringY}px`);
      frameId = window.requestAnimationFrame(render);
    };

    const setInteractiveState = (event) => {
      const interactive = event.target.closest("a, button, [role='button'], input, textarea, select");
      cursor.classList.toggle("is-interactive", Boolean(interactive));
    };

    window.addEventListener("pointermove", (event) => {
      targetX = event.clientX;
      targetY = event.clientY;
      cursor.classList.add("is-visible");
      setInteractiveState(event);
    }, { passive: true });

    document.addEventListener("pointerdown", () => cursor.classList.add("is-pressed"));
    document.addEventListener("pointerup", () => cursor.classList.remove("is-pressed"));
    document.documentElement.addEventListener("pointerleave", () => cursor.classList.remove("is-visible"));
    document.documentElement.addEventListener("pointerenter", () => cursor.classList.add("is-visible"));
    window.addEventListener("blur", () => cursor.classList.remove("is-visible"));

    frameId = window.requestAnimationFrame(render);
    window.addEventListener("pagehide", () => window.cancelAnimationFrame(frameId), { once: true });
  }

  function init() {
    setupNavigation();
    setupCursor();
    setupResumeViewer();
    setupVisitorCount();

    try {
      setupMotion();
      setupMagneticButtons();
    } catch (error) {
      // Motion is progressive enhancement: the portfolio remains fully visible and usable.
      console.warn("Optional motion could not be initialized.", error);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
