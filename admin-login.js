// Login page. If no admin exists yet, it becomes the "create your admin account" page.
(function () {
  var form = document.getElementById('loginForm');
  var title = document.getElementById('formTitle');
  var btn = document.getElementById('submitBtn');
  var confirmRow = document.getElementById('confirmRow');
  var setupMode = false;

  function say(kind, text) {
    var box = document.getElementById('loginAlert'); box.textContent = '';
    if (text) box.appendChild(el('div', { class: 'alert alert-' + kind, role: 'alert', text: text }));
  }
  function el(tag, props) { var n = document.createElement(tag); Object.keys(props).forEach(function (k) { if (k === 'text') n.textContent = props[k]; else if (k === 'class') n.className = props[k]; else n.setAttribute(k, props[k]); }); return n; }

  fetch('/api/admin/status', { credentials: 'same-origin' }).then(function (r) { return r.json(); }).then(function (s) {
    if (s.loggedIn) { location.href = 'dashboard.html'; return; }
    if (s.needsSetup) {
      setupMode = true;
      title.textContent = 'Create your admin account';
      btn.textContent = 'Create account';
      confirmRow.hidden = false;
      document.getElementById('setupNote').hidden = false;
      document.getElementById('password').autocomplete = 'new-password';
    }
  }).catch(function () { say('error', 'Cannot reach the website server. Is the black server window still open?'); });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    say('', '');
    var username = document.getElementById('username').value.trim();
    var password = document.getElementById('password').value;
    if (setupMode && password !== document.getElementById('password2').value) return say('error', 'The two passwords are not the same.');
    btn.disabled = true;
    fetch(setupMode ? '/api/admin/setup' : '/api/admin/login', {
      method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username, password: password })
    }).then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
      .then(function (res) {
        if (!res.ok) throw new Error(res.d.error || 'Login failed.');
        location.href = 'dashboard.html';
      })
      .catch(function (err) { say('error', err.message); btn.disabled = false; });
  });
})();
