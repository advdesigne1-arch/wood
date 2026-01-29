/* ===============================================
   BOUALEM BOIS – Frontend App
   GitHub Pages Compatible (Vanilla JS)
   =============================================== */

const cardsGrid = document.getElementById("cardsGrid");
const searchInput = document.getElementById("searchInput");
const catalogError = document.getElementById("catalogError");

const modal = document.getElementById("modal");
const modalBackdrop = document.getElementById("modalBackdrop");
const modalClose = document.getElementById("modalClose");
const modalTitle = document.getElementById("modalTitle");
const modalDesc = document.getElementById("modalDesc");
const modalMainImg = document.getElementById("modalMainImg");
const modalThumbs = document.getElementById("modalThumbs");

let PRODUCTS = [];
let currentProductId = null;
let currentImageIndex = 0;

/* ========== LOAD PRODUCTS FROM API OR JSON ========== */
async function loadProducts() {
  try {
    // Try to load from API first (backend)
    let response = await fetch("/api/products").catch(() => null);
    
    // Fallback to products.json if API fails
    if (!response || !response.ok) {
      console.log("API not available, using products.json...");
      response = await fetch("products.json");
    }
    
    if (!response || !response.ok) {
      throw new Error(`HTTP error! status: ${response?.status}`);
    }
    
    PRODUCTS = await response.json();
    renderProducts(PRODUCTS);
    catalogError.classList.remove("show");
  } catch (error) {
    console.error("Error loading products:", error);
    catalogError.classList.add("show");
    catalogError.textContent = "❌ Impossible de charger les produits. Vérifiez products.json ou backend.";
  }
}

/* ========== RENDER CARDS ========== */
function renderProducts(list) {
  cardsGrid.innerHTML = "";

  if (list.length === 0) {
    cardsGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--muted); padding: 20px;">
      Aucun produit trouvé. Réessayez votre recherche.
    </p>`;
    return;
  }

  list.forEach((product) => {
    const mainImage = product.images && product.images.length > 0
      ? product.images[0]
      : "images/placeholder.jpg";

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <div class="cardMedia">
        <img src="${mainImage}" alt="${product.name}" class="cardImg" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22200%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22400%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-size=%2224%22 fill=%22%23999%22 text-anchor=%22middle%22 dy=%22.3em%22%3EImage non disponible%3C/text%3E%3C/svg%3E'" />
      </div>
      <div class="cardBody">
        <h3 class="cardTitle">${product.name}</h3>
        <p class="cardDesc">${product.description}</p>
        <div class="cardActions">
          <button class="pill" onclick="openModal('${product.id}')">Voir plus</button>
          <span class="tag">Vitrine</span>
        </div>
      </div>
    `;

    cardsGrid.appendChild(card);
  });
}

/* ========== MODAL FUNCTIONS ========== */
function openModal(productId) {
  const product = PRODUCTS.find((p) => p.id === productId);
  if (!product) return;

  currentProductId = productId;
  currentImageIndex = 0;

  // Header
  modalTitle.textContent = product.name;
  modalDesc.textContent = product.description;

  // Main image
  updateModalImage();

  // Thumbnails
  renderThumbnails(product);

  // Show modal
  modal.classList.add("open");
  document.body.classList.add("noScroll");
}

function updateModalImage() {
  const product = PRODUCTS.find((p) => p.id === currentProductId);
  if (!product || !product.images) return;

  const image = product.images[currentImageIndex] || product.images[0];
  modalMainImg.src = image;
  modalMainImg.alt = product.name;
}

function renderThumbnails(product) {
  modalThumbs.innerHTML = "";

  product.images.forEach((img, index) => {
    const thumb = document.createElement("button");
    thumb.className = "thumb";
    thumb.innerHTML = `<img src="${img}" alt="Thumbnail ${index + 1}" />`;
    thumb.onclick = () => {
      currentImageIndex = index;
      updateModalImage();
      document.querySelectorAll(".thumb").forEach((t) => t.style.opacity = "0.5");
      thumb.style.opacity = "1";
    };
    if (index === 0) thumb.style.opacity = "1";
    else thumb.style.opacity = "0.5";

    modalThumbs.appendChild(thumb);
  });
}

function closeModal() {
  modal.classList.remove("open");
  document.body.classList.remove("noScroll");
}

/* ========== MODAL EVENTS ========== */
modalClose.addEventListener("click", closeModal);
modalBackdrop.addEventListener("click", closeModal);

// Keyboard close (Escape)
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal.classList.contains("open")) {
    closeModal();
  }
});

// Swipe support for mobile
let touchStartX = 0;
let touchEndX = 0;

modalMainImg.addEventListener("touchstart", (e) => {
  touchStartX = e.changedTouches[0].screenX;
});

modalMainImg.addEventListener("touchend", (e) => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
});

function handleSwipe() {
  const product = PRODUCTS.find((p) => p.id === currentProductId);
  if (!product) return;

  const threshold = 50;
  const diff = touchStartX - touchEndX;

  if (Math.abs(diff) > threshold) {
    if (diff > 0) {
      // Swipe left - next image
      currentImageIndex = (currentImageIndex + 1) % product.images.length;
    } else {
      // Swipe right - previous image
      currentImageIndex = (currentImageIndex - 1 + product.images.length) % product.images.length;
    }
    updateModalImage();
  }
}

/* ========== MAP INITIALIZATION ========== */
function initMap() {
  const mapElement = document.getElementById("map");
  
  // Return if map element doesn't exist (e.g., on mobile)
  if (!mapElement) {
    console.log("Map element not found");
    return;
  }

  // Create map centered on BOUALEM BOIS location (from Google Maps)
  // Plus Code: Q68Q+F6M | Keifan Tower (برج الكيفان) - Algiers, Algeria
  // https://maps.app.goo.gl/Q68Q+F6M
  const lat = 36.75384;
  const lng = 3.05878;
  const map = L.map("map").setView([lat, lng], 15);

  // Add OpenStreetMap tiles
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
    maxZoom: 19,
  }).addTo(map);

  // Add marker for BOUALEM BOIS
  const marker = L.marker([lat, lng], {
    title: "BOUALEM BOIS",
  }).addTo(map);

  marker.bindPopup(
    `<div style="font-weight: bold; padding: 8px; text-align: center;">
      <p style="margin: 0 0 8px; font-size: 14px; font-weight: 800;">BOUALEM BOIS</p>
      <p style="margin: 0 0 4px; font-size: 12px;">📍 Algérie</p>
      <p style="margin: 0 0 4px; font-size: 12px;">📞 <a href="tel:+213550966975" style="color: #0066cc; text-decoration: none;">+213 550 966 975</a></p>
      <p style="margin: 0 0 4px; font-size: 12px;">📱 <a href="https://wa.me/213550966975" style="color: #25D366; text-decoration: none;">WhatsApp</a></p>
      <p style="margin: 0; font-size: 12px;">🕘 09:00 — 18:00</p>
    </div>`
  ).openPopup();
}

/* ========== SEARCH ========== */
searchInput.addEventListener("input", (e) => {
  const query = e.target.value.toLowerCase();
  const filtered = PRODUCTS.filter((p) =>
    p.name.toLowerCase().includes(query) ||
    p.description.toLowerCase().includes(query)
  );
  renderProducts(filtered);
});

/* ========== INIT ========== */
loadProducts();
initMap();
