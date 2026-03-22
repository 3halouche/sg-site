/* ═══════════════════════════════════════════════════════
   SG — V5.0 Premium Script
   ═══════════════════════════════════════════════════════ */

const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const prefersReducedMotion = motionQuery.matches;

/* ── Smooth page transitions ── */
const internalTransitionLinks = document.querySelectorAll('.nav-link-transition, .metric-card[href]');

internalTransitionLinks.forEach((link) => {
  if (link.classList.contains('flip-delay')) return;

  link.addEventListener('click', (event) => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('http')) return;
    if (prefersReducedMotion) return;

    event.preventDefault();

    const flash = document.querySelector('.page-flash');
    const fusion = document.getElementById('fusion-transition');
    const fusionTarget = document.getElementById('fusion-target-logo');
    const targetLogo = link.getAttribute('data-target-logo') || 'logo.png';

    if (fusion && fusionTarget) {
      fusionTarget.src = targetLogo;
      fusion.classList.remove('active');
      void fusion.offsetWidth;
      fusion.classList.add('active');
    }

    if (flash) {
      flash.classList.remove('active');
      void flash.offsetWidth;
      flash.classList.add('active');
    }

    window.setTimeout(() => {
      window.location.href = href;
    }, 920);
  });
});

/* ── Mobile menu ── */
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.textContent = isOpen ? '✕' : '☰';
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.textContent = '☰';
    });
  });
}

window.addEventListener('resize', () => {
  if (window.innerWidth > 760 && navLinks) {
    navLinks.classList.remove('open');
    if (menuToggle) {
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.textContent = '☰';
    }
  }
});

/* ── Header shrink on scroll ── */
const header = document.querySelector('.site-header');
if (header) {
  let lastScrollY = 0;
  const handleHeaderScroll = () => {
    const y = window.scrollY;
    if (y > 60) {
      header.style.background = 'rgba(6,14,26,.82)';
    } else {
      header.style.background = '';
    }
    lastScrollY = y;
  };
  window.addEventListener('scroll', handleHeaderScroll, { passive: true });
}

/* ── Intro screen ── */
const intro = document.getElementById('intro-screen');
if (intro && !prefersReducedMotion) {
  window.setTimeout(() => {
    intro.style.display = 'none';
  }, window.innerWidth <= 760 ? 1400 : 2500);
} else if (intro) {
  intro.style.display = 'none';
}

/* ── Current year ── */
const yearTarget = document.getElementById('current-year');
if (yearTarget) yearTarget.textContent = new Date().getFullYear();

/* ── Reveal on scroll ── */
const revealElements = document.querySelectorAll('.reveal');
if (!prefersReducedMotion && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        observer.unobserve(entry.target); // Only animate once
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealElements.forEach((element) => observer.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add('show'));
}

/* ── Particle system (improved) ── */
const canvas = document.getElementById('particles');

