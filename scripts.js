
// ========================================
// SCROLL REVEAL (data-reveal API)
// - [data-reveal="fade-up|fade-in|fade-left|fade-right|fade-down"]
// - Optional: [data-reveal-delay="120"]  (ms)
// - Optional: [data-reveal-group="name"] + parent [data-reveal-stagger="90"] for auto-stagger
// - Respects prefers-reduced-motion
// ========================================
(function(){
  const prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Collect all revealable elements
  const $all = Array.from(document.querySelectorAll("[data-reveal]"));
  if (!$all.length) return;

  // If reduced motion is preferred: reveal immediately, skip IO
  if (prefersReduced) {
    $all.forEach(el => el.classList.add("is-revealed"));
    return;
  }

  // Build group maps for staggering: { groupName: Element[] }
  const groups = new Map();
  $all.forEach(el => {
    const group = el.getAttribute("data-reveal-group");
    if (group) {
      if (!groups.has(group)) groups.set(group, []);
      groups.get(group).push(el);
    }
  });

  // Helper: compute base delay for an element (own delay attr)
  const parseDelay = (el) => {
    const d = Number(el.getAttribute("data-reveal-delay") || 0);
    return Number.isFinite(d) ? d : 0;
  };

  // Helper: get stagger (ms) for a given element by looking up the closest ancestor with data-reveal-stagger,
  // falling back to 100ms if not present.
  const getStaggerFor = (el) => {
    const carrier = el.closest("[data-reveal-stagger]");
    if (!carrier) return 100;
    const val = Number(carrier.getAttribute("data-reveal-stagger"));
    return Number.isFinite(val) ? val : 100;
  };

  // Sort each group by DOM order and assign incremental stagger offsets.
  // Elements can still keep their own base delay; stagger is added on top.
  const groupDelays = new WeakMap(); // Element -> extra delay from grouping
  groups.forEach((elements, name) => {
    const stagger = getStaggerFor(elements[0]); // all items in the group share nearest carrier
    // Sort by document order to ensure natural flow
    elements.sort((a, b) => a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1);
    elements.forEach((el, i) => {
      groupDelays.set(el, i * stagger);
    });
  });

  // IntersectionObserver to reveal items
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        io.unobserve(el);

        // Compute final delay: element's own delay + group stagger (if any)
        const own = parseDelay(el);
        const extra = groupDelays.get(el) || 0;
        const totalDelay = Math.max(0, own + extra);

        if (totalDelay > 0) {
          el.style.transitionDelay = totalDelay + "ms";
        }

        // Trigger reveal
        requestAnimationFrame(() => {
          el.classList.add("is-revealed");
        });
      }
    });
  }, {
    root: null,
    rootMargin: "0px 0px -10% 0px", // reveal a bit before fully centered
    threshold: 0.15
  });

  // Observe all elements (skip those already above the fold to avoid flash)
  $all.forEach(el => io.observe(el));
})();

