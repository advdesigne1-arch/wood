/* =========================
   BOUALEM BOIS — Frontend
   Works on:
   - Localhost with backend: /api/products
   - GitHub Pages (no backend): ./products.json
========================= */

const $ = (q, el = document) => el.querySelector(q);
const $$ = (q, el = document) => Array.from(el.querySelectorAll(q));

const state = {
  products: [],
  filtered: [],
  activeIndex: 0
};

function isLocalhost() {
  return (
    location.hostname === "localhost" ||
    location.hostname === "127.0.0.1"
  );
}

// Try backend first on localhost, otherwise use static json
async function loadProducts() {
  const endpoints = [];

  if (isLocalhost()) {
    endpoints.push("/api/products"); // your express route
  }
  endpoints.push("./products.json"); // GitHub Pages fallback

  let lastErr = null;

  for (const url of endpoints) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`${url} -> ${res.status}`);
      const data = await res.json();

      // backend returns array? or json? normalize
      const products =
        Array.isArray(data) ? data :
        Array.isArray(data?.products) ? data.products :
        Array.isArray(data?.items) ? data.items :
        [];

      if (!products.length) throw new Error("No products found in response.");
      return products;
    } catch (e) {
      lastErr = e;
    }
  }

  throw lastErr || new Error("Failed to load products");
}

function normalizeProduct(p) {
  // Support old backend format {id,name,description} without images
  const slug = p.slug || (p.name || "").toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
  const cover = p.cover || p.image || `images/${slug}.jpg`;
  const gallery = Array.isArray(p.gallery) && p.gallery.length ? p.gallery : [cover];

  return {
    id: p.id,
    slug,
    name: p.name || "Produit",
    description: p.description || "",
    cover,
    gallery
  };
}

function setError(msg) {
  const box = $("#catalogError");
  box.textContent = msg || "";
  box.classList.toggle("show", !!msg);
}

function renderCards(list) {
  const track = $("#cardsTrack");
  track.innerHTML = "";

  list.forEach((p) => {
    const card = document.createElement("article");
    card.className = "card";
    card.tabIndex = 0;

    card.innerHTML = `
      <div class="cardMedia">
        <img class="cardImg" src="${p.cover}" alt="${escapeHtml(p.name)}" loading="lazy" />
      </div>
      <div class="cardBody">
        <h3 class="cardTitle">${escapeHtml(p.name)}</h3>
        <p class="cardDesc">${escapeHtml(p.description)}</p>
        <div class="cardActions">
          <button class="pill" type="button">Voir</button>
          <span class="tag">Vitrine</span>
        </div>
      </div>
    `;

    // If image path is wrong, show a clean placeholder instead of breaking layout
    const img = $(".cardImg", card);
    img.addEventListener("error", () => {
      img.src =
        "data:image/svg+xml;charset=utf-8," +
        encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450">
          <rect width="100%" height="100%" fill="#f2f2f2"/>
          <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
            fill="#8a8a8a" font-family="Arial" font-size="22">Image non disponible</text>
        </svg>`);
    });

    // open modal
    card.addEventListener("click", () => openModal(p));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openModal(p);
      }
    });

    track.appendChild(card);
  });

  // reset scroll to start
  track.scrollTo({ left: 0, behavior: "instant" });
}

function openModal(product) {
  $("#modalTitle").textContent = product.name;
  $("#modalDesc").textContent = product.description;

  const mainImg = $("#modalMainImg");
  const thumbs = $("#modalThumbs");
  thumbs.innerHTML = "";

  const setMain = (src) => {
    mainImg.src = src;
  };

  setMain(product.gallery[0]);

  product.gallery.forEach((src, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "thumb";
    b.innerHTML = `<img src="${src}" alt="${escapeHtml(product.name)} ${i + 1}" loading="lazy">`;
    b.addEventListener("click", () => setMain(src));
    thumbs.appendChild(b);

    // image fallback
    const timg = $("img", b);
    timg.addEventListener("error", () => {
      timg.src =
        "data:image/svg+xml;charset=utf-8," +
        encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240">
          <rect width="100%" height="100%" fill="#f2f2f2"/>
          <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
            fill="#8a8a8a" font-family="Arial" font-size="14">No image</text>
        </svg>`);
    });
  });

  $("#modal").classList.add("open");
  document.body.classList.add("noScroll");
}

function closeModal() {
  $("#modal").classList.remove("open");
  document.body.classList.remove("noScroll");
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function applySearch() {
  const q = ($("#searchInput").value || "").trim().toLowerCase();
  state.filtered = !q
    ? state.products
    : state.products.filter((p) =>
        (p.name + " " + p.description).toLowerCase().includes(q)
      );

  renderCards(state.filtered);
}

function scrollCards(dir = 1) {
  const track = $("#cardsTrack");
  const card = $(".card", track);
  const step = card ? card.getBoundingClientRect().width + 18 : 360;
  track.scrollBy({ left: step * dir, behavior: "smooth" });
}

function enableDragScroll() {
  const track = $("#cardsTrack");

  let isDown = false;
  let startX = 0;
  let scrollLeft = 0;

  track.addEventListener("pointerdown", (e) => {
    isDown = true;
    track.setPointerCapture(e.pointerId);
    startX = e.clientX;
    scrollLeft = track.scrollLeft;
    track.classList.add("dragging");
  });

  track.addEventListener("pointermove", (e) => {
    if (!isDown) return;
    const dx = e.clientX - startX;
    track.scrollLeft = scrollLeft - dx;
  });

  const end = () => {
    if (!isDown) return;
    isDown = false;
    track.classList.remove("dragging");
  };

  track.addEventListener("pointerup", end);
  track.addEventListener("pointercancel", end);
  track.addEventListener("mouseleave", end);
}

async function init() {
  try {
    setError("");
    const raw = await loadProducts();
    state.products = raw.map(normalizeProduct);
    state.filtered = state.products;
    renderCards(state.filtered);
  } catch (e) {
    // ✅ No red scary error on GitHub Pages — show friendly message
    setError("تعذر تحميل البيانات. تأكد أن ملف products.json موجود وأن الصور داخل مجلد images.");
    console.error(e);
  }

  $("#searchInput").addEventListener("input", applySearch);
  $("#btnPrev").addEventListener("click", () => scrollCards(-1));
  $("#btnNext").addEventListener("click", () => scrollCards(1));

  $("#modalClose").addEventListener("click", closeModal);
  $("#modalBackdrop").addEventListener("click", closeModal);
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  enableDragScroll();
}

document.addEventListener("DOMContentLoaded", init);
