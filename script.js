const STORAGE_KEYS = {
  users: "ecomarket-users",
  products: "ecomarket-products",
  currentUser: "ecomarket-current-user",
  rememberUser: "ecomarket-remember-user",
  favoritesPrefix: "ecomarket-favorites-",
  cartPrefix: "ecomarket-cart-",
};

const defaultUsers = [
  { username: "buyer", email: "buyer@demo.com", password: "123456", role: "buyer" },
  { username: "seller", email: "seller@demo.com", password: "123456", role: "seller" },
];

const defaultProducts = [
  {
    id: 1,
    title: "Miel orgánica de montaña",
    category: "Alimentos",
    price: 18000,
    stock: 12,
    location: "Pasto, Nariño",
    emoji: "🍯",
    rating: 4.9,
    featured: true,
    owner: "seller",
    description: "Miel pura y artesanal, producida por pequeños apicultores locales con excelente calidad.",
  },
  {
    id: 2,
    title: "Arepas artesanales",
    category: "Alimentos",
    price: 12000,
    stock: 18,
    location: "Pasto, Nariño",
    emoji: "🥖",
    rating: 4.7,
    featured: true,
    owner: "seller",
    description: "Arepas frescas elaboradas cada mañana, perfectas para desayuno o merienda.",
  },
  {
    id: 3,
    title: "Bolso tejido a mano",
    category: "Artesanías",
    price: 45000,
    stock: 6,
    location: "Pasto, Nariño",
    emoji: "🧶",
    rating: 4.8,
    featured: true,
    owner: "seller",
    description: "Bolso resistente y elegante, tejido de forma artesanal para uso diario.",
  },
  {
    id: 4,
    title: "Servicio técnico básico",
    category: "Servicios",
    price: 30000,
    stock: 15,
    location: "Pasto, Nariño",
    emoji: "🛠️",
    rating: 4.6,
    featured: false,
    owner: "seller",
    description: "Soporte para computadores, instalación de software y diagnóstico general.",
  },
  {
    id: 5,
    title: "Queso campesino",
    category: "Alimentos",
    price: 22000,
    stock: 10,
    location: "Pasto, Nariño",
    emoji: "🧀",
    rating: 4.8,
    featured: false,
    owner: "seller",
    description: "Queso fresco producido localmente con sabor tradicional y excelente textura.",
  },
  {
    id: 6,
    title: "Jabón artesanal natural",
    category: "Hogar",
    price: 9000,
    stock: 24,
    location: "Pasto, Nariño",
    emoji: "🧼",
    rating: 4.5,
    featured: false,
    owner: "seller",
    description: "Jabón suave para uso diario elaborado con ingredientes naturales.",
  },
];

const state = {
  authMode: "login",
  currentView: "home",
  users: [],
  products: [],
  currentUser: null,
  favorites: [],
  cart: [],
  selectedProductId: null,
  editingProductId: null,
  toastTimer: null,
};

document.addEventListener("DOMContentLoaded", init);

function init() {
  loadData();
  bindEvents();
  syncAuthModeUI();
  syncShellVisibility();

  if (state.currentUser) {
    openApp();
  } else {
    openAuth();
  }

  renderAll();
}