// ========================================
// WORK PAGE: restore scroll ONLY when returning from a project
// ========================================
(function(){
  const isWorkPage = /(^|\/)work\.html(\?|#|$)/.test(location.pathname);

  // When on the Work page, set up click handlers on project cards.
  if (isWorkPage) {
    // Mark that we're leaving to a project and remember current scroll.
    document.addEventListener('click', (e) => {
      const a = e.target.closest && e.target.closest('a.work__card');
      if (!a) return;
      // Only set the flag for same-origin navigations to project pages.
      try {
        const url = new URL(a.href, location.href);
        if (url.origin === location.origin) {
          sessionStorage.setItem('workScroll', String(window.scrollY || window.pageYOffset || 0));
          sessionStorage.setItem('workReturn', '1');
          sessionStorage.setItem('workHref', url.href); // optional debug/info
        }
      } catch(_) {}
    });

    // On load or BFCache restore, only restore if the explicit flag is present AND referrer matches the project link.
    const restoreIfNeeded = () => {
      const hasFlag = sessionStorage.getItem('workReturn') === '1';
      const storedFrom = sessionStorage.getItem('workHref') || '';
      let cameFrom = '';
      try {
        cameFrom = new URL(document.referrer, location.href).href;
      } catch(_) { cameFrom = document.referrer || ''; }

      // Only restore if:
      // - we have the one-shot flag, AND
      // - the referrer exactly matches the stored project href (same-origin return)
      const shouldRestore = hasFlag && storedFrom && cameFrom && (cameFrom === storedFrom);

      if (shouldRestore) {
        const y = Number(sessionStorage.getItem('workScroll') || 0);
        if (Number.isFinite(y) && y > 0) {
          window.scrollTo(0, y);
        }
      }

      // Always clear the one-shot data on arrival to Work, so future visits start at top unless coming directly from a project via a fresh click.
      sessionStorage.removeItem('workReturn');
      sessionStorage.removeItem('workScroll');
      sessionStorage.removeItem('workHref');
    };

    // Use pageshow to catch BFCache restores as well as normal loads.
    window.addEventListener('pageshow', restoreIfNeeded);
    // Also run on DOMContentLoaded in case pageshow didn't fire in some browsers.
    window.addEventListener('DOMContentLoaded', restoreIfNeeded);
  }
})();
// ========================================
// MOBILE OVERLAY MENU (<768px)
// ========================================
(function(){
  const menuToggle  = document.getElementById('menuToggle');
  const mobileNav   = document.getElementById('mobileNav');
  const mobileClose = document.getElementById('mobileNavClose');
  const menuIcon    = document.querySelector('.header__menu-icon');
  const closeIcon   = document.querySelector('.header__close-icon');

  if (!menuToggle || !mobileNav) return;

  const isMobile = () => window.innerWidth < 768;

  function openMenu(){
    if (!isMobile()) return;
    mobileNav.classList.add('is-open');
    document.body.classList.add('is-locked');
    menuToggle.classList.add('is-open');
    mobileNav.setAttribute('aria-hidden','false');
  }

  function closeMenu(){
    mobileNav.classList.remove('is-open');
    document.body.classList.remove('is-locked');
    menuToggle.classList.remove('is-open');
    mobileNav.setAttribute('aria-hidden','true');
    menuToggle.focus({ preventScroll: true });
  }

  menuToggle.addEventListener('click', () => {
    if (mobileNav.classList.contains('is-open')) closeMenu();
    else openMenu();
  });

  if (mobileClose) mobileClose.addEventListener('click', closeMenu);

  mobileNav.querySelectorAll('.header__mobile-link').forEach(a => {
    a.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileNav.classList.contains('is-open')) closeMenu();
  });

  window.addEventListener('resize', () => {
    if (!isMobile() && mobileNav.classList.contains('is-open')) {
      closeMenu();
    }
  });
})();

// ========================================
// HERO SCROLL CTA: smooth scroll to next section
// ========================================
// ========================================
// HERO SCROLL CTA: smooth scroll to next section (with header offset)
// ========================================
// ========================================
// HERO SCROLL CTA: smooth scroll to next section (header offset only on mobile)
// ========================================
(function () {
  const cta = document.querySelector(".hero__scroll");
  const target = document.getElementById("services");
  if (!cta || !target) return;
  function scrollNext() {
    const prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      const header = document.querySelector('.header');
      const offset = (header && header.offsetHeight) ? header.offsetHeight : 64; // fallback
      const targetTop = target.getBoundingClientRect().top + window.pageYOffset - offset - 8; // extra 8px breathing
      window.scrollTo({ top: targetTop, behavior: prefersReduced ? 'auto' : 'smooth' });
    } else {
      // Desktop: keep previous behavior (no manual offset)
      target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
    }
  }
  cta.addEventListener("click", scrollNext);
  // Optional: Enter/Space will activate automatically on <button>
})();

