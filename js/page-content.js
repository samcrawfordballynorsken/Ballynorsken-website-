// Generic loader for simple CMS-editable text content.
// Usage: <p id="my-field">fallback text</p>  +  data-content-src="data/mypage.json"
// on the <body> tag, with matching camelCase keys in that JSON file mapped to
// element IDs by converting id="hero-lede" -> key "heroLede".
//
// Uses textContent only (never innerHTML) so CMS-entered text can never
// inject markup, scripts, or break the page layout.

function idToKey(id) {
  return id.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

async function loadPageContent() {
  const src = document.body.getAttribute('data-content-src');
  if (!src) return;

  try {
    const res = await fetch(src);
    if (!res.ok) throw new Error('Failed to load content (' + res.status + ')');
    const data = await res.json();

    document.querySelectorAll('[id]').forEach(el => {
      const key = idToKey(el.id);
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        el.textContent = data[key];
      }
    });
  } catch (err) {
    // Fail silently and keep whatever fallback text is already in the HTML —
    // the page still works, it just won't reflect the latest CMS edits.
    console.error('Page content failed to load, showing fallback text:', err);
  }
}

document.addEventListener('DOMContentLoaded', loadPageContent);
