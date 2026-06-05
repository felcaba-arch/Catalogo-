// ═══════════════════════════════════════════════════
// ⚙️ CONFIGURACIÓN — REEMPLAZÁ ESTE VALOR
// ═══════════════════════════════════════════════════
const SHEET_ID   = '1AkMT9NDzC2CnrF54vQFbLS4P6guOVnFRHl88SCg50dU';
const SHEET_NAME = 'Catalogo';
// ═══════════════════════════════════════════════════

const DEMO_DATA = [
  { PRODUCTO:'Samsung Galaxy A55 5G',    CATEGORIA:'Teléfonos',  PRECIO:'1350000', STOCK:'8',  IMAGEN:'https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-a55-5g-1.jpg' },
  { PRODUCTO:'Samsung Galaxy A35',       CATEGORIA:'Teléfonos',  PRECIO:'980000',  STOCK:'5',  IMAGEN:'https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-a35-1.jpg' },
  { PRODUCTO:'Motorola Moto G85',        CATEGORIA:'Teléfonos',  PRECIO:'890000',  STOCK:'3',  IMAGEN:'https://fdn2.gsmarena.com/vv/pics/motorola/motorola-moto-g85-1.jpg' },
  { PRODUCTO:'iPhone 15 128GB',          CATEGORIA:'Teléfonos',  PRECIO:'3200000', STOCK:'2',  IMAGEN:'https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-15-1.jpg' },
  { PRODUCTO:'Xiaomi Redmi Note 13',     CATEGORIA:'Teléfonos',  PRECIO:'750000',  STOCK:'12', IMAGEN:'https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-redmi-note-13-1.jpg' },
  { PRODUCTO:'Samsung Galaxy A15',       CATEGORIA:'Teléfonos',  PRECIO:'550000',  STOCK:'20', IMAGEN:'https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-a15-1.jpg' },
  { PRODUCTO:'Funda Samsung A55',        CATEGORIA:'Accesorios', PRECIO:'65000',   STOCK:'30', IMAGEN:'' },
  { PRODUCTO:'Cargador USB-C 25W',       CATEGORIA:'Accesorios', PRECIO:'120000',  STOCK:'15', IMAGEN:'' },
  { PRODUCTO:'Auricular Bluetooth TWS',  CATEGORIA:'Accesorios', PRECIO:'185000',  STOCK:'7',  IMAGEN:'' },
  { PRODUCTO:'Protector Samsung A55',    CATEGORIA:'Accesorios', PRECIO:'45000',   STOCK:'40', IMAGEN:'' },
  { PRODUCTO:'Cable USB-C 2m Trenzado',  CATEGORIA:'Accesorios', PRECIO:'55000',   STOCK:'25', IMAGEN:'' },
  { PRODUCTO:'Plan Control 20GB',        CATEGORIA:'Planes',     PRECIO:'120000',  STOCK:'99', IMAGEN:'' },
  { PRODUCTO:'Plan Control 40GB',        CATEGORIA:'Planes',     PRECIO:'160000',  STOCK:'99', IMAGEN:'' },
  { PRODUCTO:'Plan Pospago Básico',      CATEGORIA:'Planes',     PRECIO:'200000',  STOCK:'99', IMAGEN:'' },
  { PRODUCTO:'Plan Pospago Plus',        CATEGORIA:'Planes',     PRECIO:'280000',  STOCK:'99', IMAGEN:'' },
];

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
      .filter(p => parseInt(p.STOCK) > 0);

    if (rows.length > 0) {
      allProducts = rows;
      setUpdateTime(new Date().toLocaleTimeString('es-PY', { hour:'2-digit', minute:'2-digit' }));
    } else {
      throw new Error('sin datos');
    }
  } catch(e) {
    // Fallback a demo si Sheets no está configurado o hay error
    allProducts = DEMO_DATA.filter(p => parseInt(p.STOCK) > 0);
    setUpdateTime('DEMO — actualizá el Sheets');
  }
  renderAll();
}

function setUpdateTime(t) {
  document.getElementById('update-time').textContent = 'Actualizado: ' + t;
}

function renderAll() {
  let filtered = allProducts;
  if (activeFilter !== 'todos') {
    filtered = filtered.filter(p => (p.CATEGORIA||'').toLowerCase().includes(activeFilter.toLowerCase()));
  }
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(p =>
      (p.PRODUCTO||'').toLowerCase().includes(q) ||
      (p.CATEGORIA||'').toLowerCase().includes(q)
    );
  }

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
      const precioFmt  = precio.toLocaleString('es-PY');
      const delay      = ci*100 + idx*50;
      const imgHtml    = p.IMAGEN
        ? `<img class="card-img" src="${p.IMAGEN}" alt="${p.PRODUCTO}" loading="lazy" onerror="this.parentElement.innerHTML=fallbackImg('${cat}')">`
        : fallbackImg(cat);
      html += `
        <div class="card" style="animation-delay:${delay}ms">
          ${imgHtml}
          <div class="card-body">
            <div class="card-cat">${cat}</div>
            <div class="card-name">${p.PRODUCTO}</div>
            <div class="card-footer">
              <div class="card-price"><small>Gs.</small>${precioFmt}</div>
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

// Auto-refresh cada 5 minutos
loadData();
setInterval(loadData, 5 * 60 * 1000);