// ========================================
// SERVICES ACCORDION (smooth height + fade)
// ========================================
// Remove sticky focus color for mouse users while preserving keyboard focus styles
const buttons = document.querySelectorAll("[data-accordion-trigger]");
buttons.forEach((button) => {
  button.addEventListener("mousedown", (e) => {
    // Only apply for real mouse interactions (e.detail > 0)
    if (e.detail > 0) {
      setTimeout(() => button.blur(), 0); // defer so click still fires
    }
  });
});
(function () {
  // buttons already defined above
  if (!buttons.length) return;

  const prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function openItem(button, item, content, inner) {
    button.setAttribute("aria-expanded", "true");
    item.classList.add("is-open");
    if (prefersReduced) {
      content.style.height = "auto";
      return;
    }
    // Ensure overflow hidden for the animation
    content.style.overflow = "hidden";
    content.style.willChange = "height";
    // If it's auto, set to its current pixel height first (no jump)
    const start = content.offsetHeight; // current rendered height
    const target = inner.scrollHeight;  // full content height
    content.style.height = start + "px";
    // Next frame: go to target height so transition can run
    requestAnimationFrame(() => {
      content.style.height = target + "px";
    });
    // After transition, lock to auto for responsiveness
    const onEnd = (e) => {
      if (e.propertyName !== "height") return;
      content.style.height = "auto";
      content.style.overflow = "hidden";
      content.style.willChange = "auto";
      content.removeEventListener("transitionend", onEnd);
    };
    content.addEventListener("transitionend", onEnd);
  }

  function closeItem(button, item, content, inner) {
    button.setAttribute("aria-expanded", "false");
    item.classList.remove("is-open");
    if (prefersReduced) {
      content.style.height = "0px";
      return;
    }
    content.style.overflow = "hidden";
    content.style.willChange = "height";
    // If height is auto, set to its pixel value before collapsing
    if (getComputedStyle(content).height === "auto" || content.style.height === "" || content.style.height === "auto") {
      content.style.height = inner.scrollHeight + "px";
    }
    // Next frame: collapse to 0
    requestAnimationFrame(() => {
      content.style.height = "0px";
    });
    const onCloseEnd = (e) => {
      if (e.propertyName !== "height") return;
      content.style.willChange = "auto";
      content.removeEventListener("transitionend", onCloseEnd);
    };
    content.addEventListener("transitionend", onCloseEnd);
  }

  function toggle(button) {
    const item = button.closest(".accordion__item");
    const content = item.querySelector(".accordion__content");
    const inner = content.querySelector(".accordion__inner");
    const isOpen = button.getAttribute("aria-expanded") === "true";

    // Close others
    buttons.forEach((other) => {
      if (other === button) return;
      const otherItem = other.closest(".accordion__item");
      const otherContent = otherItem.querySelector(".accordion__content");
      const otherInner = otherContent.querySelector(".accordion__inner");
      if (other.getAttribute("aria-expanded") === "true") {
        closeItem(other, otherItem, otherContent, otherInner);
      }
    });

    // Toggle current
    if (isOpen) {
      closeItem(button, item, content, inner);
    } else {
      openItem(button, item, content, inner);
    }
  }

  // Init
  buttons.forEach((button) => {
    const item = button.closest(".accordion__item");
    const content = item.querySelector(".accordion__content");
    const inner = content.querySelector(".accordion__inner");
    button.setAttribute("aria-expanded", "false");
    content.style.height = "0px";
    content.style.overflow = "hidden";
    button.addEventListener("click", () => toggle(button));
  });

  // Keep open panels sized on resize
  window.addEventListener("resize", () => {
    buttons.forEach((button) => {
      if (button.getAttribute("aria-expanded") === "true") {
        const item = button.closest(".accordion__item");
        const content = item.querySelector(".accordion__content");
        const inner = content.querySelector(".accordion__inner");
        // Temporarily set to pixel height to avoid jump, then back to auto
        content.style.height = inner.scrollHeight + "px";
        requestAnimationFrame(() => {
          content.style.height = "auto";
        });
      }
    });
  });
})();


// ========================================
// FIX: Remove persistent hover styles on click
// ========================================
document.querySelectorAll('.work__button, .footer__button, .hero__scroll').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.blur(); // remove focus so :hover or :focus-visible styles reset
  });
});




// ========================================
// CONTACT PAGE: service chip toggles + submit blur
// ========================================
(function(){
  const chipButtons = document.querySelectorAll('.contact__service-btn');
  const hidden = document.getElementById('service');
  if (chipButtons.length && hidden){
    chipButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        chipButtons.forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        const val = btn.getAttribute('data-value') || '';
        hidden.value = val;
        btn.blur();
      });
    });
  }

  document.querySelectorAll('.contact__submit').forEach(btn => {
    btn.addEventListener('click', () => btn.blur());
  });
})();



// ========================================
// WORK PAGE: Sequential reveal animation for .work__card (work.html)
// ========================================
(function() {
  // Detect if we're on the work page (by body class)
  if (!document.body.classList.contains('page-work')) return;

  // On Work page, some containers (e.g., #work section or footer CTA) might also carry [data-reveal].
  // If Safari/iOS misses the IO callback, they could stay transparent. Force-reveal everything.
  const allReveals = Array.from(document.querySelectorAll('[data-reveal]'));
  if (allReveals.length) {
    allReveals.forEach(el => {
      el.removeAttribute('data-reveal');
      el.classList.add('is-revealed');
      el.style.opacity = '1';
      el.style.visibility = 'visible';
      el.style.transform = 'none';
      el.style.transitionDelay = '';
    });
  }

  // Prefers reduced motion?
  const prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Find all .work__card elements
  const cards = Array.from(document.querySelectorAll('.work__card'));
  if (!cards.length) return;

  // Defensive: if any CSS hides [data-reveal] by default, strip the attribute so cards are never invisible
  cards.forEach(card => {
    if (card.hasAttribute('data-reveal')) card.removeAttribute('data-reveal');
    card.style.opacity = '';
    card.style.visibility = '';
    card.style.transform = '';
  });

  // Remove any IntersectionObserver reveal classes/delays (if present)
  // (We don't need to unobserve since the script above only attaches IO to [data-reveal], but for safety, remove any transitionDelay)
  cards.forEach(card => {
    card.style.transitionDelay = '';
  });

  // Reveal all cards at once if reduced motion, else animate sequentially
  if (prefersReduced) {
    cards.forEach(card => {
      card.classList.add('is-revealed');
      card.style.opacity = '1';
      card.style.visibility = 'visible';
      card.style.transform = 'none';
    });
    return;
  }

  // Otherwise, sequentially add is-revealed with stagger
  window.addEventListener('DOMContentLoaded', function() {
    // Delay start by ~100ms so header can load in first
    setTimeout(function() {
      cards.forEach((card, i) => {
        setTimeout(function() {
          card.classList.add('is-revealed');
          card.style.opacity = '1';
          card.style.visibility = 'visible';
          card.style.transform = 'none';
        }, i * 60);
      });
    }, 100);
  });
})();