function bindEvents() {
  document.getElementById("loginTab").addEventListener("click", () => switchAuthMode("login"));
  document.getElementById("registerTab").addEventListener("click", () => switchAuthMode("register"));
  document.getElementById("switchToRegister").addEventListener("click", () => switchAuthMode("register"));
  document.getElementById("switchToLogin").addEventListener("click", () => switchAuthMode("login"));

  document.getElementById("loginForm").addEventListener("submit", handleLogin);
  document.getElementById("registerForm").addEventListener("submit", handleRegister);
  document.getElementById("resetForm").addEventListener("submit", handleResetPassword);
  document.getElementById("productForm").addEventListener("submit", handleProductSubmit);

  document.getElementById("logoutBtn").addEventListener("click", logout);
  document.getElementById("profileLogoutBtn").addEventListener("click", logout);
  document.getElementById("forgotPasswordBtn").addEventListener("click", openResetModal);
  document.getElementById("closeResetModal").addEventListener("click", closeResetModal);
  document.getElementById("closeDetailModal").addEventListener("click", closeDetailModal);
  document.getElementById("clearCartBtn").addEventListener("click", clearCart);
  document.getElementById("productCancelBtn").addEventListener("click", cancelEdit);

  document.querySelectorAll("[data-view]").forEach((btn) => {
    btn.addEventListener("click", () => setView(btn.dataset.view));
  });

  document.querySelectorAll("[data-go]").forEach((btn) => {
    btn.addEventListener("click", () => setView(btn.dataset.go));
  });

  ["catalogSearch", "catalogCategory", "catalogSort"].forEach((id) => {
    document.getElementById(id).addEventListener("input", renderCatalog);
    document.getElementById(id).addEventListener("change", renderCatalog);
  });

  document.getElementById("detailModal").addEventListener("click", (e) => {
    if (e.target.id === "detailModal") closeDetailModal();
  });

  document.getElementById("resetModal").addEventListener("click", (e) => {
    if (e.target.id === "resetModal") closeResetModal();
  });
}

function loadData() {
  state.users = loadJSON(STORAGE_KEYS.users, defaultUsers);
  state.products = loadJSON(STORAGE_KEYS.products, defaultProducts);
  state.currentUser = loadStoredCurrentUser();

  if (!localStorage.getItem(STORAGE_KEYS.users)) {
    saveJSON(STORAGE_KEYS.users, state.users);
  }

  if (!localStorage.getItem(STORAGE_KEYS.products)) {
    saveJSON(STORAGE_KEYS.products, state.products);
  }

  if (state.currentUser) {
    loadUserLists();
  }
}

function loadStoredCurrentUser() {
  const remembered = localStorage.getItem(STORAGE_KEYS.currentUser);
  const sessionUser = sessionStorage.getItem(STORAGE_KEYS.currentUser);

  try {
    return remembered ? JSON.parse(remembered) : sessionUser ? JSON.parse(sessionUser) : null;
  } catch {
    return null;
  }
}

function loadUserLists() {
  if (!state.currentUser) return;
  state.favorites = loadJSON(favoritesKey(), []);
  state.cart = loadJSON(cartKey(), []);
}

function saveUserLists() {
  if (!state.currentUser) return;
  saveJSON(favoritesKey(), state.favorites);
  saveJSON(cartKey(), state.cart);
}

function favoritesKey() {
  return `${STORAGE_KEYS.favoritesPrefix}${state.currentUser.username}`;
}

function cartKey() {
  return `${STORAGE_KEYS.cartPrefix}${state.currentUser.username}`;
}

function openAuth() {
  document.getElementById("authScreen").classList.remove("hidden");
  document.getElementById("appShell").classList.add("hidden");
}

function openApp() {
  document.getElementById("authScreen").classList.add("hidden");
  document.getElementById("appShell").classList.remove("hidden");
  updateCurrentUserUI();
  updateSellerNav();
  setView("home");
}

function syncShellVisibility() {
  if (state.currentUser) {
    openApp();
  } else {
    openAuth();
  }
}

function switchAuthMode(mode) {
  state.authMode = mode;
  syncAuthModeUI();
}

function syncAuthModeUI() {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const loginTab = document.getElementById("loginTab");
  const registerTab = document.getElementById("registerTab");

  if (state.authMode === "login") {
    loginForm.classList.remove("hidden");
    registerForm.classList.add("hidden");
    loginTab.classList.add("active");
    registerTab.classList.remove("active");
  } else {
    loginForm.classList.add("hidden");
    registerForm.classList.remove("hidden");
    loginTab.classList.remove("active");
    registerTab.classList.add("active");
  }
}

