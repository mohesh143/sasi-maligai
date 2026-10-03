adminReady.then(function (s) {
  document.getElementById('adminUsername').textContent = s.username;
  return api('/api/admin/stats');
}).then(function (d) {
  var set = function (id, v) { document.getElementById(id).textContent = v; };
  set('statTotal', d.totalProducts); set('statAvailable', d.availableProducts);
  set('statUnavailable', d.unavailableProducts); set('statCategories', d.categoryCount);
  set('statFeedback', d.feedbackCount); set('statRating', d.averageRating === null ? '-' : d.averageRating + ' / 5');

  var todo = [];
  if (d.missingShopDetails.length) todo.push(['Add your phone, address and opening hours', 'settings.html', 'Shop settings']);
  if (d.demoProducts > 0) todo.push(['Remove the ' + d.demoProducts + ' demo products once you add real ones', 'products.html', 'Products']);
  var days = d.lastManualBackup ? Math.floor((Date.now() - new Date(d.lastManualBackup)) / 86400000) : null;
  if (days === null) todo.push(['You have not made a backup yet. Make one now and copy it to a USB drive', 'backup.html', 'Backup']);
  else if (days >= 7) todo.push(['Your last manual backup was ' + days + ' days ago', 'backup.html', 'Backup']);
  var list = document.getElementById('todoList');
  document.getElementById('todoBox').hidden = todo.length === 0;
  todo.forEach(function (t) {
    list.appendChild(el('li', {}, [t[0] + ' - ', el('a', { href: t[1], text: t[2] })]));
  });
}).catch(function (e) { showAlert('dashAlert', 'error', e.message); });
