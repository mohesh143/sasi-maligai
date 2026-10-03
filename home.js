// Home page: category tiles and a few products.
siteReady.then(function () {
  fetch('/api/categories').then(function (r) { return r.json(); }).then(function (cats) {
    var box = document.getElementById('categoryGrid');
    if (!cats.length) { document.getElementById('categorySection').hidden = true; return; }
    cats.forEach(function (c) {
      var a = el('a', { class: 'cat-tile', href: 'products.html?category=' + encodeURIComponent(c.name) }, [
        el('strong', { text: c.name }), el('span', { class: 'muted small', text: c.total + (c.total === 1 ? ' item' : ' items') })
      ]);
      box.appendChild(a);
    });
  }).catch(function () { document.getElementById('categorySection').hidden = true; });

  fetch('/api/products?available=true').then(function (r) { return r.json(); }).then(function (list) {
    var grid = document.getElementById('featuredGrid');
    var show = list.slice(0, 8);
    if (!show.length) { document.getElementById('featuredSection').hidden = true; return; }
    show.forEach(function (p) { grid.appendChild(window.productCard(p)); });
  }).catch(function () { document.getElementById('featuredSection').hidden = true; });
});