function handleLogin(event) {
  event.preventDefault();

  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value;
  const remember = document.getElementById("loginRemember").checked;

  const user = state.users.find(
    (item) => item.username.toLowerCase() === username.toLowerCase() && item.password === password
  );

  if (!user) {
    showToast("Usuario o contraseña incorrectos.", "error");
    return;
  }

  state.currentUser = { ...user };
  state.favorites = loadJSON(favoritesKey(), []);
  state.cart = loadJSON(cartKey(), []);

  persistCurrentUser(remember);
  openApp();
  renderAll();
  showToast(`Bienvenido, ${state.currentUser.username}.`, "success");
}

function handleRegister(event) {
  event.preventDefault();

  const username = document.getElementById("registerUsername").value.trim();
  const email = document.getElementById("registerEmail").value.trim();
  const password = document.getElementById("registerPassword").value;
  const confirm = document.getElementById("registerConfirmPassword").value;
  const role = document.getElementById("registerRole").value;

  if (!username || !email || !password || !confirm) {
    showToast("Completa todos los campos.", "error");
    return;
  }

  if (password.length < 4) {
    showToast("La contraseña debe tener al menos 4 caracteres.", "error");
    return;
  }

  if (password !== confirm) {
    showToast("Las contraseñas no coinciden.", "error");
    return;
  }

  const exists = state.users.some(
    (item) => item.username.toLowerCase() === username.toLowerCase() || item.email.toLowerCase() === email.toLowerCase()
  );

  if (exists) {
    showToast("Ese usuario o correo ya existe.", "error");
    return;
  }

  const newUser = {
    username,
    email,
    password,
    role,
  };

  state.users.push(newUser);
  saveJSON(STORAGE_KEYS.users, state.users);

  state.currentUser = { ...newUser };
  state.favorites = [];
  state.cart = [];
  persistCurrentUser(true);

  showToast("Cuenta creada correctamente.", "success");
  openApp();
  renderAll();
}

function persistCurrentUser(remember) {
  const serialized = JSON.stringify(state.currentUser);

  localStorage.removeItem(STORAGE_KEYS.currentUser);
  sessionStorage.removeItem(STORAGE_KEYS.currentUser);

  if (remember) {
    localStorage.setItem(STORAGE_KEYS.currentUser, serialized);
    localStorage.setItem(STORAGE_KEYS.rememberUser, "true");
  } else {
    sessionStorage.setItem(STORAGE_KEYS.currentUser, serialized);
    localStorage.removeItem(STORAGE_KEYS.rememberUser);
  }
}

function logout() {
  saveUserLists();

  state.currentUser = null;
  state.favorites = [];
  state.cart = [];
  state.editingProductId = null;
  state.currentView = "home";

  localStorage.removeItem(STORAGE_KEYS.currentUser);
  sessionStorage.removeItem(STORAGE_KEYS.currentUser);
  localStorage.removeItem(STORAGE_KEYS.rememberUser);

  openAuth();
  switchAuthMode("login");
  clearAuthForms();
  renderAll();
  showToast("Sesión cerrada.", "success");
}

function clearAuthForms() {
  [
    "loginUsername",
    "loginPassword",
    "registerUsername",
    "registerEmail",
    "registerPassword",
    "registerConfirmPassword",
  ].forEach((id) => {
    document.getElementById(id).value = "";
  });

  document.getElementById("loginRemember").checked = false;
  document.getElementById("registerRole").value = "buyer";
}

function openResetModal() {
  document.getElementById("resetModal").classList.remove("hidden");
  document.getElementById("resetUsername").value = "";
  document.getElementById("resetPassword1").value = "";
  document.getElementById("resetPassword2").value = "";
}

function closeResetModal() {
  document.getElementById("resetModal").classList.add("hidden");
}

