(function () {
  var tbody = document.getElementById('backupRows');
  var dlg = document.getElementById('restoreDialog');
  var pending = null;
  var KIND = { backup: 'Manual backup', auto: 'Automatic (daily)', 'before-restore': 'Safety copy (before a restore)',
    'before-update': 'Safety copy (before an update)', safety: 'Safety copy', other: 'Other file' };

  function load() {
    return api('/api/admin/backups').then(function (list) {
      tbody.textContent = '';
      if (!list.length) { tbody.appendChild(el('tr', {}, [el('td', { colspan: '5', class: 'muted nolabel', text: 'No backups yet. Press "Create backup now".' })])); return; }
      list.forEach(function (b) {
        var dl = el('a', { class: 'btn btn-outline btn-small', href: '/api/admin/backups/download?file=' + encodeURIComponent(b.filename), text: 'Download' });
        var rs = el('button', { type: 'button', class: 'btn btn-small', text: 'Restore' });
        rs.addEventListener('click', function () { askRestore(b.filename); });
        tbody.appendChild(el('tr', {}, [
          el('td', { 'data-label': 'File', text: b.filename }),
          el('td', { 'data-label': 'Type' }, [el('span', { class: 'badge badge-kind', text: KIND[b.kind] || b.kind })]),
          el('td', { 'data-label': 'Size', text: b.sizeKB + ' KB' }),
          el('td', { 'data-label': 'Made on', text: fmtDate(b.createdAt) }),
          el('td', { class: 'actions' }, [el('div', { class: 'btn-row' }, [dl, rs])])
        ]));
      });
    }).catch(function (e) { showAlert('backupAlert', 'error', e.message); });
  }

  document.getElementById('createBtn').addEventListener('click', function () {
    var btn = this; btn.disabled = true;
    api('/api/admin/backups', { method: 'POST' }).then(function (r) {
      showAlert('backupAlert', 'success', 'Backup created: ' + r.filename + '. It is in the "backups" folder of the project.'); return load();
    }).catch(function (e) { showAlert('backupAlert', 'error', e.message); }).then(function () { btn.disabled = false; });
  });

  function askRestore(name) {
    pending = name;
    showAlert('restoreAlert', 'error', '');
    var body = document.getElementById('restoreBody'); body.textContent = 'Checking the backup file...';
    document.getElementById('restoreYes').hidden = true;
    document.getElementById('restoreCancel').textContent = 'Cancel';
    dlg.showModal();
    api('/api/admin/backups/info?file=' + encodeURIComponent(name)).then(function (info) {
      body.textContent = '';
      body.appendChild(el('p', {}, ['Backup file: ', el('strong', { text: name })]));
      if (!info.ok) { showAlert('restoreAlert', 'error', info.reason + ' It cannot be restored. Your current data is safe.'); return; }
      body.appendChild(el('p', { text: 'This backup contains ' + info.counts.products + ' products and ' + info.counts.feedback + ' feedback messages.' }));
      body.appendChild(el('p', { text: 'Right now the shop has ' + info.current.products + ' products and ' + info.current.feedback + ' feedback messages.' }));
      body.appendChild(el('p', { class: 'alert alert-info', text: 'What will happen: (1) a safety copy of your CURRENT data is saved automatically, (2) the data is replaced by this backup, (3) you are logged out and log in again. No restart is needed.' }));
      document.getElementById('restoreYes').hidden = false;
    }).catch(function (e) { body.textContent = ''; showAlert('restoreAlert', 'error', e.message); });
  }

  document.getElementById('restoreCancel').addEventListener('click', function () { dlg.close(); if (done) location.href = 'login.html'; });
  var done = false;
  document.getElementById('restoreYes').addEventListener('click', function () {
    var yes = this; yes.disabled = true;
    api('/api/admin/backups/restore', { method: 'POST', json: { filename: pending, confirm: true }, noRedirect: true }).then(function (r) {
      done = true;
      var body = document.getElementById('restoreBody'); body.textContent = '';
      showAlert('restoreAlert', 'success', r.message);
      yes.hidden = true;
      document.getElementById('restoreCancel').textContent = 'Go to login page';
    }).catch(function (e) { showAlert('restoreAlert', 'error', e.message); }).then(function () { yes.disabled = false; });
  });

  adminReady.then(load);
})();
