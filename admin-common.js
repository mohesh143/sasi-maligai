// ==========================================================
// admin-common.js - used by every admin page except login.
//  * checks you are logged in (otherwise goes to the login page)
//  * draws the side/top menu
//  * api() = talks to the server and shows friendly errors
// ==========================================================
(function () {
  var LINKS = [['dashboard.html', 'Dashboard'], ['products.html', 'Products'], ['categories.html', 'Categories'],
    ['feedback.html', 'Feedback'], ['settings.html', 'Shop settings'], ['backup.html', 'Backup & Restore'], ['account.html', 'Account']];

  window.el = function (tag, props, children) {
    var node = document.createElement(tag);
    Object.keys(props || {}).forEach(function (k) {
      if (k === 'text') node.textContent = props[k];
      else if (k === 'class') node.className = props[k];
      else node.setAttribute(k, props[k]);
    });
    (children || []).forEach(function (c) { if (c) node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return node;
  };

  window.api = function (path, options) {
    options = options || {};
    var init = { method: options.method || 'GET', headers: {}, credentials: 'same-origin' };
    if (options.json !== undefined) { init.headers['Content-Type'] = 'application/json'; init.body = JSON.stringify(options.json); }
    if (options.form) init.body = options.form;
    return fetch(path, init).then(function (res) {
      return res.text().then(function (t) {
        var data = {};
        try { data = t ? JSON.parse(t) : {}; } catch (e) { data = { error: 'The server sent an unexpected reply (status ' + res.status + ').' }; }
        if (res.status === 401 && !options.noRedirect) { location.href = 'login.html'; throw new Error('Please log in.'); }
        if (!res.ok) { var err = new Error(data.error || 'Something went wrong.'); err.data = data; throw err; }
        return data;
      });
    });
  };

  window.showAlert = function (boxId, kind, text) {
    var box = document.getElementById(boxId);
    if (!box) return;
    box.textContent = '';
    if (text) box.appendChild(el('div', { class: 'alert alert-' + kind, role: 'alert', text: text }));
  };

  window.fmtDate = function (iso) {
    if (!iso) return '';
    var d = new Date(iso);
    return isNaN(d) ? '' : d.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  };

  function drawNav(user) {
    var nav = document.getElementById('adminNav');
    if (!nav) return;
    var page = location.pathname.split('/').pop();
    nav.textContent = '';
    nav.appendChild(el('span', { class: 'brand', text: 'Sasi Maligai' }));
    LINKS.forEach(function (l) {
      var a = el('a', { href: l[0], text: l[1] });
      if (l[0] === page) { a.className = 'active'; a.setAttribute('aria-current', 'page'); }
      nav.appendChild(a);
    });
    nav.appendChild(el('a', { href: '../index.html', target: '_blank', text: 'View website' }));
    var out = el('a', { href: '#', text: 'Log out' });
    out.addEventListener('click', function (e) {
      e.preventDefault();
      api('/api/admin/logout', { method: 'POST', noRedirect: true }).then(function () { location.href = 'login.html'; });
    });
    nav.appendChild(out);
  }

  window.adminReady = api('/api/admin/status', { noRedirect: true }).then(function (s) {
    if (!s.loggedIn) { location.href = 'login.html'; return new Promise(function () {}); }
    drawNav(s.username);
    return s;
  }).catch(function () { location.href = 'login.html'; return new Promise(function () {}); });
})();
