// ═══════════════════════════════════════════════════
// ⚙️ CONFIGURACIÓN
// ═══════════════════════════════════════════════════
const SHEET_ID   = '1iXWwiryS3jshLAFA8iqN8GSOXbjOYntdAGmutJ9upOI';
const SHEET_NAME = 'Catalogo';
const CUOTAS     = 18;
// ═══════════════════════════════════════════════════

let allProducts = [];
let activeFilter = 'todos';
let searchQuery  = '';

async function loadData() {
  try {
    const url  = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(SHEET_NAME)}`;
    const res  = await fetch(url);
    const text = await res.text();
    const json = JSON.parse(text.substring(47).slice(0, -2));
    const cols = json.table.cols.map(c => c.label.toUpperCase().trim());

    const rows = json.table.rows
      .map(r => {
        const obj = {};
        cols.forEach((col, i) => { obj[col] = r.c[i]?.v ?? ''; });
        return obj;
      })
      .filter(p => parseInt(p.STOCK) > 0 && parseInt(p.PRECIO) > 0);

    if (rows.length > 0) {
      allProducts = rows;
      setUpdateTime(new Date().toLocaleTimeString('es-PY', { hour:'2-digit', minute:'2-digit' }));
    }
  } catch(e) {
    console.error('Error cargando datos:', e);
  }
  renderAll();
}

function setUpdateTime(t) {
  const el = document.getElementById('update-time');
  if (el) el.textContent = 'Actualizado: ' + t;
}

function renderAll() {
  let filtered = allProducts;

  if (activeFilter !== 'todos') {
    filtered = filtered.filter(p =>
      (p.CATEGORIA||'').toLowerCase().includes(activeFilter.toLowerCase())
    );
  }
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(p =>
      (p.PRODUCTO||'').toLowerCase().includes(q) ||
      (p.CATEGORIA||'').toLowerCase().includes(q)
    );
  }

  // Stats
  document.getElementById('stat-total').textContent  = allProducts.length;
  document.getElementById('stat-phones').textContent = allProducts.filter(p=>(p.CATEGORIA||'').toLowerCase().includes('tel')).length;
  document.getElementById('stat-acc').textContent    = allProducts.filter(p=>(p.CATEGORIA||'').toLowerCase().includes('acc')).length;
  document.getElementById('stat-planes').textContent = allProducts.filter(p=>(p.CATEGORIA||'').toLowerCase().includes('plan')).length;

  if (filtered.length === 0) {
    document.getElementById('main-content').innerHTML =
      `<div class="empty"><div class="empty-icon">📦</div><h3>Sin resultados</h3><p>No hay productos con ese filtro.</p></div>`;
    return;
  }

  const cats = [...new Set(filtered.map(p => p.CATEGORIA || 'Sin categoría'))];
  let html = '';

  cats.forEach((cat, ci) => {
    const items = filtered.filter(p => (p.CATEGORIA||'Sin categoría') === cat);
    html += `<div class="section-title">${cat} <span>${items.length}</span></div><div class="grid">`;

    items.forEach((p, idx) => {
      const stock      = parseInt(p.STOCK)||0;
      const stockClass = stock <= 3 ? 'stock-low' : 'stock-ok';
      const stockText  = stock <= 3 ? `¡Últimas ${stock}!` : 'Stock ✓';
      const precio     = parseInt((p.PRECIO||'0').toString().replace(/\D/g,''));
      const cuota      = p.CUOTA_18 ? parseInt((p.CUOTA_18).toString().replace(/\D/g,'')) : Math.round(precio / CUOTAS);
      const precioFmt  = precio.toLocaleString('es-PY');
      const cuotaFmt   = cuota.toLocaleString('es-PY');
      const delay      = ci * 80 + idx * 40;
      const imgHtml    = p.IMAGEN
        ? `<img class="card-img" src="${p.IMAGEN}" alt="${p.PRODUCTO}" loading="lazy" onerror="this.parentElement.innerHTML=fallbackImg('${cat}')">`
        : fallbackImg(cat);

      html += `
        <div class="card" style="animation-delay:${delay}ms">
          ${imgHtml}
          <div class="card-body">
            <div class="card-cat">${cat}</div>
            <div class="card-name">${p.PRODUCTO}</div>
            <div class="card-price-wrap">
              <div class="card-cuota">
                <span class="cuota-num">Gs. ${cuotaFmt}</span>
                <span class="cuota-label">× ${CUOTAS} cuotas</span>
              </div>
              <div class="card-total">Precio total: Gs. ${precioFmt}</div>
            </div>
            <div class="card-footer">
              <div class="stock-badge ${stockClass}">${stockText}</div>
            </div>
          </div>
        </div>`;
    });
    html += `</div>`;
  });

  document.getElementById('main-content').innerHTML = html;
}

function fallbackImg(cat) {
  const icons = {'Teléfonos':'📱','Accesorios':'🎧','Planes':'📶'};
  return `<div class="card-img-placeholder"><div class="icon">${icons[cat]||'📦'}</div><div>SIN IMAGEN</div></div>`;
}

function filterCat(cat, btn) {
  activeFilter = cat;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderAll();
}

function searchProducts(val) {
  searchQuery = val;
  renderAll();
}

loadData();
setInterval(loadData, 5 * 60 * 1000);
