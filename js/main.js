document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.site-header, .topnav');
  const toggle = document.querySelector('.nav-toggle, .topnav-toggle');
  const nav = document.querySelector('.main-nav, .topnav-links');

  const onScroll = () => {
    if (!header) return;
    if (window.scrollY > 40) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  onScroll();
  window.addEventListener('scroll', onScroll);

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      nav.classList.toggle('open');
      toggle.textContent = nav.classList.contains('open') ? '✕' : '☰';
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.textContent = '☰';
    }));
  }
});

/**
 * Builds a mailto: link from an enquiry form and opens the visitor's
 * email client with the message pre-filled. Attach via:
 * <form onsubmit="return sendEnquiry(event, 'kennel@ballynorsken.se')">
 */
function sendEnquiry(event, toAddress) {
  event.preventDefault();
  const form = event.target;
  const get = (name) => (form.querySelector(`[name="${name}"]`)?.value || '').trim();

  const name = get('name');
  const email = get('email');
  const interest = get('interest');
  const message = get('message');

  const subject = encodeURIComponent(`Ballynorsken enquiry from ${name || 'website visitor'}`);
  const bodyLines = [];
  if (interest) bodyLines.push(`Interested in: ${interest}`);
  bodyLines.push(`Name: ${name}`);
  bodyLines.push(`Email: ${email}`);
  bodyLines.push('');
  bodyLines.push(message);
  const body = encodeURIComponent(bodyLines.join('\n'));

  window.location.href = `mailto:${toAddress}?subject=${subject}&body=${body}`;
  return false;
}