function handleResetPassword(event) {
  event.preventDefault();

  const username = document.getElementById("resetUsername").value.trim();
  const pass1 = document.getElementById("resetPassword1").value;
  const pass2 = document.getElementById("resetPassword2").value;

  if (!username || !pass1 || !pass2) {
    showToast("Completa todos los campos.", "error");
    return;
  }

  if (pass1 !== pass2) {
    showToast("Las contraseñas no coinciden.", "error");
    return;
  }

  const userIndex = state.users.findIndex(
    (item) => item.username.toLowerCase() === username.toLowerCase()
  );

  if (userIndex === -1) {
    showToast("No existe un usuario con ese nombre.", "error");
    return;
  }

  state.users[userIndex].password = pass1;
  saveJSON(STORAGE_KEYS.users, state.users);

  closeResetModal();
  showToast("Contraseña actualizada.", "success");
}

function updateCurrentUserUI() {
  const name = document.getElementById("topUserName");
  const role = document.getElementById("topUserRole");

  if (!state.currentUser) {
    name.textContent = "Invitado";
    role.textContent = "Sin sesión";
    return;
  }

  name.textContent = state.currentUser.username;
  role.textContent = state.currentUser.role === "seller" ? "Vendedor" : "Comprador";
}

function updateSellerNav() {
  const sellerBtn = document.getElementById("sellerNavBtn");
  if (!state.currentUser) {
    sellerBtn.classList.add("hidden");
    return;
  }

  sellerBtn.classList.toggle("hidden", state.currentUser.role !== "seller");
}

function setView(view) {
  state.currentView = view;
  renderViews();
}

function renderViews() {
  const pageMap = {
    home: "homeSection",
    catalog: "catalogSection",
    favorites: "favoritesSection",
    cart: "cartSection",
    seller: "sellerSection",
    profile: "profileSection",
  };

  document.querySelectorAll(".page").forEach((page) => {
    page.classList.remove("active");
  });

  const target = pageMap[state.currentView] || "homeSection";
  document.getElementById(target).classList.add("active");

  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === state.currentView);
  });

  renderSeller();
  renderProfile();
}

function renderAll() {
  updateCurrentUserUI();
  updateSellerNav();
  renderHome();
  renderCatalog();
  renderFavorites();
  renderCart();
  renderSeller();
  renderProfile();
  renderViews();
}

function renderHome() {
  const products = [...state.products];
  const featured = products
    .filter((item) => item.featured)
    .concat(products.filter((item) => !item.featured))
    .slice(0, 6);

  const productCount = state.products.length;
  const sellerCount = [...new Set(state.products.map((item) => item.owner))].length;
  const favoriteCount = state.favorites.length;
  const cartCount = state.cart.reduce((sum, item) => sum + item.qty, 0);
  const categoryCount = [...new Set(state.products.map((item) => item.category))].length;

  document.getElementById("miniProducts").textContent = productCount;
  document.getElementById("miniSellers").textContent = sellerCount;
  document.getElementById("miniFavorites").textContent = favoriteCount;
  document.getElementById("miniCart").textContent = cartCount;

  const statsHTML = [
    { label: "Productos publicados", value: productCount },
    { label: "Vendedores activos", value: sellerCount },
    { label: "Categorías disponibles", value: categoryCount },
    { label: "Favoritos guardados", value: favoriteCount },
  ]
    .map(
      (stat) => `
        <div class="card stat-card">
          <strong>${stat.value}</strong>
          <span>${escapeHTML(stat.label)}</span>
        </div>
      `
    )
    .join("");

  document.getElementById("homeStats").innerHTML = statsHTML;

  document.getElementById("featuredGrid").innerHTML = featured.length
    ? featured.map((product) => productCardHTML(product, { compact: false })).join("")
    : `<div class="card empty-state">No hay productos destacados todavía.</div>`;

  document.getElementById("howItWorks").innerHTML = [
    {
      step: "1",
      title: "Regístrate",
      text: "Crea tu cuenta como comprador o vendedor con acceso inmediato a la plataforma.",
    },
    {
      step: "2",
      title: "Explora",
      text: "Busca productos por nombre, categoría, ubicación o precio dentro del catálogo.",
    },
    {
      step: "3",
      title: "Guarda y publica",
      text: "Agrega favoritos, usa el carrito o publica tus propios productos desde el panel.",
    },
  ]
    .map(
      (item) => `
        <div class="card info-card">
          <div class="step">${item.step}</div>
          <h4>${escapeHTML(item.title)}</h4>
          <p>${escapeHTML(item.text)}</p>
        </div>
      `
    )
    .join("");
}

