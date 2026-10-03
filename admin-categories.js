(function () {
  var tbody = document.getElementById('catRows');
  function load() {
    return api('/api/admin/categories').then(function (cats) {
      tbody.textContent = '';
      cats.forEach(function (c) {
        var ren = el('button', { type: 'button', class: 'btn btn-outline btn-small', text: 'Rename' });
        ren.addEventListener('click', function () {
          var n = prompt('New name for "' + c.name + '":', c.name);
          if (n === null || !n.trim() || n.trim() === c.name) return;
          api('/api/admin/categories/' + c.id, { method: 'PUT', json: { name: n } })
            .then(function () { showAlert('catAlert', 'success', 'Renamed. Products in this category were updated too.'); return load(); })
            .catch(function (e) { showAlert('catAlert', 'error', e.message); });
        });
        var del = el('button', { type: 'button', class: 'btn btn-danger btn-small', text: 'Delete' });
        del.addEventListener('click', function () {
          if (!confirm('Delete the category "' + c.name + '"?')) return;
          api('/api/admin/categories/' + c.id, { method: 'DELETE' })
            .then(function () { showAlert('catAlert', 'success', 'Category deleted.'); return load(); })
            .catch(function (e) { showAlert('catAlert', 'error', e.message); });
        });
        tbody.appendChild(el('tr', {}, [
          el('td', { 'data-label': 'Category', text: c.name }),
          el('td', { 'data-label': 'Products', text: String(c.productCount) }),
          el('td', { class: 'actions' }, [el('div', { class: 'btn-row' }, [ren, del])])
        ]));
      });
    }).catch(function (e) { showAlert('catAlert', 'error', e.message); });
  }
  document.getElementById('catForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var input = document.getElementById('catName');
    api('/api/admin/categories', { method: 'POST', json: { name: input.value } })
      .then(function () { input.value = ''; showAlert('catAlert', 'success', 'Category added.'); return load(); })
      .catch(function (err) { showAlert('catAlert', 'error', err.message); });
  });
  adminReady.then(load);
})();