if (canvas && !prefersReducedMotion) {
  const ctx = canvas.getContext('2d');
  let particles = [];
  let width = 0;
  let height = 0;
  let frameId = null;
  let isPaused = document.hidden;
  let mouseX = -1000;
  let mouseY = -1000;

  // Track mouse for interaction
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    buildParticles();
  }

  function buildParticles() {
    const isMobile = window.innerWidth <= 760;
    const baseCount = isMobile ? Math.floor(window.innerWidth / 45) : Math.floor(window.innerWidth / 26);
    const count = isMobile
      ? Math.min(24, Math.max(10, baseCount))
      : Math.min(65, Math.max(24, baseCount));

    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.6 + 0.4,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      o: Math.random() * 0.4 + 0.1,
      baseO: 0 // will be set below
    }));

    particles.forEach(p => p.baseO = p.o);
  }

  function drawParticles() {
    if (isPaused) return;

    ctx.clearRect(0, 0, width, height);

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      // Mouse proximity glow
      const dx = p.x - mouseX;
      const dy = p.y - mouseY;
      const dist = Math.hypot(dx, dy);
      const proximity = Math.max(0, 1 - dist / 200);
      p.o = p.baseO + proximity * 0.4;

      ctx.beginPath();
      ctx.fillStyle = `rgba(255,255,255,${p.o})`;
      ctx.arc(p.x, p.y, p.r + proximity * 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Connection lines
    const maxDist = 110;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.hypot(dx, dy);

        if (distance < maxDist) {
          const alpha = (1 - distance / maxDist) * 0.06;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(94,160,255,${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    frameId = window.requestAnimationFrame(drawParticles);
  }

  function handleVisibility() {
    isPaused = document.hidden;
    if (!isPaused && !frameId) drawParticles();
    if (isPaused && frameId) {
      window.cancelAnimationFrame(frameId);
      frameId = null;
    }
  }

  window.addEventListener('resize', resizeCanvas);
  document.addEventListener('visibilitychange', handleVisibility);

  resizeCanvas();
  if (!isPaused) drawParticles();
}

/* ── Tilt effect on cards ── */
const tiltCards = document.querySelectorAll('.tilt-card');

if (!prefersReducedMotion) {
  tiltCards.forEach((card) => {
    if (card.classList.contains('flip-delay')) return;
    const inner = card.querySelector('.flip-card-inner');
    if (!inner) return;

    card.addEventListener('mousemove', (event) => {
      if (window.innerWidth < 980) return;
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const rotateY = ((x / rect.width) - 0.5) * 6;
      const rotateX = -((y / rect.height) - 0.5) * 5;
      inner.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      inner.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
      inner.style.transform = '';
      setTimeout(() => { inner.style.transition = ''; }, 500);
    });
  });

  // Hero logo parallax
  document.querySelectorAll('.hero-visual').forEach((element) => {
    const logo = element.querySelector('.hero-logo');
    if (!logo) return;

    element.addEventListener('mousemove', (event) => {
      if (window.innerWidth < 980) return;
      const rect = element.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      logo.style.transform = `translate(${x * 14}px, ${y * 14}px) scale(1.02)`;
    });

    element.addEventListener('mouseleave', () => {
      logo.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
      logo.style.transform = '';
      setTimeout(() => { logo.style.transition = ''; }, 600);
    });
  });
}

/* ── Metric cards interactive ── */
const metricCards = document.querySelectorAll('.metric-card');

metricCards.forEach((card) => {
  card.addEventListener('mousemove', (event) => {
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    card.style.setProperty('--mx', `${x}px`);
    card.style.setProperty('--my', `${y}px`);

    if (!prefersReducedMotion && window.innerWidth >= 980) {
      const rotateY = ((x / rect.width) - 0.5) * 5;
      const rotateX = -((y / rect.height) - 0.5) * 4;
      card.style.transform = `translateY(-4px) perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.01)`;
    }
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.removeProperty('--mx');
    card.style.removeProperty('--my');
  });

  card.addEventListener('click', (event) => {
    const rect = card.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'metric-ripple-ink';
    ripple.style.left = `${event.clientX - rect.left}px`;
    ripple.style.top = `${event.clientY - rect.top}px`;
    ripple.style.width = `${Math.max(rect.width, rect.height) * 1.2}px`;
    ripple.style.height = ripple.style.width;
    card.appendChild(ripple);
    window.setTimeout(() => ripple.remove(), 700);
  });
});

/* ── Contact form (Formspree AJAX) ── */
const contactForm = document.getElementById('contact-form');

if (contactForm) {
  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const btn = contactForm.querySelector('button[type="submit"]');
    const notice = document.getElementById('contact-notice');
    const originalText = btn.textContent;

    // If still using placeholder, fallback to mailto
    const action = contactForm.getAttribute('action') || '';
    if (action.includes('YOUR_FORM_ID')) {
      const name = contactForm.querySelector('[name="name"]').value.trim();
      const sender = contactForm.querySelector('[name="email"]').value.trim();
      const message = contactForm.querySelector('[name="message"]').value.trim();
      const subject = encodeURIComponent(`Contact site SG - ${name || 'Nouveau message'}`);
      const body = encodeURIComponent(`Nom : ${name}\nEmail : ${sender}\n\nMessage :\n${message}`);
      window.location.href = `mailto:contact@example.com?subject=${subject}&body=${body}`;
      if (notice) {
        notice.hidden = false;
        notice.textContent = 'Redirection vers votre messagerie...';
      }
      return;
    }

    // Formspree AJAX submit
    btn.disabled = true;
    btn.textContent = 'Envoi en cours...';

    try {
      const data = new FormData(contactForm);
      const response = await fetch(action, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        contactForm.reset();
        if (notice) {
          notice.hidden = false;
          notice.style.color = '#4fd2a5';
          notice.textContent = 'Message envoyé avec succès ! Je vous répondrai rapidement.';
        }
        btn.textContent = 'Envoyé ✓';
        setTimeout(() => { btn.textContent = originalText; btn.disabled = false; }, 3000);
      } else {
        throw new Error('Erreur serveur');
      }
    } catch (err) {
      if (notice) {
        notice.hidden = false;
        notice.style.color = '#ff6b6b';
        notice.textContent = 'Une erreur est survenue. Réessayez ou contactez-moi directement.';
      }
      btn.textContent = originalText;
      btn.disabled = false;
    }
  });
}

/* ── Page transition helper ── */
function playPageTransition(href, targetLogo = 'logo.png', delay = 920) {
  const flash = document.querySelector('.page-flash');
  const fusion = document.getElementById('fusion-transition');
  const fusionTarget = document.getElementById('fusion-target-logo');

  if (!prefersReducedMotion) {
    if (fusion && fusionTarget) {
      fusionTarget.src = targetLogo;
      fusion.classList.remove('active');
      void fusion.offsetWidth;
      fusion.classList.add('active');
    }
    if (flash) {
      flash.classList.remove('active');
      void flash.offsetWidth;
      flash.classList.add('active');
    }
  }

  window.setTimeout(() => {
    window.location.href = href;
  }, prefersReducedMotion ? 0 : delay);
}

/* ── Flip-delay cards (smart click handling) ── */
const flipDelayCards = document.querySelectorAll('.flip-delay');

flipDelayCards.forEach((card) => {
  let tappedOnce = false;
  let isNavigating = false;

  card.addEventListener('click', (event) => {
    const href = card.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('http')) return;

    const isTouch = window.matchMedia('(hover: none)').matches;

    event.preventDefault();

    if (isNavigating) return;

    if (window.innerWidth <= 760) {
      playPageTransition(href, card.getAttribute('data-target-logo') || 'logo.png', 760);
      return;
    }

    if (isTouch && !prefersReducedMotion) {
      if (!tappedOnce) {
        card.classList.add('force-flip');
        tappedOnce = true;
        return;
      }
    }

    isNavigating = true;
    card.classList.add('clicked');
    playPageTransition(href, card.getAttribute('data-target-logo') || 'logo.png', 1200);
  });

  card.addEventListener('mouseleave', () => {
    if (window.matchMedia('(hover: none)').matches) return;
    if (isNavigating) return;
    card.classList.remove('force-flip');
    tappedOnce = false;
  });
});