function getFilteredProducts() {
  let list = [...state.products];
  const query = document.getElementById("catalogSearch").value.trim().toLowerCase();
  const category = document.getElementById("catalogCategory").value;
  const sort = document.getElementById("catalogSort").value;

  if (query) {
    list = list.filter((item) => {
      const joined = [
        item.title,
        item.category,
        item.location,
        item.description,
        item.owner,
      ]
        .join(" ")
        .toLowerCase();
      return joined.includes(query);
    });
  }

  if (category !== "Todos") {
    list = list.filter((item) => item.category === category);
  }

  switch (sort) {
    case "price-asc":
      list.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      list.sort((a, b) => b.price - a.price);
      break;
    case "rating-desc":
      list.sort((a, b) => b.rating - a.rating);
      break;
    default:
      list.sort((a, b) => Number(b.featured) - Number(a.featured));
      break;
  }

  return list;
}

function renderCatalog() {
  const grid = document.getElementById("catalogGrid");
  const products = getFilteredProducts();

  if (!state.currentUser) {
    grid.innerHTML = `<div class="card empty-state">Inicia sesión para ver el catálogo y usar favoritos o carrito.</div>`;
    return;
  }

  grid.innerHTML = products.length
    ? products.map((product) => productCardHTML(product, { compact: false })).join("")
    : `<div class="card empty-state">No hay resultados con esos filtros.</div>`;
}

function renderFavorites() {
  const grid = document.getElementById("favoritesGrid");

  if (!state.currentUser) {
    grid.innerHTML = `<div class="card empty-state">Inicia sesión para ver tus favoritos.</div>`;
    return;
  }

  const items = state.products.filter((product) => state.favorites.includes(product.id));

  grid.innerHTML = items.length
    ? items.map((product) => productCardHTML(product, { compact: false })).join("")
    : `<div class="card empty-state">Aún no has guardado productos en favoritos.</div>`;
}

function renderCart() {
  const list = document.getElementById("cartList");
  const totalCount = document.getElementById("cartCount");
  const totalPrice = document.getElementById("cartTotal");

  if (!state.currentUser) {
    list.innerHTML = `<div class="card empty-state">Inicia sesión para usar el carrito.</div>`;
    totalCount.textContent = "0";
    totalPrice.textContent = "$0";
    return;
  }

  let items = state.cart
    .map((entry) => {
      const product = state.products.find((item) => item.id === entry.productId);
      return product ? { ...product, qty: entry.qty } : null;
    })
    .filter(Boolean);

  const count = items.reduce((sum, item) => sum + item.qty, 0);
  const total = items.reduce((sum, item) => sum + item.qty * item.price, 0);

  totalCount.textContent = String(count);
  totalPrice.textContent = formatCurrency(total);

  list.innerHTML = items.length
    ? items
        .map(
          (item) => `
            <div class="card cart-item">
              <div class="cart-item-top">
                <div>
                  <strong>${escapeHTML(item.emoji)} ${escapeHTML(item.title)}</strong>
                  <div class="product-meta" style="margin-top:8px;">
                    <span>${escapeHTML(item.category)}</span>
                    <span>${escapeHTML(item.location)}</span>
                  </div>
                </div>
                <strong>${formatCurrency(item.price * item.qty)}</strong>
              </div>

              <div class="quantity-controls">
                <button type="button" onclick="updateCartQty(${item.id}, -1)">−</button>
                <strong>${item.qty}</strong>
                <button type="button" onclick="updateCartQty(${item.id}, 1)">+</button>
                <button type="button" class="danger-btn small-btn" onclick="removeFromCart(${item.id})">Eliminar</button>
              </div>
            </div>
          `
        )
        .join("")
    : `<div class="card empty-state">Tu carrito está vacío.</div>`;
}

