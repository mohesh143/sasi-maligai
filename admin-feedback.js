(function () {
  var tbody = document.getElementById('fbRows');
  function load() {
    return api('/api/admin/feedback').then(function (items) {
      tbody.textContent = '';
      if (!items.length) { tbody.appendChild(el('tr', {}, [el('td', { colspan: '5', class: 'muted nolabel', text: 'No feedback yet.' })])); return; }
      items.forEach(function (f) {
        var del = el('button', { type: 'button', class: 'btn btn-danger btn-small', text: 'Delete' });
        del.addEventListener('click', function () {
          if (!confirm('Delete this feedback?')) return;
          api('/api/admin/feedback/' + f.id, { method: 'DELETE' }).then(load).catch(function (e) { showAlert('fbAlert', 'error', e.message); });
        });
        tbody.appendChild(el('tr', {}, [
          el('td', { 'data-label': 'Name', text: f.name }),
          el('td', { 'data-label': 'Rating', text: '\u2605'.repeat(f.rating) + '\u2606'.repeat(5 - f.rating) }),
          el('td', { 'data-label': 'Message', text: f.message }),
          el('td', { 'data-label': 'Date', text: fmtDate(f.created_at) }),
          el('td', { class: 'actions' }, [del])
        ]));
      });
    }).catch(function (e) { showAlert('fbAlert', 'error', e.message); });
  }
  adminReady.then(load);
})();
