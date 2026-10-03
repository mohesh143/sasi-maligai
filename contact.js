// Contact page: shop details, map and the feedback form.
siteReady.then(function (cfg) {
  var hoursBox = document.getElementById('hoursText');
  if (hoursBox) hoursBox.textContent = cfg.openingHours || '';
  var phone = document.getElementById('phoneLink');
  if (phone && cfg.phone) { phone.textContent = cfg.phone; phone.setAttribute('href', cfg.phoneHref); }
  var email = document.getElementById('emailLink');
  if (email && cfg.email) { email.textContent = cfg.email; email.setAttribute('href', 'mailto:' + cfg.email); }
  var addr = document.getElementById('addressText');
  if (addr) addr.textContent = cfg.address || '';
  if (cfg.mapsEmbedUrl) {
    var f = document.getElementById('mapFrame');
    f.src = cfg.mapsEmbedUrl; f.hidden = false;
  }
  var empty = !cfg.phone && !cfg.email && !cfg.address && !cfg.whatsappUrl;
  document.getElementById('noDetails').hidden = !empty;
});

(function () {
  var stars = document.querySelectorAll('#starRating button');
  var ratingInput = document.getElementById('fbRating');
  var form = document.getElementById('feedbackForm');
  var box = document.getElementById('feedbackAlert');
  if (!form) return;

  function setRating(n) {
    ratingInput.value = n;
    stars.forEach(function (b) {
      var on = Number(b.getAttribute('data-value')) <= n;
      b.classList.toggle('selected', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }
  stars.forEach(function (b) { b.addEventListener('click', function () { setRating(Number(b.getAttribute('data-value'))); }); });

  function say(kind, text) { box.textContent = ''; box.appendChild(el('div', { class: 'alert alert-' + kind, role: 'alert', text: text })); }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var rating = Number(ratingInput.value);
    if (!rating) return say('error', 'Please choose 1 to 5 stars.');
    var btn = form.querySelector('button[type=submit]'); btn.disabled = true;
    fetch('/api/feedback', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: document.getElementById('fbName').value, rating: rating, message: document.getElementById('fbMessage').value, website: form.elements['website'].value })
    }).then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
      .then(function (res) {
        if (!res.ok) throw new Error(res.d.error || 'Something went wrong.');
        say('success', 'Thank you! Your feedback has been sent.');
        form.reset(); setRating(0);
      })
      .catch(function (err) { say('error', err.message); })
      .then(function () { btn.disabled = false; });
  });
})();