/* ── Smooth scroll for anchor links ── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ═══════════════════════════════════════
   THEME TOGGLE (Dark / Light)
   ═══════════════════════════════════════ */
const themeToggle = document.getElementById('theme-toggle');

if (themeToggle) {
  // Restore saved preference
  const saved = localStorage.getItem('sg-theme');
  if (saved) {
    document.documentElement.setAttribute('data-theme', saved);
    themeToggle.textContent = saved === 'light' ? '🌙' : '☀️';
  }

  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';

    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('sg-theme', next);

    // Animate the icon swap
    themeToggle.style.transform = 'rotate(360deg) scale(0.8)';
    setTimeout(() => {
      themeToggle.textContent = next === 'light' ? '🌙' : '☀️';
      themeToggle.style.transform = '';
    }, 200);
  });
}

/* ═══════════════════════════════════════
   ANIMATED COUNTERS
   ═══════════════════════════════════════ */
const counterElements = document.querySelectorAll('.counter-value[data-target]');

if (counterElements.length > 0 && 'IntersectionObserver' in window) {
  const animateCounter = (el) => {
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 2000;
    const startTime = performance.now();

    const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuart(progress);
      const current = Math.round(easedProgress * target);

      el.textContent = current + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target + suffix;
      }
    };

    requestAnimationFrame(update);
  };

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Stagger the counters
        const counters = entry.target.querySelectorAll('.counter-value[data-target]');
        counters.forEach((counter, i) => {
          setTimeout(() => animateCounter(counter), i * 180);
        });
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  const counterStrip = document.querySelector('.counters-strip');
  if (counterStrip) counterObserver.observe(counterStrip);
}

