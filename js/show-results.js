// Renders show-results.html cards from /data/show-results.json
// This lets the CMS edit a simple data file instead of raw HTML.

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

function renderImages(images) {
  if (images.length === 1) {
    const img = images[0];
    return `<img src="${escapeHtml(img.src)}" alt="${escapeHtml(img.alt)}">`;
  }
  const imgs = images.map(img =>
    `<img src="${escapeHtml(img.src)}" alt="${escapeHtml(img.alt)}" style="height:100%; object-fit:cover;">`
  ).join('');
  return `<div style="display:grid; grid-template-columns:1fr 1fr; gap:2px;">${imgs}</div>`;
}

function renderEntry(entry) {
  const cardClasses = ['result-card'];
  if (entry.images.length > 1) cardClasses.push('dual-photo');
  if (entry.milestone) cardClasses.push('milestone');

  const metaParts = [`<span><strong>Date:</strong> ${escapeHtml(entry.date)}</span>`];
  if (entry.class) metaParts.push(`<span><strong>Class:</strong> ${escapeHtml(entry.class)}</span>`);

  let html = '';
  if (entry.milestone && entry.milestoneLabel) {
    html += `<div class="milestone-banner">${escapeHtml(entry.milestoneLabel)}</div>`;
  }

  html += `<div class="${cardClasses.join(' ')}">
    ${renderImages(entry.images)}
    <div class="result-card-body">
      <span class="result-placement">${escapeHtml(entry.placement)}</span>
      <h3 style="margin-bottom:4px;">${escapeHtml(entry.show)}</h3>
      <div class="result-meta">${metaParts.join('')}</div>
      <p>${formatDescription(entry.description)}</p>
    </div>
  </div>`;

  if (entry.bannerImage) {
    html += `<div style="margin: -8px 0 32px; text-align:center;">
      <img src="${escapeHtml(entry.bannerImage)}" alt="${escapeHtml(entry.bannerImageAlt || '')}" style="max-width:480px; width:100%; border-radius:6px; box-shadow: 0 8px 28px rgba(0,0,0,0.18);">
    </div>`;
  }

  return html;
}

async function loadShowResults() {
  const container = document.getElementById('results-container');
  if (!container) return;

  try {
    const res = await fetch('data/show-results.json');
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

    container.innerHTML = entries.map(renderEntry).join('\n');
  } catch (err) {
    console.error('Show results failed to load:', err);
    container.innerHTML = '<p style="text-align:center; opacity:0.7; padding: 40px 0;">Show results are temporarily unavailable. Please try again shortly.</p>';
  }
}

document.addEventListener('DOMContentLoaded', loadShowResults);