function renderSeller() {
  const message = document.getElementById("sellerMessage");
  const area = document.getElementById("sellerArea");

  if (!state.currentUser) {
    message.innerHTML = "Inicia sesión para acceder al panel de vendedor.";
    area.classList.add("hidden");
    return;
  }

  if (state.currentUser.role !== "seller") {
    message.innerHTML = `
      <strong>Este espacio es para vendedores.</strong><br>
      Tu cuenta actual es de comprador. Si deseas publicar productos, crea una cuenta como vendedor.
    `;
    area.classList.add("hidden");
    return;
  }

  area.classList.remove("hidden");
  message.innerHTML = `
    <strong>Cuenta activa:</strong> ${escapeHTML(state.currentUser.username)}<br>
    Aquí puedes publicar, editar y eliminar productos.
  `;

  const ownProducts = state.products.filter((item) => item.owner === state.currentUser.username);
  document.getElementById("sellerCount").textContent = String(ownProducts.length);
  document.getElementById("sellerList").innerHTML = ownProducts.length
    ? ownProducts
        .map(
          (product) => `
            <div class="card seller-item">
              <div class="seller-item-top">
                <div>
                  <strong>${escapeHTML(product.emoji)} ${escapeHTML(product.title)}</strong>
                  <div class="product-meta" style="margin-top:8px;">
                    <span>${escapeHTML(product.category)}</span>
                    <span>${formatCurrency(product.price)}</span>
                    <span>Stock ${product.stock}</span>
                  </div>
                </div>
              </div>

              <small>${escapeHTML(product.description)}</small>

              <div class="seller-item-actions">
                <button class="secondary-btn small-btn" type="button" onclick="editProduct(${product.id})">Editar</button>
                <button class="danger-btn small-btn" type="button" onclick="deleteProduct(${product.id})">Eliminar</button>
              </div>
            </div>
          `
        )
        .join("")
    : `<div class="empty-state">Todavía no has publicado productos.</div>`;

  const submit = document.getElementById("productSubmitText");
  const cancel = document.getElementById("productCancelBtn");

  if (state.editingProductId) {
    submit.textContent = "Actualizar producto";
    cancel.classList.remove("hidden");
  } else {
    submit.textContent = "Publicar producto";
    cancel.classList.add("hidden");
  }
}

function renderProfile() {
  if (!state.currentUser) {
    document.getElementById("profileCard").innerHTML = `
      <div class="empty-state">Inicia sesión para ver tu perfil.</div>
    `;
    return;
  }

  const roleLabel = state.currentUser.role === "seller" ? "Vendedor" : "Comprador";
  const favoritesCount = state.favorites.length;
  const cartCount = state.cart.reduce((sum, item) => sum + item.qty, 0);
  const myProducts = state.products.filter((item) => item.owner === state.currentUser.username).length;

  document.getElementById("profileCard").innerHTML = `
    <h4>Mi cuenta</h4>
    <div class="profile-line">
      <strong>Username</strong>
      <p>${escapeHTML(state.currentUser.username)}</p>
    </div>
    <div class="profile-line">
      <strong>Email</strong>
      <p>${escapeHTML(state.currentUser.email)}</p>
    </div>
    <div class="profile-line">
      <strong>Rol</strong>
      <p>${roleLabel}</p>
    </div>
    <div class="profile-line">
      <strong>Favoritos</strong>
      <p>${favoritesCount}</p>
    </div>
    <div class="profile-line">
      <strong>Carrito</strong>
      <p>${cartCount} items</p>
    </div>
    <div class="profile-line">
      <strong>Mis productos</strong>
      <p>${myProducts}</p>
    </div>
  `;
}

