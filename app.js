// Sample app for classifieds - static frontend
const sampleProducts = [
  // 20 sample electronics products (no images)
  {name:'iPhone 11', description:'Used iPhone 11, battery good', price:250, category:'Phones'},
  {name:'Samsung Galaxy S10', description:'Good condition, 128GB', price:180, category:'Phones'},
  {name:'OnePlus 8', description:'Well maintained', price:220, category:'Phones'},
  {name:'MacBook Air 2017', description:'Lightly used, 8GB RAM', price:450, category:'Laptops'},
  {name:'Dell Inspiron 15', description:'i5, 8GB, 1TB', price:300, category:'Laptops'},
  {name:'HP Pavilion', description:'Gaming capable', price:520, category:'Laptops'},
  {name:'Sony WH-1000XM3', description:'Noise cancelling headphones', price:120, category:'Headphones'},
  {name:'Bose QC35', description:'Comfortable, good sound', price:140, category:'Headphones'},
  {name:'AirPods Pro', description:'Good battery life', price:110, category:'Headphones'},
  {name:'USB-C Charger 65W', description:'Fast charger, works fine', price:25, category:'Chargers'},
  {name:'Anker 45W', description:'Portable charger', price:30, category:'Chargers'},
  {name:'MagSafe Charger', description:'Compatible Apple charger', price:35, category:'Chargers'},
  {name:'Pixel 4a', description:'Compact and snappy', price:150, category:'Phones'},
  {name:'Lenovo ThinkPad T470', description:'Business laptop, sturdy', price:280, category:'Laptops'},
  {name:'Razer Kraken', description:'Gaming headset', price:60, category:'Headphones'},
  {name:'Samsung Charger 25W', description:'Fast charge', price:20, category:'Chargers'},
  {name:'Moto G Power', description:'Great battery life', price:90, category:'Phones'},
  {name:'Asus ZenBook', description:'Lightweight ultrabook', price:420, category:'Laptops'},
  {name:'Sennheiser HD 599', description:'Open-back audiophile', price:95, category:'Headphones'},
  {name:'Generic Lightning Cable', description:'Reliable cable', price:8, category:'Chargers'}
];

// Persistence key
const STORAGE_KEY = 'usedmarket_products_v1';
let products = [];

function loadProducts(){
  const raw = localStorage.getItem(STORAGE_KEY);
  if(raw){
    try{ products = JSON.parse(raw); return; } catch(e){ products = [] }
  }
  // seed with sample products if none
  products = sampleProducts.map((p,i)=>({id:Date.now()+i, ...p, sold:false, created:Date.now()+i}));
  saveProducts();
}

function saveProducts(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(products)); }

// UI helpers
const productList = document.getElementById('productList');
function renderProducts(){
  productList.innerHTML='';
  const q = document.getElementById('search').value.toLowerCase();
  const cat = document.getElementById('categoryFilter').value;
  const sort = document.getElementById('sort').value;
  let list = products.filter(p=> (p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)) && (cat? p.category===cat : true) );
  if(sort==='priceAsc') list.sort((a,b)=>a.price-b.price);
  else if(sort==='priceDesc') list.sort((a,b)=>b.price-a.price);
  else list.sort((a,b)=>b.created - a.created);

  list.forEach(p=>{
    const div = document.createElement('div'); div.className='card';
    div.innerHTML = `
      <h4>${escapeHtml(p.name)}</h4>
      <div class="meta">${escapeHtml(p.description)}</div>
      <div class="price">Price: ₹${Number(p.price).toLocaleString()}</div>
      <div>Condition: Good</div>
      ${p.sold? '<div class="sold">SOLD</div>' : ''}
      <div style="margin-top:10px"><button class="btn buyBtn" data-id="${p.id}" ${p.sold? 'disabled':''}>Buy</button></div>
    `;
    productList.appendChild(div);
  });
  // attach handlers
  document.querySelectorAll('.buyBtn').forEach(b=> b.addEventListener('click', onBuy));
}

function onBuy(ev){
  const id = Number(ev.currentTarget.dataset.id);
  const p = products.find(x=>x.id===id);
  if(!p || p.sold) return;
  // confirm popup
  showPopup(`Confirm purchase of "${p.name}" for ₹${p.price}?`, ()=>{
    p.sold = true;
    saveProducts();
    renderProducts();
    showPopup('Product bought!');
  });
}

// simple popup with callback on OK
function showPopup(message, onOk){
  const pop = document.getElementById('popup');
  document.getElementById('popupMsg').textContent = message;
  pop.setAttribute('aria-hidden','false');
  const ok = document.getElementById('popupOk');
  function cleanup(){
    pop.setAttribute('aria-hidden','true');
    ok.removeEventListener('click', onClick);
  }
  function onClick(){
    cleanup();
    if(typeof onOk==='function') onOk();
  }
  ok.addEventListener('click', onClick);
}

// small escape helper
function escapeHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// Sell modal
const sellModal = document.getElementById('sellModal');
function openSell(){ sellModal.setAttribute('aria-hidden','false'); }
function closeSell(){ sellModal.setAttribute('aria-hidden','true'); }

document.getElementById('sellNav').addEventListener('click', openSell);
document.getElementById('sellCancel').addEventListener('click', closeSell);

document.getElementById('sellForm').addEventListener('submit', function(e){
  e.preventDefault();
  const fd = new FormData(e.target);
  const newP = {
    id: Date.now(),
    name: fd.get('name')||'Untitled',
    description: fd.get('description')||'',
    price: Number(fd.get('price')||0),
    category: fd.get('category')||'Other',
    sold: false,
    created: Date.now()
  };
  products.unshift(newP);
  saveProducts();
  renderProducts();
  closeSell();
  showPopup('Product added!');
  e.target.reset();
});

// Buy nav: scroll to first available product
document.getElementById('buyNav').addEventListener('click', ()=>{
  window.scrollTo({top: document.querySelector('.container').offsetTop, behavior:'smooth'});
});

// filters
['search','categoryFilter','sort'].forEach(id=>document.getElementById(id).addEventListener('input', renderProducts));
document.getElementById('clearFilters').addEventListener('click', ()=>{
  document.getElementById('search').value='';
  document.getElementById('categoryFilter').value='';
  document.getElementById('sort').value='newest';
  renderProducts();
});

// init
loadProducts();
renderProducts();