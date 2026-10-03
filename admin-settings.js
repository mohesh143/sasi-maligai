(function () {
  var form = document.getElementById('settingsForm');
  var keys = ['shop_name', 'tagline', 'phone', 'whatsapp', 'email', 'address', 'opening_hours', 'maps_url', 'intro', 'about', 'why_us'];
  adminReady.then(function () { return api('/api/admin/settings'); }).then(function (s) {
    keys.forEach(function (k) { document.getElementById(k).value = s[k] || ''; });
  }).catch(function (e) { showAlert('setAlert', 'error', e.message); });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var body = {};
    keys.forEach(function (k) { body[k] = document.getElementById(k).value; });
    var btn = document.getElementById('saveSettings'); btn.disabled = true;
    api('/api/admin/settings', { method: 'PUT', json: body }).then(function (s) {
      keys.forEach(function (k) { document.getElementById(k).value = s[k] || ''; });
      showAlert('setAlert', 'success', 'Saved. Open the website and refresh the page to see the change.');
      window.scrollTo(0, 0);
    }).catch(function (err) { showAlert('setAlert', 'error', err.message); window.scrollTo(0, 0); })
      .then(function () { btn.disabled = false; });
  });
})();