function productCardHTML(product, options = {}) {
  const favorite = state.favorites.includes(product.id);
  const cartItem = state.cart.find((item) => item.productId === product.id);

  return `
    <article class="card product-card">
      <div class="product-top">
        <div>
          <div class="product-badge">${escapeHTML(product.category)}</div>
          <h4 style="margin-top:10px;">${escapeHTML(product.title)}</h4>
        </div>
        <div class="product-emoji">${escapeHTML(product.emoji)}</div>
      </div>

      <p>${escapeHTML(product.description)}</p>

      <div class="product-meta">
        <span>📍 ${escapeHTML(product.location)}</span>
        <span>⭐ ${product.rating.toFixed(1)}</span>
        <span>👤 ${escapeHTML(product.owner)}</span>
        <span>📦 Stock ${product.stock}</span>
      </div>

      <div class="product-price">
        <strong>${formatCurrency(product.price)}</strong>
        <span class="product-badge">${product.featured ? "Destacado" : "Normal"}</span>
      </div>

      <div class="action-row">
        <button class="secondary-btn small-btn" type="button" onclick="openProductDetail(${product.id})">Ver detalle</button>
        <button class="${favorite ? "small-red" : "small-green"} small-btn" type="button" onclick="toggleFavorite(${product.id})">
          ${favorite ? "♥ Favorito" : "♡ Favorito"}
        </button>
        <button class="small-soft small-btn" type="button" onclick="addToCart(${product.id})">
          ${cartItem ? `En carrito (${cartItem.qty})` : "Añadir al carrito"}
        </button>
      </div>
    </article>
  `;
}

