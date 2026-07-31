document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.topnav');
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
});

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
