adminReady.then(function (s) { document.getElementById('who').textContent = s.username; });
document.getElementById('pwForm').addEventListener('submit', function (e) {
  e.preventDefault();
  var cur = document.getElementById('curPw').value, n1 = document.getElementById('newPw').value, n2 = document.getElementById('newPw2').value;
  if (n1 !== n2) return showAlert('pwAlert', 'error', 'The two new passwords are not the same.');
  api('/api/admin/change-password', { method: 'POST', json: { currentPassword: cur, newPassword: n1 } })
    .then(function () { e.target.reset(); showAlert('pwAlert', 'success', 'Password changed.'); })
    .catch(function (err) { showAlert('pwAlert', 'error', err.message); });
});
