// ==========================================================
// common.js - used by every customer page.
//  * draws the menu bar and footer (edit them HERE, once)
//  * loads the shop details from the server
// ==========================================================
(function () {
  var PAGES = [['index.html', 'Home'], ['products.html', 'Products'], ['about.html', 'About'], ['contact.html', 'Contact']];

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

  window.loadConfig = function () {
    return fetch('/api/config').then(function (r) { return r.json(); }).catch(function () { return {}; });
  };

  function currentPage() {
    var p = location.pathname.split('/').pop();
    return p === '' ? 'index.html' : p;
  }

  function drawHeader(cfg) {
    var host = document.getElementById('site-header');
    if (!host) return;
    var nav = el('nav', { class: 'navbar', 'aria-label': 'Main menu' });
    nav.appendChild(el('a', { class: 'brand', href: 'index.html', text: cfg.shopName || 'Sasi Maligai' }));
    var btn = el('button', { class: 'hamburger', type: 'button', 'aria-label': 'Open menu', 'aria-expanded': 'false', text: '\u2630' });
    var ul = el('ul', { class: 'nav-links' });
    PAGES.forEach(function (p) {
      var a = el('a', { href: p[0], text: p[1] });
      if (p[0] === currentPage()) { a.className = 'active'; a.setAttribute('aria-current', 'page'); }
      ul.appendChild(el('li', {}, [a]));
    });
    btn.addEventListener('click', function () {
      var open = ul.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.appendChild(btn); nav.appendChild(ul);
    host.className = 'site-header';
    host.textContent = '';
    host.appendChild(nav);
  }

  function drawFooter(cfg) {
    var host = document.getElementById('site-footer');
    if (!host) return;
    host.className = 'site-footer';
    host.textContent = '';
    var inner = el('div', { class: 'container' });
    inner.appendChild(el('p', { text: '\u00a9 ' + new Date().getFullYear() + ' ' + (cfg.shopName || 'Sasi Maligai') + (cfg.address ? ' \u2022 ' + cfg.address : '') }));
    host.appendChild(inner);
    if (cfg.whatsappUrl) {
      document.body.appendChild(el('a', { class: 'wa-float', href: cfg.whatsappUrl, target: '_blank', rel: 'noopener', 'aria-label': 'Chat on WhatsApp', text: 'WhatsApp' }));
    }
  }

  // Fill in any element marked data-config="shopName" etc. Hide blocks marked data-need="phone" when empty.
  function fill(cfg) {
    document.querySelectorAll('[data-config]').forEach(function (n) {
      var v = cfg[n.getAttribute('data-config')];
      if (v) n.textContent = v;
    });
    document.querySelectorAll('[data-href]').forEach(function (n) {
      var v = cfg[n.getAttribute('data-href')];
      if (v) n.setAttribute('href', v); else n.hidden = true;
    });
    document.querySelectorAll('[data-need]').forEach(function (n) {
      n.hidden = !cfg[n.getAttribute('data-need')];
    });
    if (cfg.shopName) {
      var t = document.title.split(' - ');
      document.title = t.length > 1 ? t[0] + ' - ' + cfg.shopName : cfg.shopName;
    }
  }

  window.siteReady = loadConfig().then(function (cfg) {
    drawHeader(cfg); drawFooter(cfg); fill(cfg);
    return cfg;
  });
})();