// ========================================
// PROJECT DETAIL PAGES: force reveal on mobile to avoid blank gaps
// ========================================
(function() {
  // Only run on small screens
  if (window.innerWidth >= 768) return;

  // Match any project detail HTML like project-*.html, also allow optional trailing slash or missing .html
  const isProjectDetail = /(^|\/)project-.*(\.html)?(\/|\?|#|$)/.test(location.pathname);
  if (!isProjectDetail) return;

  const allReveals = Array.from(document.querySelectorAll('[data-reveal]'));
  if (!allReveals.length) return;

  // Force everything into a revealed/visible state
  allReveals.forEach(el => {
    el.removeAttribute('data-reveal');
    el.classList.add('is-revealed');
    el.style.opacity = '1';
    el.style.visibility = 'visible';
    el.style.transform = 'none';
    el.style.transitionDelay = '';
  });
})();

// ========================================
// CONTACT FORM: AJAX submit to contact.php (JSON)
// - Looks for <form id="contactForm"> with inputs: name, email, message
// - Optional hidden honeypot: _gotcha (left empty)
// - Optional hidden "service" that is set by chips elsewhere in this file
// - Displays status in .contact__status (creates one if missing)
// ========================================
(function(){
  const form = document.getElementById('contactForm');
  if (!form) return;

  // Endpoint: prefer action attribute; fallback to 'contact.php' relative path
  const endpoint = (form.getAttribute('action') || 'contact.php').replace(/^\//, '');

  // Status element (create if not present)
  let statusEl = form.querySelector('.contact__status');
  if (!statusEl) {
    statusEl = document.createElement('p');
    statusEl.className = 'contact__status';
    statusEl.hidden = true;
    form.appendChild(statusEl);
  }

  // Submit button
  const submitBtn = form.querySelector('.contact__submit') || form.querySelector('[type="submit"]');

  function setStatus(msg, ok){
    statusEl.textContent = msg;
    statusEl.hidden = false;
    statusEl.style.color = ok ? '#137333' : '#b3261e';
  }

  async function handleSubmit(e){
    e.preventDefault();

    // Basic client validation
    const name = (form.querySelector('[name="name"]') || {}).value?.trim() || '';
    const email = (form.querySelector('[name="email"]') || {}).value?.trim() || '';
    const message = (form.querySelector('[name="message"]') || {}).value?.trim() || '';
    if (!name || !email || !message || message.length < 5){
      setStatus('Please fill your name, a valid email and a longer message.', false);
      return;
    }

    // Disable UI while sending
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.setAttribute('aria-busy', 'true');
    }

    try {
      const fd = new FormData(form);
      // Ensure honeypot exists (empty)
      if (!fd.has('_gotcha')) fd.set('_gotcha', '');

      const res = await fetch(endpoint, {
        method: 'POST',
        body: fd,
        headers: { 'Accept': 'application/json' }
      });

      const isJSON = (res.headers.get('content-type') || '').includes('application/json');
      const data = isJSON ? await res.json() : null;

      if (res.ok && data && data.success){
        setStatus(data.message || 'Message sent! I’ll get back to you shortly.', true);
        form.reset();
        // clear active state on service chips if any
        form.querySelectorAll('.contact__service-btn.is-active').forEach(b => b.classList.remove('is-active'));
      } else {
        const msg = (data && data.message) ? data.message : 'There was a problem sending your message.';
        setStatus(msg, false);
      }
    } catch (err){
      setStatus('Network error. Please try again in a moment.', false);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.removeAttribute('aria-busy');
      }
    }
  }

  form.addEventListener('submit', handleSubmit);
})();