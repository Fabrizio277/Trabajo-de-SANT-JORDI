function pickRandomPhrase(tone) {
  const list = phrasesByTone[tone] || phrasesByTone.romantic;
  return list[Math.floor(Math.random() * list.length)];
}

function buildShareUrl(data) {
  const params = new URLSearchParams({
    from: data.from,
    to: data.to,
    msg: data.message,
    style: data.style,
    tone: data.tone
  });
  return `rosa.html?${params.toString()}`;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function saveRecentRose(data) {
  const saved = JSON.parse(localStorage.getItem('recentRoses') || '[]');
  saved.unshift(data);
  localStorage.setItem('recentRoses', JSON.stringify(saved.slice(0, 6)));
}

function cardMarkup({ from, to, message, style }) {
  return `
    <article class="rose-card ${style}">
      <div class="rose-card-inner">
        <div class="card-flower">🌹</div>
        <p class="card-mini-title">Rosa virtual de Sant Jordi</p>
        <h1>Per a ${escapeHtml(to)}</h1>
        <p class="card-message">“${escapeHtml(message)}”</p>
        <div class="card-signature">
          <span>Amb afecte,</span>
          <strong>${escapeHtml(from)}</strong>
        </div>
      </div>
    </article>
  `;
}

function initCreatePage() {
  const form = document.getElementById('roseForm');
  if (!form) return;

  const preview = document.getElementById('livePreview');
  const fromInput = document.getElementById('fromName');
  const toInput = document.getElementById('toName');
  const toneInput = document.getElementById('tone');
  const styleInput = document.getElementById('style');
  const customMessage = document.getElementById('customMessage');
  const resetBtn = document.getElementById('resetBtn');

  function updatePreview() {
    const from = fromInput.value.trim() || 'Algú especial';
    const to = toInput.value.trim() || 'Una persona important';
    const tone = toneInput.value;
    const style = styleInput.value;
    const message = customMessage.value.trim() || pickRandomPhrase(tone);

    preview.innerHTML = cardMarkup({ from, to, message, style });
  }

  ['input', 'change'].forEach(eventName => {
    form.addEventListener(eventName, updatePreview);
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    const from = fromInput.value.trim();
    const to = toInput.value.trim();
    const tone = toneInput.value;
    const style = styleInput.value;
    const message = customMessage.value.trim() || pickRandomPhrase(tone);

    const data = { from, to, tone, style, message };
    saveRecentRose(data);
    window.location.href = buildShareUrl(data);
  });

  resetBtn.addEventListener('click', function () {
    setTimeout(updatePreview, 0);
  });

  updatePreview();
}

function initRosePage() {
  const container = document.getElementById('roseCardContainer');
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const from = params.get('from') || 'Algú especial';
  const to = params.get('to') || 'Una persona estimada';
  const tone = params.get('tone') || 'romantic';
  const style = params.get('style') || 'classic';
  const message = params.get('msg') || pickRandomPhrase(tone);

  container.innerHTML = cardMarkup({ from, to, message, style });

  const shareInput = document.getElementById('shareUrl');
  const copyBtn = document.getElementById('copyBtn');
  shareInput.value = window.location.href;

  copyBtn.addEventListener('click', async function () {
    try {
      await navigator.clipboard.writeText(window.location.href);
      copyBtn.textContent = 'Copiat';
      setTimeout(() => {
        copyBtn.textContent = 'Copiar';
      }, 1500);
    } catch (error) {
      shareInput.select();
      document.execCommand('copy');
      copyBtn.textContent = 'Copiat';
    }
  });
}

function initGalleryPage() {
  const gallery = document.getElementById('galleryGrid');
  if (!gallery) return;

  const recent = JSON.parse(localStorage.getItem('recentRoses') || '[]');
  const allCards = [...recent, ...galleryExamples];

  gallery.innerHTML = allCards.map(card => {
    const href = buildShareUrl({
      from: card.from,
      to: card.to,
      message: card.message,
      style: card.style || 'classic',
      tone: card.tone || 'romantic'
    });

    return `
      <a class="gallery-link" href="${href}">
        ${cardMarkup({
          from: card.from,
          to: card.to,
          message: card.message,
          style: card.style || 'classic'
        })}
      </a>
    `;
  }).join('');
}

document.addEventListener('DOMContentLoaded', function () {
  initCreatePage();
  initRosePage();
  initGalleryPage();
});