function openProductDetail(id) {
  const product = state.products.find((item) => item.id === id);
  if (!product) return;

  state.selectedProductId = id;

  document.getElementById("detailBody").innerHTML = `
    <div class="detail-grid">
      <div class="detail-emoji">${escapeHTML(product.emoji)}</div>
      <div class="detail-info">
        <div class="product-badge">${escapeHTML(product.category)}</div>
        <h3>${escapeHTML(product.title)}</h3>
        <p>${escapeHTML(product.description)}</p>

        <div class="detail-chips">
          <span>📍 ${escapeHTML(product.location)}</span>
          <span>⭐ ${product.rating.toFixed(1)}</span>
          <span>📦 Stock ${product.stock}</span>
          <span>👤 ${escapeHTML(product.owner)}</span>
        </div>

        <div class="detail-price">${formatCurrency(product.price)}</div>

        <div class="detail-actions">
          <button class="primary-btn" type="button" onclick="addToCart(${product.id})">Agregar al carrito</button>
          <button class="secondary-btn" type="button" onclick="toggleFavorite(${product.id})">Favorito</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById("detailModal").classList.remove("hidden");
}

function closeDetailModal() {
  document.getElementById("detailModal").classList.add("hidden");
  state.selectedProductId = null;
}

function toggleFavorite(id) {
  if (!state.currentUser) {
    showToast("Inicia sesión para usar favoritos.", "error");
    return;
  }

  const index = state.favorites.indexOf(id);
  if (index >= 0) {
    state.favorites.splice(index, 1);
    showToast("Eliminado de favoritos.", "success");
  } else {
    state.favorites.push(id);
    showToast("Guardado en favoritos.", "success");
  }

  saveUserLists();
  renderAll();
  if (state.selectedProductId === id) openProductDetail(id);
}

function addToCart(id) {
  if (!state.currentUser) {
    showToast("Inicia sesión para usar el carrito.", "error");
    return;
  }

  const product = state.products.find((item) => item.id === id);
  if (!product) return;

  const item = state.cart.find((entry) => entry.productId === id);
  if (item) {
    item.qty += 1;
  } else {
    state.cart.push({ productId: id, qty: 1 });
  }

  saveUserLists();
  renderAll();
  showToast("Producto agregado al carrito.", "success");
  if (state.selectedProductId === id) openProductDetail(id);
}

function updateCartQty(productId, delta) {
  const item = state.cart.find((entry) => entry.productId === productId);
  if (!item) return;

  item.qty += delta;

  if (item.qty <= 0) {
    state.cart = state.cart.filter((entry) => entry.productId !== productId);
  }

  saveUserLists();
  renderAll();
}

function removeFromCart(productId) {
  state.cart = state.cart.filter((entry) => entry.productId !== productId);
  saveUserLists();
  renderAll();
  showToast("Producto eliminado del carrito.", "success");
}

function clearCart() {
  if (!state.currentUser) {
    showToast("Inicia sesión primero.", "error");
    return;
  }

  state.cart = [];
  saveUserLists();
  renderAll();
  showToast("Carrito vaciado.", "success");
}

function handleProductSubmit(event) {
  event.preventDefault();

  if (!state.currentUser || state.currentUser.role !== "seller") {
    showToast("Solo los vendedores pueden publicar productos.", "error");
    return;
  }

  const title = document.getElementById("productTitle").value.trim();
  const category = document.getElementById("productCategory").value;
  const price = Number(document.getElementById("productPrice").value);
  const stock = Number(document.getElementById("productStock").value);
  const location = document.getElementById("productLocation").value.trim();
  const emoji = document.getElementById("productEmoji").value;
  const description = document.getElementById("productDescription").value.trim();
  const featured = document.getElementById("productFeatured").checked;

  if (!title || !price || !stock || !location || !description) {
    showToast("Completa todos los campos del producto.", "error");
    return;
  }

  const payload = {
    id: state.editingProductId || Date.now(),
    title,
    category,
    price,
    stock,
    location,
    emoji,
    description,
    featured,
    owner: state.currentUser.username,
    rating: state.editingProductId
      ? state.products.find((item) => item.id === state.editingProductId)?.rating || 4.6
      : 4.6,
  };

  if (state.editingProductId) {
    state.products = state.products.map((item) => (item.id === state.editingProductId ? payload : item));
    showToast("Producto actualizado.", "success");
  } else {
    state.products.unshift(payload);
    showToast("Producto publicado.", "success");
  }

  saveJSON(STORAGE_KEYS.products, state.products);
  cancelEdit();
  renderAll();
}

function editProduct(id) {
  const product = state.products.find((item) => item.id === id);
  if (!product) return;

  state.editingProductId = id;

  document.getElementById("productTitle").value = product.title;
  document.getElementById("productCategory").value = product.category;
  document.getElementById("productPrice").value = product.price;
  document.getElementById("productStock").value = product.stock;
  document.getElementById("productLocation").value = product.location;
  document.getElementById("productEmoji").value = product.emoji;
  document.getElementById("productDescription").value = product.description;
  document.getElementById("productFeatured").checked = product.featured;

  document.getElementById("productSubmitText").textContent = "Actualizar producto";
  document.getElementById("productCancelBtn").classList.remove("hidden");

  setView("seller");
}

function cancelEdit() {
  state.editingProductId = null;

  document.getElementById("productForm").reset();
  document.getElementById("productCategory").value = "Alimentos";
  document.getElementById("productEmoji").value = "🍯";
  document.getElementById("productSubmitText").textContent = "Publicar producto";
  document.getElementById("productCancelBtn").classList.add("hidden");
}

function deleteProduct(id) {
  if (!confirm("¿Seguro que deseas eliminar este producto?")) return;

  state.products = state.products.filter((item) => item.id !== id);
  state.favorites = state.favorites.filter((item) => item !== id);
  state.cart = state.cart.filter((item) => item.productId !== id);

  saveJSON(STORAGE_KEYS.products, state.products);
  saveUserLists();
  renderAll();
  showToast("Producto eliminado.", "success");
}

function escapeHTML(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatCurrency(value) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : structuredClone(fallback);
  } catch {
    return structuredClone(fallback);
  }
}

function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = `toast show ${type}`;

  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => {
    toast.className = "toast hidden";
  }, 2200);
}