/* ═══════════════════════════════════════
   TYPEWRITER EFFECT
   ═══════════════════════════════════════ */
const typewriterEl = document.getElementById('typewriter');

if (typewriterEl) {
  const phrases = [
    'Une identité à la croisée du digital, de la scène et de la création visuelle.',
    'Team Leader IT chez XEFI — projet AURA.',
    'Régisseur son officiel — Les Lions du Rire.',
    'Secrétaire de l\'école AL-HIDAYA.',
    'Une signature moderne conçue pour marquer les esprits.'
  ];

  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let pauseTimer = null;

  const TYPE_SPEED = 38;
  const DELETE_SPEED = 22;
  const PAUSE_AFTER_TYPE = 2800;
  const PAUSE_AFTER_DELETE = 400;

  function typeStep() {
    const currentPhrase = phrases[phraseIndex];

    if (!isDeleting) {
      // Typing
      charIndex++;
      typewriterEl.textContent = currentPhrase.slice(0, charIndex);

      if (charIndex === currentPhrase.length) {
        // Finished typing — pause then delete
        pauseTimer = setTimeout(() => {
          isDeleting = true;
          typeStep();
        }, PAUSE_AFTER_TYPE);
        return;
      }

      setTimeout(typeStep, TYPE_SPEED + Math.random() * 30);
    } else {
      // Deleting
      charIndex--;
      typewriterEl.textContent = currentPhrase.slice(0, charIndex);

      if (charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        setTimeout(typeStep, PAUSE_AFTER_DELETE);
        return;
      }

      setTimeout(typeStep, DELETE_SPEED);
    }
  }

  // Start after intro animation
  const introDelay = prefersReducedMotion ? 200 : (window.innerWidth <= 760 ? 1500 : 2600);
  setTimeout(typeStep, introDelay);
}

/* ═══════════════════════════════════════
   BACK TO TOP BUTTON
   ═══════════════════════════════════════ */
const backToTop = document.getElementById('back-to-top');

