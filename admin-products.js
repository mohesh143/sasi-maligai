// Admin: add / edit / delete products, quick availability switch, picture upload.
(function () {
  var tbody = document.getElementById('productRows');
  var dlg = document.getElementById('productDialog');
  var form = document.getElementById('productForm');
  var catSelect = document.getElementById('pCategory');
  var filter = document.getElementById('adminSearch');
  var products = [];

  function money(n) { return '\u20B9' + Number(n).toFixed(2).replace(/\.00$/, ''); }

  // Shrinks big phone/camera photos in the browser (keeps the website fast and under 2 MB).
  function shrink(file) {
    if (!/^image\/(jpeg|png|webp)$/.test(file.type) || !window.createImageBitmap) return Promise.resolve(file);
    return createImageBitmap(file).then(function (bmp) {
      var max = 900, scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
      if (scale === 1 && file.size < 250 * 1024) return file;
      var c = document.createElement('canvas');
      c.width = Math.round(bmp.width * scale); c.height = Math.round(bmp.height * scale);
      var g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(bmp, 0, 0, c.width, c.height);
      return new Promise(function (resolve) {
        c.toBlob(function (blob) { resolve(blob && blob.size < file.size ? new File([blob], 'photo.jpg', { type: 'image/jpeg' }) : file); }, 'image/jpeg', 0.82);
      });
    }).catch(function () { return file; });
  }

  function loadCategories() {
    return api('/api/admin/categories').then(function (cats) {
      catSelect.textContent = '';
      cats.forEach(function (c) { catSelect.appendChild(el('option', { value: c.name, text: c.name })); });
    });
  }

  function load() {
    return api('/api/admin/products').then(function (list) { products = list; draw(); })
      .catch(function (e) { showAlert('productAlert', 'error', e.message); });
  }

  function draw() {
    var q = filter.value.trim().toLowerCase();
    var rows = products.filter(function (p) { return !q || p.name.toLowerCase().indexOf(q) !== -1 || p.category.toLowerCase().indexOf(q) !== -1; });
    tbody.textContent = '';
    document.getElementById('demoBtn').hidden = !products.some(function (p) { return p.isDemo; });
    if (!rows.length) {
      var td = el('td', { colspan: '6', class: 'muted nolabel', text: products.length ? 'No product matches your search.' : 'No products yet. Press "Add product".' });
      tbody.appendChild(el('tr', {}, [td])); return;
    }
    rows.forEach(function (p) {
      var thumb = p.image ? el('img', { class: 'thumb', src: p.image, alt: '', loading: 'lazy' }) : el('span', { class: 'muted small', text: 'none' });
      var toggle = el('button', { type: 'button', class: 'btn btn-small ' + (p.available ? 'btn-outline' : 'btn-danger'), text: p.available ? 'Available' : 'Out of stock', title: 'Click to change' });
      toggle.addEventListener('click', function () {
        api('/api/admin/products/' + p.id + '/availability', { method: 'PATCH', json: { available: !p.available } }).then(load)
          .catch(function (e) { showAlert('productAlert', 'error', e.message); });
      });
      var edit = el('button', { type: 'button', class: 'btn btn-outline btn-small', text: 'Edit' });
      edit.addEventListener('click', function () { openDialog(p); });
      var del = el('button', { type: 'button', class: 'btn btn-danger btn-small', text: 'Delete' });
      del.addEventListener('click', function () {
        if (!confirm('Delete "' + p.name + '"?\n\nThis cannot be undone (except by restoring a backup).')) return;
        api('/api/admin/products/' + p.id, { method: 'DELETE' }).then(function () { showAlert('productAlert', 'success', 'Deleted "' + p.name + '".'); return load(); })
          .catch(function (e) { showAlert('productAlert', 'error', e.message); });
      });
      var tr = el('tr', {}, [
        el('td', { 'data-label': 'Picture' }, [thumb]),
        el('td', { 'data-label': 'Name' }, [p.name + (p.isDemo ? ' (demo)' : '')]),
        el('td', { 'data-label': 'Category', text: p.category }),
        el('td', { 'data-label': 'Price', text: money(p.price) + ' / ' + p.unit }),
        el('td', { 'data-label': 'Stock' }, [toggle]),
        el('td', { class: 'actions' }, [el('div', { class: 'btn-row' }, [edit, del])])
      ]);
      tbody.appendChild(tr);
    });
  }

  function openDialog(p) {
    form.reset(); showAlert('dialogAlert', 'error', '');
    document.getElementById('dialogTitle').textContent = p ? 'Edit product' : 'Add product';
    document.getElementById('pId').value = p ? p.id : '';
    document.getElementById('pAvailable').checked = p ? p.available : true;
    var cur = document.getElementById('currentImage');
    cur.hidden = !(p && p.image);
    document.getElementById('currentThumb').src = p && p.image ? p.image : '';
    document.getElementById('pRemoveImage').checked = false;
    if (p) {
      document.getElementById('pName').value = p.name; catSelect.value = p.category;
      document.getElementById('pPrice').value = p.price; document.getElementById('pUnit').value = p.unit;
      document.getElementById('pDescription').value = p.description || '';
    }
    dlg.showModal();
    document.getElementById('pName').focus();
  }

  document.getElementById('addBtn').addEventListener('click', function () { openDialog(null); });
  document.getElementById('cancelBtn').addEventListener('click', function () { dlg.close(); });
  filter.addEventListener('input', draw);

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var id = document.getElementById('pId').value;
    var saveBtn = document.getElementById('saveBtn'); saveBtn.disabled = true;
    var fd = new FormData();
    fd.append('name', document.getElementById('pName').value);
    fd.append('category', catSelect.value);
    fd.append('price', document.getElementById('pPrice').value);
    fd.append('unit', document.getElementById('pUnit').value);
    fd.append('description', document.getElementById('pDescription').value);
    fd.append('available', document.getElementById('pAvailable').checked ? 'true' : 'false');
    if (document.getElementById('pRemoveImage').checked) fd.append('remove_image', '1');
    var file = document.getElementById('pImage').files[0];
    (file ? shrink(file) : Promise.resolve(null)).then(function (f) {
      if (f) fd.append('image', f, f.name || 'photo.jpg');
      return api(id ? '/api/admin/products/' + id : '/api/admin/products', { method: id ? 'PUT' : 'POST', form: fd });
    }).then(function (saved) {
      dlg.close(); showAlert('productAlert', 'success', 'Saved "' + saved.name + '".'); return load();
    }).catch(function (err) { showAlert('dialogAlert', 'error', err.message); })
      .then(function () { saveBtn.disabled = false; });
  });

  document.getElementById('demoBtn').addEventListener('click', function () {
    if (!confirm('Remove ONLY the demo products (marked "demo")?\n\nYour own products are not touched. A safety backup is made first.')) return;
    api('/api/admin/products/remove-demo', { method: 'POST', json: { confirm: true } }).then(function (r) {
      showAlert('productAlert', 'success', 'Removed ' + r.removed + ' demo products. Safety backup: ' + r.safetyBackup); return load();
    }).catch(function (e) { showAlert('productAlert', 'error', e.message); });
  });

  adminReady.then(loadCategories).then(load).catch(function (e) { showAlert('productAlert', 'error', e.message); });
})();
