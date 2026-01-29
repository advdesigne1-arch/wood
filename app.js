/* ===============================
   BOUALEM BOIS - FRONTEND APP
   Compatible with GitHub Pages
   =============================== */

const productsContainer = document.getElementById("products");
const searchInput = document.getElementById("searchInput");

let products = [];
let currentIndex = 0;
const ITEMS_PER_PAGE = 3;

/* ===============================
   Load products from JSON
   =============================== */
fetch("products.json")
  .then(res => {
    if (!res.ok) throw new Error("Products file not found");
    return res.json();
  })
  .then(data => {
    products = data;
    renderProducts();
  })
  .catch(err => {
    productsContainer.innerHTML = `
      <p style="color:red;font-weight:600">
        ⚠️ Impossible de charger les produits
      </p>`;
    console.error(err);
  });

/* ===============================
   Render products (cards)
   =============================== */
function renderProducts(filtered = null) {
  const list = filtered || products;
  productsContainer.innerHTML = "";

  const visible = list.slice(
    currentIndex,
    currentIndex + ITEMS_PER_PAGE
  );

  visible.forEach(p => {
    const card = document.createElement("div");
    card.className = "product-card";

    card.innerHTML = `
      <img src="${p.image}" alt="${p.name}" loading="lazy"/>
      <h3>${p.name}</h3>
      <p>${p.description}</p>

      <div class="card-actions">
        <button onclick="openModal('${p.name}','${p.description}','${p.image}')">
          Voir
        </button>
        <span class="badge">Vitrine</span>
      </div>
    `;

    productsContainer.appendChild(card);
  });
}

/* ===============================
   Pagination
   =============================== */
function nextProducts() {
  if (currentIndex + ITEMS_PER_PAGE < products.length) {
    currentIndex += ITEMS_PER_PAGE;
    renderProducts();
  }
}

function prevProducts() {
  if (currentIndex > 0) {
    currentIndex -= ITEMS_PER_PAGE;
    renderProducts();
  }
}

/* ===============================
   Search
   =============================== */
searchInput?.addEventListener("input", e => {
  const value = e.target.value.toLowerCase();
  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(value)
  );
  currentIndex = 0;
  renderProducts(filtered);
});

/* ===============================
   Modal
   =============================== */
function openModal(name, desc, img) {
  const modal = document.getElementById("modal");
  modal.classList.add("show");

  modal.querySelector(".modalBody").innerHTML = `
    <img src="${img}" alt="${name}">
    <h2>${name}</h2>
    <p>${desc}</p>
  `;
}

function closeModal() {
  document.getElementById("modal").classList.remove("show");
}
