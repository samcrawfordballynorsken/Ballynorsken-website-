// Renders show-results.html as a dynamic year-grouped timeline
// from /data/show-results.json (CMS-editable).

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Converts **bold** markdown to <strong> after escaping, so CMS-entered
// text can't inject arbitrary HTML but can still use simple bold emphasis.
function formatDescription(str) {
  const escaped = escapeHtml(str);
  return escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

function yearFromSortDate(sortDate) {
  if (!sortDate || typeof sortDate !== 'string') return 'Results';
  return sortDate.slice(0, 4);
}

function renderImages(images) {
  if (!images || images.length === 0) return '';
  if (images.length === 1) {
    const img = images[0];
    return `<div class="timeline-media"><img src="${escapeHtml(img.src)}" alt="${escapeHtml(img.alt)}" loading="lazy"></div>`;
  }
  const imgs = images.map(img =>
    `<img src="${escapeHtml(img.src)}" alt="${escapeHtml(img.alt)}" loading="lazy">`
  ).join('');
  return `<div class="timeline-media"><div class="timeline-media-grid">${imgs}</div></div>`;
}

function renderEntry(entry, index) {
  const classes = ['timeline-entry', index % 2 === 0 ? 'side-left' : 'side-right'];
  if (entry.milestone) classes.push('milestone');

  const metaParts = [`<span><strong>Date:</strong> ${escapeHtml(entry.date)}</span>`];
  if (entry.class) metaParts.push(`<span><strong>Class:</strong> ${escapeHtml(entry.class)}</span>`);

  let body = '';
  if (entry.milestone && entry.milestoneLabel) {
    body += `<div class="milestone-banner">${escapeHtml(entry.milestoneLabel)}</div>`;
  }

  body += `
    <span class="result-placement">${escapeHtml(entry.placement)}</span>
    <h3>${escapeHtml(entry.show)}</h3>
    <div class="result-meta">${metaParts.join('')}</div>
    <p>${formatDescription(entry.description)}</p>
  `;

  if (entry.bannerImage) {
    body += `<div class="timeline-banner">
      <img src="${escapeHtml(entry.bannerImage)}" alt="${escapeHtml(entry.bannerImageAlt || '')}" loading="lazy">
    </div>`;
  }

  return `<article class="${classes.join(' ')}">
    <span class="timeline-node" aria-hidden="true"></span>
    ${renderImages(entry.images)}
    <div class="timeline-body">${body}</div>
  </article>`;
}

function groupByYear(entries) {
  const groups = [];
  const indexByYear = new Map();

  entries.forEach(entry => {
    const year = yearFromSortDate(entry.sortDate);
    if (!indexByYear.has(year)) {
      indexByYear.set(year, groups.length);
      groups.push({ year, entries: [] });
    }
    groups[indexByYear.get(year)].entries.push(entry);
  });

  return groups;
}

function observeTimeline(container) {
  const entries = container.querySelectorAll('.timeline-entry');
  if (!entries.length) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    entries.forEach(el => el.classList.add('is-visible'));
    return;
  }

  if (!('IntersectionObserver' in window)) {
    entries.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((items) => {
    items.forEach(item => {
      if (!item.isIntersecting) return;
      item.target.classList.add('is-visible');
      observer.unobserve(item.target);
    });
  }, {
    rootMargin: '0px 0px -8% 0px',
    threshold: 0.12
  });

  entries.forEach((el, i) => {
    el.style.transitionDelay = `${Math.min(i % 4, 3) * 70}ms`;
    observer.observe(el);
  });
}

async function loadShowResults() {
  const container = document.getElementById('results-container');
  if (!container) return;

  try {
    const res = await fetch('/data/show-results.json');
    if (!res.ok) throw new Error('Failed to load show results (' + res.status + ')');
    const data = await res.json();

    const entries = (data.entries || []).slice().sort((a, b) => {
      // Newest first, using sortDate (YYYY-MM-DD strings sort correctly as text)
      return b.sortDate.localeCompare(a.sortDate);
    });

    if (entries.length === 0) {
      container.innerHTML = '<p style="text-align:center; opacity:0.7; padding: 40px 0;">No results published yet — check back soon.</p>';
      return;
    }

    const years = groupByYear(entries);
    let globalIndex = 0;
    container.innerHTML = `<div class="results-timeline">
      ${years.map(group => `
        <div class="timeline-year" data-year="${escapeHtml(group.year)}">
          <div class="timeline-year-marker" aria-label="Year ${escapeHtml(group.year)}">${escapeHtml(group.year)}</div>
          ${group.entries.map(entry => renderEntry(entry, globalIndex++)).join('\n')}
        </div>
      `).join('\n')}
    </div>`;

    observeTimeline(container);
  } catch (err) {
    console.error('Show results failed to load:', err);
    container.innerHTML = '<p style="text-align:center; opacity:0.7; padding: 40px 0;">Show results are temporarily unavailable. Please try again shortly.</p>';
  }
}

document.addEventListener('DOMContentLoaded', loadShowResults);
