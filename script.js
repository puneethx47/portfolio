(() => {
  "use strict";

  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");

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
    const gsap = window.gsap;
    if (!gsap || reducedMotionQuery.matches) return;

    const heroTimeline = gsap.timeline({ defaults: { ease: "power3.out" } });
    heroTimeline
      .from(".hero-kicker", { opacity: 0, y: 14, duration: 0.55 })
      .from(".title-line > span", { yPercent: 112, rotate: 1.5, duration: 1.05, stagger: 0.1 }, "-=0.25")
      .from(".hero-intro", { opacity: 0, y: 20, duration: 0.7 }, "-=0.56")
      .from(".hero-actions", { opacity: 0, y: 16, duration: 0.6 }, "-=0.5")
      .from(".hero-meta > div", { opacity: 0, y: 12, duration: 0.48, stagger: 0.08 }, "-=0.35")
      .from("[data-system-map]", { opacity: 0, y: 24, scale: 0.985, duration: 0.9 }, "-=1.1")
      .from(".system-node", { opacity: 0, scale: 0.9, duration: 0.5, stagger: 0.08 }, "-=0.56")
      .from(".flow-line", { scaleX: 0, transformOrigin: "left", duration: 0.6, stagger: 0.08 }, "-=0.3")
      .from(".system-note", { opacity: 0, y: 8, duration: 0.4, stagger: 0.08 }, "-=0.2");

    if ("IntersectionObserver" in window) {
      const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          gsap.fromTo(entry.target,
            { opacity: 0, y: 28 },
            { opacity: 1, y: 0, duration: 0.78, ease: "power3.out", clearProps: "opacity,transform" }
          );
          observer.unobserve(entry.target);
        });
      }, { rootMargin: "0px 0px -8%", threshold: 0.06 });

      document.querySelectorAll("[data-reveal]").forEach((element) => revealObserver.observe(element));

      const observeAssembly = (element, animation) => {
        if (!element) return;
        const observer = new IntersectionObserver(([entry]) => {
          if (!entry.isIntersecting) return;
          animation();
          observer.disconnect();
        }, { rootMargin: "0px 0px -12%", threshold: 0.08 });
        observer.observe(element);
      };

      observeAssembly(document.querySelector(".cache-diagram"), () => {
        gsap.fromTo(".cache-core",
          { opacity: 0, scale: 0.76 },
          { opacity: 1, scale: 1, duration: 0.7, ease: "back.out(1.5)", clearProps: "opacity,transform" }
        );
      });
    }

    if (!finePointerQuery.matches || window.innerWidth <= 680) return;

    document.querySelectorAll(".flow-line span").forEach((packet, index) => {
      const animation = gsap.to(packet, {
        x: () => Math.max(0, packet.parentElement.clientWidth - packet.clientWidth),
        duration: 1.7 + index * 0.22,
        repeat: -1,
        repeatDelay: 0.45 + index * 0.2,
        repeatRefresh: true,
        ease: "none",
        paused: true
      });
      observeAnimation(document.querySelector("[data-system-map]"), animation);
    });

    const cacheRing = document.querySelector(".cache-ring");
    if (cacheRing) {
      const cacheAnimation = gsap.to(cacheRing, {
        rotate: 360,
        duration: 14,
        repeat: -1,
        ease: "none",
        paused: true
      });
      observeAnimation(document.querySelector(".cache-diagram"), cacheAnimation);
    }
  }

  function setupMagneticButtons() {
    const gsap = window.gsap;
    if (!gsap || reducedMotionQuery.matches || !finePointerQuery.matches) return;

    document.querySelectorAll(".magnetic").forEach((button) => {
      const moveX = gsap.quickTo(button, "x", { duration: 0.45, ease: "power3.out" });
      const moveY = gsap.quickTo(button, "y", { duration: 0.45, ease: "power3.out" });

      button.addEventListener("pointermove", (event) => {
        const bounds = button.getBoundingClientRect();
        moveX((event.clientX - bounds.left - bounds.width / 2) * 0.14);
        moveY((event.clientY - bounds.top - bounds.height / 2) * 0.18);
      });

      button.addEventListener("pointerleave", () => {
        moveX(0);
        moveY(0);
      });
    });
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
