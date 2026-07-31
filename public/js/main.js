document.addEventListener('DOMContentLoaded', () => {
  initTopnav();
  initHomeMobileHero();
});

function initTopnav() {
  const toggle = document.querySelector('.topnav-toggle');
  const nav = document.querySelector('.topnav-links');

  if (!toggle || !nav) return;

  if (!nav.id) nav.id = 'site-nav';
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', nav.id);

  const setOpen = (open) => {
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.textContent = open ? '✕' : '☰';
    document.body.classList.toggle('nav-open', open);
  };

  toggle.addEventListener('click', () => setOpen(!nav.classList.contains('open')));

  nav.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => setOpen(false));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('open')) setOpen(false);
  });

  document.addEventListener('click', (e) => {
    if (!nav.classList.contains('open')) return;
    if (nav.contains(e.target) || toggle.contains(e.target)) return;
    setOpen(false);
  });
}

/** Mobile homepage — fixed hero image, scroll-driven darken + zoom-out, text rises over it. */
function initHomeMobileHero() {
  const bg = document.querySelector('.photo-hero--home .photo-hero-bg');
  const parallax = document.querySelector('.photo-hero--home .photo-hero-bg-parallax');
  const scrim = document.querySelector('.photo-hero--home .photo-hero-bg-scrim');
  if (!bg || !parallax) return;

  const hero = bg.closest('.photo-hero--home');
  const mq = window.matchMedia('(max-width: 800px)');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let ticking = false;

  function reset() {
    bg.classList.remove('is-anchored');
    parallax.style.transform = '';
    if (scrim) scrim.style.opacity = '0';
    if (hero) hero.classList.remove('is-scrolled');
  }

  function update() {
    if (!mq.matches || !hero) {
      reset();
      return;
    }

    const scrollY = window.scrollY;
    const vh = window.innerHeight;
    const maxScroll = Math.max(hero.offsetHeight - vh, 1);
    const progress = Math.min(Math.max(scrollY / maxScroll, 0), 1);
    const darkenProgress = Math.min(Math.max(scrollY / (vh * 0.85), 0), 1);

    if (scrim) {
      scrim.style.opacity = String(darkenProgress * 0.58);
    }

    hero.classList.toggle('is-scrolled', scrollY > vh * 0.08);

    if (scrollY + vh >= hero.offsetTop + hero.offsetHeight) {
      bg.classList.add('is-anchored');
      parallax.style.transform = '';
    } else {
      bg.classList.remove('is-anchored');
      if (!reduceMotion.matches) {
        const scale = 1.07 - darkenProgress * 0.07;
        parallax.style.transform = `scale(${scale})`;
      } else {
        parallax.style.transform = progress > 0 ? 'scale(1)' : 'scale(1.07)';
      }
    }

    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }

  mq.addEventListener('change', update);
  reduceMotion.addEventListener('change', update);
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', update);
  window.addEventListener('pageshow', update);
  if (mq.matches && 'scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
  }
  update();
}

/**
 * Submits an enquiry form via Netlify Forms.
 */
function sendEnquiry(event, toAddress) {
  event.preventDefault();
  const form = event.target;
  const btn = form.querySelector('[type="submit"]');
  const status = getOrCreateStatus(form);

  const formName = form.getAttribute('name') || 'enquiry';
  const data = new FormData(form);
  data.set('form-name', formName);
  if (toAddress) data.set('destination', toAddress);

  status.hidden = true;
  status.className = 'form-status';
  status.textContent = '';
  if (btn) {
    btn.disabled = true;
    btn.dataset.originalLabel = btn.textContent;
    btn.textContent = 'Sending…';
  }

  fetch('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(data).toString(),
  })
    .then((res) => {
      if (!res.ok) throw new Error('Submission failed');
      form.reset();
      status.hidden = false;
      status.className = 'form-status success';
      status.textContent = 'Thank you — your message has been sent. We’ll get back to you soon.';
    })
    .catch(() => {
      status.hidden = false;
      status.className = 'form-status error';
      status.textContent = 'Sorry, something went wrong. Please email us directly or try again.';
    })
    .finally(() => {
      if (btn) {
        btn.disabled = false;
        btn.textContent = btn.dataset.originalLabel || 'Send Message';
      }
    });

  return false;
}

function getOrCreateStatus(form) {
  let status = form.querySelector('.form-status');
  if (!status) {
    status = document.createElement('p');
    status.className = 'form-status';
    status.setAttribute('role', 'status');
    status.hidden = true;
    form.appendChild(status);
  }
  return status;
}
