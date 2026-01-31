(() => {
  const LINKEDIN_URL = "https://www.linkedin.com/in/lahiru-nuwanga-b37b75378";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function setToast(text) {
    const toast = $(".toast");
    const out = $("[data-toast-text]");
    if (!toast || !out) return;

    out.textContent = text;
    toast.hidden = false;

    window.clearTimeout(setToast._t);
    setToast._t = window.setTimeout(() => {
      toast.hidden = true;
    }, 3000);
  }

  function getPreferredTheme() {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark" || saved === "blue") return saved;
    return "blue"; // Default to blue theme
  }

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }

  function toggleTheme() {
    const current = document.documentElement.dataset.theme || "blue";
    const themes = ["blue", "light", "dark"];
    const currentIndex = themes.indexOf(current);
    const nextIndex = (currentIndex + 1) % themes.length;
    applyTheme(themes[nextIndex]);
  }

  function setupTheme() {
    applyTheme(getPreferredTheme());
    const btn = $("[data-theme-toggle]");
    btn?.addEventListener("click", () => {
      toggleTheme();
      setToast(`Theme: ${document.documentElement.dataset.theme}`);
    });
  }

  function setupHeaderElevation() {
    const header = document.querySelector("[data-elevate-on-scroll]");
    if (!header) return;

    const update = () => {
      header.dataset.elevated = window.scrollY > 8 ? "true" : "false";
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  function setupMobileNav() {
    const toggle = $(".nav__toggle");
    const menu = $("#navMenu");
    if (!toggle || !menu) return;

    const close = () => {
      menu.dataset.open = "false";
      toggle.setAttribute("aria-expanded", "false");
      toggle.classList.remove("active");
    };

    const open = () => {
      menu.dataset.open = "true";
      toggle.setAttribute("aria-expanded", "true");
      toggle.classList.add("active");
    };

    toggle.addEventListener("click", () => {
      const isOpen = menu.dataset.open === "true";
      if (isOpen) close();
      else open();
    });

    $$(".nav__link", menu).forEach((a) => a.addEventListener("click", close));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });

    document.addEventListener("click", (e) => {
      if (!menu.dataset.open || menu.dataset.open !== "true") return;
      const target = e.target;
      if (!(target instanceof Node)) return;
      if (menu.contains(target) || toggle.contains(target)) return;
      close();
    });
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        return true;
      } catch {
        return false;
      }
    }
  }

  function setupCopyButtons() {
    $$("[data-copy-linkedin]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const ok = await copyText(LINKEDIN_URL);
        setToast(ok ? "✓ LinkedIn URL copied to clipboard!" : "Copy failed. Please copy from the address bar.");
      });
    });
  }

  function setupYear() {
    const y = $("[data-year]");
    if (y) y.textContent = String(new Date().getFullYear());
  }

  function setupProfilePhotos() {
    const photos = $$("[data-profile-photo]");
    const stored = localStorage.getItem("profilePhotoDataUrl");
    const candidates = [
      "./assets/profile.jpg.png",
      "./assets/profile.jpg",
      "./assets/profile.jpeg",
      "./assets/profile.png",
      "./assets/profile.webp",
      "./assets/profile.jfif",
      "./profile.jpg",
      "./profile.jpeg",
      "./profile.png",
      "./profile.webp",
      "./profile.jfif",
    ];

    photos.forEach((img) => {
      if (!(img instanceof HTMLImageElement)) return;
      const wrap = img.closest("[data-photo-wrap]");
      if (!(wrap instanceof HTMLElement)) return;

      wrap.dataset.photo = "missing";

      if (stored && stored.startsWith("data:image/")) {
        img.src = stored;
      }

      let idx = Math.max(0, candidates.indexOf(img.getAttribute("src") || ""));

      function markOk() {
        wrap.dataset.photo = "ok";
        img.removeEventListener("error", onError);
      }

      function markMissing() {
        wrap.dataset.photo = "missing";
      }

      function onError() {
        if (idx < candidates.length - 1) {
          idx += 1;
          img.src = candidates[idx];
          return;
        }
        markMissing();
      }

      if (img.complete && img.naturalWidth > 0) {
        markOk();
      } else if (img.complete) {
        onError();
      }

      img.addEventListener("load", markOk, { once: true });
      img.addEventListener("error", onError);
    });
  }

  function setupPhotoUpload() {
    const buttons = $$("[data-upload-photo]");
    if (buttons.length === 0) return;

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.style.display = "none";
    document.body.appendChild(input);

    input.addEventListener("change", async () => {
      const file = input.files?.[0];
      if (!file) return;

      try {
        const dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result || ""));
          reader.onerror = () => reject(new Error("read failed"));
          reader.readAsDataURL(file);
        });

        if (!String(dataUrl).startsWith("data:image/")) throw new Error("not an image");
        localStorage.setItem("profilePhotoDataUrl", String(dataUrl));

        $$("[data-profile-photo]").forEach((el) => {
          if (el instanceof HTMLImageElement) el.src = String(dataUrl);
          const wrap = el.closest?.("[data-photo-wrap]");
          if (wrap instanceof HTMLElement) wrap.dataset.photo = "ok";
        });

        setToast("✓ Profile photo updated!");
      } catch {
        setToast("Could not load that image. Please try another file.");
      } finally {
        input.value = "";
      }
    });

    buttons.forEach((btn) => btn.addEventListener("click", () => input.click()));
  }

  function setupScrollAnimations() {
    // DISABLED - No scroll animations that hide content
    // All sections remain visible at all times
    
    // Ensure skill progress bars use correct width from HTML
    const skillFills = $$(".skillItem__fill");
    skillFills.forEach((fill) => {
      // Get width from inline style attribute
      const inlineStyle = fill.getAttribute("style") || "";
      const widthMatch = inlineStyle.match(/width:\s*([^;%]+%?)/);
      if (widthMatch && widthMatch[1]) {
        const originalWidth = widthMatch[1].trim();
        // Ensure width is applied correctly
        fill.style.width = originalWidth;
        fill.setAttribute("data-original-width", originalWidth);
      }
    });
    
    // Ensure resume section meters are always visible with their original width from HTML
    const resumeMeters = $$(".resumeStage .meter__fill");
    resumeMeters.forEach((meter) => {
      // Preserve the original width from inline style attribute
      const inlineStyle = meter.getAttribute("style") || "";
      const widthMatch = inlineStyle.match(/width:\s*([^;%]+%?)/);
      if (widthMatch && widthMatch[1]) {
        const originalWidth = widthMatch[1].trim();
        // Store original width and ensure it's always applied
        meter.setAttribute("data-original-width", originalWidth);
        meter.style.width = originalWidth;
      }
    });
  }

  function setupSmoothScroll() {
    $$('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        const href = this.getAttribute("href");
        if (href === "#" || href === "#top") {
          e.preventDefault();
          window.scrollTo({
            top: 0,
            behavior: "smooth"
          });
          return;
        }

        const target = $(href);
        if (target) {
          e.preventDefault();
          const headerOffset = 80;
          const elementPosition = target.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
          });
        }
      });
    });
  }

  function setupParallaxEffect() {
    const hero = $(".hero");
    if (!hero) return;

    window.addEventListener("scroll", () => {
      const scrolled = window.pageYOffset;
      const rate = scrolled * 0.5;
      hero.style.transform = `translateY(${rate}px)`;
    }, { passive: true });
  }

  function setupCursorEffects() {
    const cursor = document.createElement("div");
    cursor.className = "custom-cursor";
    cursor.style.cssText = `
      width: 20px;
      height: 20px;
      border: 2px solid rgba(139, 92, 246, 0.5);
      border-radius: 50%;
      position: fixed;
      pointer-events: none;
      z-index: 9999;
      transition: transform 0.2s ease, opacity 0.2s ease;
      transform: translate(-50%, -50%);
      opacity: 0;
    `;
    document.body.appendChild(cursor);

    const updateCursor = (e) => {
      cursor.style.left = e.clientX + "px";
      cursor.style.top = e.clientY + "px";
      cursor.style.opacity = "1";
    };

    const hideCursor = () => {
      cursor.style.opacity = "0";
    };

    const scaleCursor = () => {
      cursor.style.transform = "translate(-50%, -50%) scale(1.5)";
    };

    const resetCursor = () => {
      cursor.style.transform = "translate(-50%, -50%) scale(1)";
    };

    document.addEventListener("mousemove", updateCursor);
    document.addEventListener("mouseleave", hideCursor);
    
    $$("a, button, .project, .chip").forEach((el) => {
      el.addEventListener("mouseenter", scaleCursor);
      el.addEventListener("mouseleave", resetCursor);
    });
  }

  function setupActiveNavLink() {
    const sections = $$("section[id]");
    const navLinks = $$(".nav__link");

    const updateActiveLink = () => {
      let current = "";
      sections.forEach((section) => {
        const sectionTop = section.getBoundingClientRect().top;
        if (sectionTop <= 100) {
          current = section.getAttribute("id");
        }
      });

      navLinks.forEach((link) => {
        link.classList.remove("active");
        if (link.getAttribute("href") === `#${current}`) {
          link.classList.add("active");
        }
      });
    };

    window.addEventListener("scroll", updateActiveLink, { passive: true });
    updateActiveLink();
  }

  function setupMeterAnimations() {
    // DISABLED for resume section - skills should always be visible
    // Only animate meters outside resume section (if any)
    const meters = $$(".meter__fill:not(.resumeStage .meter__fill)");
    
    // Ensure resume meters keep their original width
    const resumeMeters = $$(".resumeStage .meter__fill");
    resumeMeters.forEach((meter) => {
      const originalWidth = meter.getAttribute("data-original-width") || 
                          meter.style.width || 
                          meter.getAttribute("style")?.match(/width:\s*([^;%]+%?)/)?.[1];
      if (originalWidth) {
        meter.style.width = originalWidth;
      }
    });
    
    // Disable animations for resume section - no observer needed
    // const observer = new IntersectionObserver((entries) => {
    //   entries.forEach((entry) => {
    //     if (entry.isIntersecting) {
    //       const fill = entry.target;
    //       const width = fill.style.width;
    //       fill.style.width = "0";
    //       setTimeout(() => {
    //         fill.style.width = width;
    //       }, 100);
    //     }
    //   });
    // }, { threshold: 0.5 });
    // meters.forEach((meter) => observer.observe(meter));
  }

  // ===== PROGRESSIVE REVEAL (Scroll Triggered) =====
  // DISABLED - Sections remain visible at all times
  function setupProgressiveReveal() {
    // No animations - all content visible by default
  }

  // ===== INTELLIGENT NAVIGATION TRANSITIONS =====
  function setupNavigationTransitions() {
    const header = $(".header");
    if (!header) return;

    let lastScrollY = window.scrollY;
    const heroHeight = $(".hero")?.offsetHeight || 400;

    window.addEventListener("scroll", () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > heroHeight * 0.7) {
        header.classList.add("header--morphed");
      } else {
        header.classList.remove("header--morphed");
      }
      
      lastScrollY = currentScrollY;
    }, { passive: true });
  }

  // ===== MICRO-INTERACTION FEEDBACK =====
  function setupMagneticButtons() {
    $$(".btn, .iconLink, .socialLink").forEach((button) => {
      button.addEventListener("mousemove", (e) => {
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        const moveX = x * 0.15;
        const moveY = y * 0.15;
        
        button.style.transform = `translate(${moveX}px, ${moveY}px)`;
      });

      button.addEventListener("mouseleave", () => {
        button.style.transform = "translate(0, 0)";
      });
    });
  }

  function setupActiveLinkUnderlines() {
    $$(".nav__link").forEach((link) => {
      link.addEventListener("mouseenter", function() {
        this.style.transform = "translateX(4px)";
      });
      
      link.addEventListener("mouseleave", function() {
        this.style.transform = "translateX(0)";
      });
    });
  }

  function setupProgressIndicator() {
    const progressBar = document.createElement("div");
    progressBar.className = "progress-indicator";
    progressBar.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 0%;
      height: 3px;
      background: linear-gradient(90deg, var(--accent-1), var(--accent-2), var(--accent-4));
      z-index: 1000;
      transition: width 0.1s ease;
      box-shadow: 0 0 10px rgba(139, 92, 246, 0.5);
    `;
    document.body.appendChild(progressBar);

    window.addEventListener("scroll", () => {
      const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = (window.scrollY / windowHeight) * 100;
      progressBar.style.width = `${scrolled}%`;
    }, { passive: true });
  }

  // ===== INTERACTIVE CURSOR =====
  // DISABLED - Removed transparent circle cursor feature
  function setupInteractiveCursor() {
    // Cursor feature removed as requested
  }

  // ===== CONTENT FOCUS STATES =====
  function setupParallaxDepth() {
    // DISABLED - Parallax was causing content to disappear
    // Only apply subtle parallax to hero section, not about section
    const heroLeft = $(".heroStage__left");
    
    if (heroLeft) {
      window.addEventListener("scroll", () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * 0.2; // Very subtle parallax
        heroLeft.style.transform = `translateY(${rate}px)`;
      }, { passive: true });
    }
    
    // Ensure about section content is always visible and not moved
    const aboutLeft = $(".aboutStage__left");
    if (aboutLeft) {
      aboutLeft.style.transform = "none";
    }
  }

  function setupSmartBlurring() {
    const menu = $("#navMenu");
    const toggle = $(".nav__toggle");
    
    if (menu && toggle) {
      const blurOverlay = document.createElement("div");
      blurOverlay.className = "blur-overlay";
      blurOverlay.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        opacity: 0;
        pointer-events: none;
        z-index: 99;
        transition: opacity 0.3s ease;
      `;
      document.body.appendChild(blurOverlay);

      const originalToggle = toggle.onclick;
      toggle.addEventListener("click", () => {
        const isOpen = menu.dataset.open === "true";
        if (isOpen) {
          blurOverlay.style.opacity = "0";
          blurOverlay.style.pointerEvents = "none";
        } else {
          blurOverlay.style.opacity = "1";
          blurOverlay.style.pointerEvents = "auto";
        }
      });
    }
  }

  // ===== AUTO TOUR (no voice — quick section cycling) =====
  function setupAutoPlaySlideshow() {
    // durationSeconds: how long to stay per section. Small section = small time; more content = longer.
    const sections = [
      { id: "top", name: "Home", durationSeconds: 4 },
      { id: "about", name: "About", durationSeconds: 7 },
      { id: "resume", name: "Resume", durationSeconds: 14 },
      { id: "portfolio", name: "Portfolio", durationSeconds: 6 },
      { id: "contact", name: "Contact", durationSeconds: 4 }
    ];

    let currentSectionIndex = 0;
    let isPaused = false;
    let isActive = false;
    let userInteracted = false;
    let advanceTimeout = null;
    let lastUserAction = Date.now();
    const pauseTimeout = 25000;

    const toggleButton = $("[data-autotour-toggle]");
    const toggleIcon = $(".autotour-toggle__icon");
    const toggleText = $(".autotour-toggle__text");

    const clearAdvance = () => {
      if (advanceTimeout) {
        clearTimeout(advanceTimeout);
        advanceTimeout = null;
      }
    };

    const pauseOnInteraction = (e) => {
      if (e && e.target && (e.target.closest("[data-autotour-toggle]") || e.target.closest(".autotour-toggle"))) return;
      lastUserAction = Date.now();
      if (isActive && !userInteracted) {
        userInteracted = true;
        isPaused = true;
        clearAdvance();
        if (toggleButton) {
          toggleButton.classList.remove("autotour-toggle--active");
          if (toggleIcon) toggleIcon.textContent = "▶";
          if (toggleText) toggleText.textContent = "Auto Tour";
        }
        setTimeout(() => {
          if (isActive && Date.now() - lastUserAction >= pauseTimeout) {
            userInteracted = false;
            isPaused = false;
            if (toggleButton) {
              toggleButton.classList.add("autotour-toggle--active");
              if (toggleIcon) toggleIcon.textContent = "⏸";
              if (toggleText) toggleText.textContent = "Pause Tour";
            }
            startSlideshow();
          }
        }, pauseTimeout);
      }
    };

    let scrollDebounce;
    window.addEventListener("scroll", (e) => {
      clearTimeout(scrollDebounce);
      scrollDebounce = setTimeout(() => pauseOnInteraction(e), 150);
    }, { passive: true });
    document.addEventListener("click", pauseOnInteraction);
    document.addEventListener("keydown", pauseOnInteraction);
    document.addEventListener("touchstart", (e) => pauseOnInteraction(e), { passive: true });

    const scrollToSection = (sectionId) => {
      const section = $(`#${sectionId}`);
      if (!section) return;

      const headerOffset = 80;
      const elementPosition = section.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({ top: offsetPosition, behavior: "auto" });

      $$(".nav__link").forEach((link) => {
        link.classList.remove("active");
        if (link.getAttribute("href") === `#${sectionId}`) link.classList.add("active");
      });
    };

    const scheduleNext = () => {
      if (!isActive || isPaused || userInteracted) return;
      clearAdvance();
      const sec = sections[currentSectionIndex];
      if (!sec) return;
      advanceTimeout = setTimeout(() => {
        if (!isActive || isPaused || userInteracted) return;
        currentSectionIndex = (currentSectionIndex + 1) % sections.length;
        const next = sections[currentSectionIndex];
        scrollToSection(next.id);
        scheduleNext();
      }, (sec.durationSeconds || 4) * 1000);
    };

    const startSlideshow = () => {
      clearAdvance();
      isActive = true;
      isPaused = false;
      userInteracted = false;
      currentSectionIndex = 0;

      if (toggleButton) {
        toggleButton.classList.add("autotour-toggle--active");
        if (toggleIcon) toggleIcon.textContent = "⏸";
        if (toggleText) toggleText.textContent = "Pause Tour";
      }

      scrollToSection("top");
      scheduleNext();
    };

    const stopSlideshow = () => {
      clearAdvance();
      isActive = false;
      isPaused = true;
      if (toggleButton) {
        toggleButton.classList.remove("autotour-toggle--active");
        if (toggleIcon) toggleIcon.textContent = "▶";
        if (toggleText) toggleText.textContent = "Auto Tour";
      }
    };

    const toggleSlideshow = () => {
      if (isActive) {
        stopSlideshow();
        setToast("Auto Tour paused");
      } else {
        userInteracted = false;
        isPaused = false;
        startSlideshow();
        setToast("Auto Tour started — quickly cycling through sections.");
      }
    };

    if (toggleButton) {
      toggleButton.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSlideshow();
      });
    }
  }

  // Initialize all features
  setupTheme();
  setupHeaderElevation();
  setupMobileNav();
  setupCopyButtons();
  setupYear();
  setupProfilePhotos();
  setupPhotoUpload();
  setupScrollAnimations();
  setupSmoothScroll();
  setupActiveNavLink();
  setupMeterAnimations();
  setupProgressiveReveal();
  setupNavigationTransitions();
  setupMagneticButtons();
  setupActiveLinkUnderlines();
  setupProgressIndicator();
  setupInteractiveCursor();
  setupParallaxDepth();
  setupSmartBlurring();
  setupAutoPlaySlideshow();
})();