if (backToTop) {
  const SHOW_THRESHOLD = 400;

  const handleBackToTopScroll = () => {
    if (window.scrollY > SHOW_THRESHOLD) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  };

  window.addEventListener('scroll', handleBackToTopScroll, { passive: true });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ═══════════════════════════════════════
   CUSTOM CURSOR + LIGHT TRAIL
   ═══════════════════════════════════════ */
const cursorGlow = document.getElementById('cursor-glow');

if (cursorGlow && !prefersReducedMotion && !window.matchMedia('(hover: none)').matches && window.innerWidth > 760) {
  let cx = -100, cy = -100;
  let tx = -100, ty = -100;
  const trail = [];
  const TRAIL_COUNT = 6;

  // Create trail dots
  for (let i = 0; i < TRAIL_COUNT; i++) {
    const dot = document.createElement('div');
    dot.className = 'cursor-trail';
    dot.style.width = `${8 - i}px`;
    dot.style.height = `${8 - i}px`;
    dot.style.background = i % 2 === 0
      ? `rgba(255,122,0,${0.4 - i * 0.06})`
      : `rgba(94,160,255,${0.35 - i * 0.05})`;
    document.body.appendChild(dot);
    trail.push({ el: dot, x: -100, y: -100 });
  }

  document.addEventListener('mousemove', (e) => {
    tx = e.clientX;
    ty = e.clientY;
    cursorGlow.classList.add('visible');
  });

  document.addEventListener('mouseleave', () => {
    cursorGlow.classList.remove('visible');
    trail.forEach(t => { t.el.style.opacity = '0'; });
  });

  document.addEventListener('mouseenter', () => {
    cursorGlow.classList.add('visible');
  });

  // Expand on interactive elements
  const interactiveSelectors = 'a, button, .btn, .flip-card, .metric-card, .skill-pill, input, textarea, .theme-toggle, .back-to-top';
  document.querySelectorAll(interactiveSelectors).forEach(el => {
    el.addEventListener('mouseenter', () => cursorGlow.classList.add('hover-expand'));
    el.addEventListener('mouseleave', () => cursorGlow.classList.remove('hover-expand'));
  });

  function animateCursor() {
    // Smooth follow
    cx += (tx - cx) * 0.18;
    cy += (ty - cy) * 0.18;
    cursorGlow.style.left = cx + 'px';
    cursorGlow.style.top = cy + 'px';

    // Trail follows with increasing delay
    let prevX = cx, prevY = cy;
    for (let i = 0; i < trail.length; i++) {
      const t = trail[i];
      t.x += (prevX - t.x) * (0.25 - i * 0.03);
      t.y += (prevY - t.y) * (0.25 - i * 0.03);
      t.el.style.left = t.x + 'px';
      t.el.style.top = t.y + 'px';
      t.el.style.opacity = String(0.5 - i * 0.07);
      prevX = t.x;
      prevY = t.y;
    }

    requestAnimationFrame(animateCursor);
  }

  animateCursor();
}

/* ═══════════════════════════════════════
   PARALLAX ON SCROLL
   ═══════════════════════════════════════ */
if (!prefersReducedMotion) {
  const parallaxElements = document.querySelectorAll('[data-parallax-speed]');
  const heroVisual = document.querySelector('.hero-visual');
  const rings = document.querySelectorAll('.ring');

  if (parallaxElements.length > 0 || heroVisual) {
    let ticking = false;

    const updateParallax = () => {
      const scrollY = window.scrollY;

      // Data-attribute driven parallax
      parallaxElements.forEach(el => {
        const speed = parseFloat(el.dataset.parallaxSpeed) || 0.1;
        el.style.transform = `translateY(${scrollY * speed}px)`;
      });

      // Hero visual subtle float
      if (heroVisual && scrollY < window.innerHeight) {
        const offset = scrollY * 0.06;
        heroVisual.style.transform = `translateY(${offset}px)`;
      }

      // Rings parallax — each ring at slightly different speed
      rings.forEach((ring, i) => {
        if (scrollY < window.innerHeight) {
          const speed = 0.02 + i * 0.015;
          ring.style.transform = `translateY(${scrollY * speed}px) rotate(${scrollY * (0.02 + i * 0.01)}deg)`;
        }
      });

      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });
  }
}

/* ═══════════════════════════════════════
   CLICK BURST PARTICLES
   ═══════════════════════════════════════ */
if (!prefersReducedMotion) {
  document.addEventListener('click', (e) => {
    const burst = document.createElement('div');
    burst.className = 'click-burst';
    burst.style.left = e.clientX + 'px';
    burst.style.top = e.clientY + 'px';
    document.body.appendChild(burst);

    const colors = ['#ff7a00', '#5ea0ff', '#4fd2a5', '#fff', '#ffaa4d', '#8da2ff'];
    const count = 10 + Math.floor(Math.random() * 6);

    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      particle.className = 'click-particle';

      const angle = (Math.PI * 2 / count) * i + (Math.random() - 0.5) * 0.5;
      const distance = 40 + Math.random() * 60;
      const bx = Math.cos(angle) * distance;
      const by = Math.sin(angle) * distance;

      const size = 3 + Math.random() * 5;
      particle.style.width = size + 'px';
      particle.style.height = size + 'px';
      particle.style.background = colors[Math.floor(Math.random() * colors.length)];
      particle.style.setProperty('--bx', bx + 'px');
      particle.style.setProperty('--by', by + 'px');
      particle.style.boxShadow = `0 0 ${size * 2}px ${particle.style.background}`;

      burst.appendChild(particle);
    }

    // Cleanup
    setTimeout(() => burst.remove(), 800);
  });
}
