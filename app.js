const API_URL = "/api/products";

// ===== Helpers =====
function $(id) { return document.getElementById(id); }
function norm(s){ return (s || "").trim().toUpperCase(); }

function openWhatsApp(){
  const phone = "213000000000"; // اكتب رقمك بدون +
  const text = encodeURIComponent("Bonjour, je voudrais un devis (dimensions + type de bois).");
  window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
}

// ===== Footer year =====
const yearEl = $("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Buttons if exist
["btnWhatsApp","btnWhatsApp2","btnWhatsApp3","btnWhatsApp4","btnQuote"].forEach(id=>{
  const el = $(id);
  if(el) el.addEventListener("click", openWhatsApp);
});

// ===== Modal (Gallery) =====
let currentGallery = [];
let currentIndex = 0;

function ensureModal(){
  if ($("modalOverlay")) return;

  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.id = "modalOverlay";

  overlay.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true">
      <div class="modal-left">
        <div class="modal-image" id="modalImage"></div>
      </div>

      <div class="modal-right">
        <div class="modal-actions">
          <button class="modal-close" id="modalClose">Fermer ✕</button>
          <div class="modal-nav">
            <button class="modal-btn" id="modalPrev">◀</button>
            <button class="modal-btn" id="modalNext">▶</button>
          </div>
        </div>

        <h3 class="modal-title" id="modalTitle"></h3>
        <p class="modal-desc" id="modalDesc"></p>

        <div class="modal-thumbs" id="modalThumbs"></div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  $("modalClose").addEventListener("click", closeModal);
  $("modalPrev").addEventListener("click", ()=>showAt(currentIndex - 1));
  $("modalNext").addEventListener("click", ()=>showAt(currentIndex + 1));

  overlay.addEventListener("click", (e)=>{
    if(e.target === overlay) closeModal();
  });

  document.addEventListener("keydown", (e)=>{
    if(overlay.style.display !== "flex") return;
    if(e.key === "Escape") closeModal();
    if(e.key === "ArrowLeft") showAt(currentIndex - 1);
    if(e.key === "ArrowRight") showAt(currentIndex + 1);
  });
}

function openModal(product){
  ensureModal();

  const overlay = $("modalOverlay");
  const modalTitle = $("modalTitle");
  const modalDesc = $("modalDesc");

  modalTitle.textContent = product.name || "";
  modalDesc.textContent  = product.description || "";

  // ✅ gallery from backend
  const cover = product.coverImage || "images/bois-blanc.jpg";
  const gallery = Array.isArray(product.gallery) && product.gallery.length ? product.gallery : [cover];

  currentGallery = gallery;
  currentIndex = 0;

  renderThumbs();
  showAt(0);

  overlay.style.display = "flex";
}

function closeModal(){
  const overlay = $("modalOverlay");
  if(overlay) overlay.style.display = "none";
}

function renderThumbs(){
  const thumbs = $("modalThumbs");
  thumbs.innerHTML = "";

  currentGallery.forEach((src, i)=>{
    const img = document.createElement("img");
    img.src = src;
    img.className = "modal-thumb" + (i === currentIndex ? " active" : "");
    img.addEventListener("click", ()=>showAt(i));
    thumbs.appendChild(img);
  });
}

function showAt(i){
  if(!currentGallery.length) return;

  if(i < 0) i = currentGallery.length - 1;
  if(i >= currentGallery.length) i = 0;
  currentIndex = i;

  const modalImage = $("modalImage");
  modalImage.style.backgroundImage = `url("${currentGallery[currentIndex]}")`;

  document.querySelectorAll(".modal-thumb").forEach((t, idx)=>{
    t.classList.toggle("active", idx === currentIndex);
  });
}

// ===== Catalogue rendering =====
const catalog = $("catalogList");
const searchInput = $("search");
const statCount = $("statCount");

function createCard(product){
  const card = document.createElement("div");
  card.className = "product-card";

  const cover = product.coverImage || "images/bois-blanc.jpg";

  card.innerHTML = `
    <div class="product-img" style="background-image:url('${cover}')"></div>
    <div class="product-body">
      <div class="product-name">${product.name || ""}</div>
      <div class="product-desc">${product.description || ""}</div>
      <div class="product-chip">Vitrine</div>
    </div>
  `;

  card.addEventListener("click", ()=>openModal(product));
  return card;
}

function renderProducts(list){
  catalog.innerHTML = "";
  list.forEach(p => catalog.appendChild(createCard(p)));
  if(statCount) statCount.textContent = `${list.length}+`;
}

function enableSearch(all){
  if(!searchInput) return;
  searchInput.addEventListener("input", ()=>{
    const q = norm(searchInput.value);
    const filtered = all.filter(p => norm(p.name).includes(q));
    renderProducts(filtered);
  });
}

// ===== Init =====
async function init(){
  try{
    const res = await fetch(API_URL);
    const products = await res.json();

    renderProducts(products);
    enableSearch(products);

  }catch(err){
    console.error(err);
    catalog.innerHTML = `
      <div style="padding:16px;color:#b00;font-weight:900">
        Error: API not reachable. Ensure backend is running on http://localhost:3000
      </div>
    `;
  }
}

init();
