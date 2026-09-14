/* =========================================================
   TECHSHOP STORE
   API: https://svcy.myclass.vn/api/ProductApi
========================================================= */

const API_URL = "https://svcy.myclass.vn/api/ProductApi";

let products = [];
let cart = [];
let currentFilter = "all";
let currentSort = "default";
let currentKeyword = "";

class Products {
  constructor(id, name, price, img, desc, type) {
    this.id = id;
    this.name = name;
    this.price = Number(price);
    this.img = img;
    this.desc = desc || "";
    this.type = type || "";
  }
}

class CartItem {
  constructor(product, quantity = 1) {
    this.product = product;
    this.quantity = quantity;
  }
}

function formatPrice(price) {
  if (price == null || isNaN(Number(price))) return "Giá chưa xác định";
  return Number(price).toLocaleString("vi-VN") + " ₫";
}

function normalizeType(type) {
  const t = String(type || "")
    .toLowerCase()
    .trim();
  if (
    t === "iphone" ||
    t === "samsung" ||
    t === "phone" ||
    t === "oppo" ||
    t === "xiaomi" ||
    t.includes("phone") ||
    t.includes("iphone")
  )
    return "phone";
  if (t === "laptop" || t.includes("laptop")) return "laptop";
  if (t === "tablet" || t.includes("tablet")) return "tablet";
  if (t === "watch" || t.includes("watch")) return "watch";
  return t || "other";
}

function typeLabel(type) {
  const n = normalizeType(type);
  if (n === "phone") return "Phone";
  if (n === "laptop") return "Laptop";
  if (n === "tablet") return "Tablet";
  if (n === "watch") return "Smartwatch";
  return type || "Product";
}

function safeImg(src) {
  if (
    !src ||
    String(src).trim() === "" ||
    String(src).toLowerCase() === "null"
  ) {
    return "https://via.placeholder.com/300x300?text=No+Image";
  }
  return src;
}

function getProducts() {
  axios
    .get(`${API_URL}/getall`)
    .then(function (res) {
      const raw = Array.isArray(res.data) ? res.data : [];
      products = raw
        .filter(function (item) {
          return (
            item &&
            item.id != null &&
            String(item.id) !== "" &&
            item.name != null &&
            String(item.name).trim() !== "" &&
            item.price != null &&
            !isNaN(Number(item.price)) &&
            item.type != null &&
            String(item.type).trim() !== "" &&
            item.deleted === false
          );
        })
        .map(function (item) {
          return new Products(
            item.id,
            item.name,
            item.price,
            item.img,
            item.description,
            item.type
          );
        });

      hideLoading();
      updateStats(products.length, products.length);
      applyFilters();
      loadCart();
    })
    .catch(function (err) {
      console.error("Lỗi API:", err);
      hideLoading();
      showEmpty("Không thể tải sản phẩm", "Vui lòng thử lại sau.");
    });
}

function hideLoading() {
  const el = document.getElementById("loading");
  if (el) el.style.display = "none";
}

function updateStats(total, showing) {
  const st = document.getElementById("statTotal");
  const ss = document.getElementById("statShowing");
  if (st) st.textContent = total;
  if (ss) ss.textContent = showing;
}

function getFilteredList() {
  let list = products.slice();

  if (currentKeyword) {
    const kw = currentKeyword.toLowerCase();
    list = list.filter(function (p) {
      return String(p.name || "")
        .toLowerCase()
        .includes(kw);
    });
  }

  if (currentFilter && currentFilter !== "all") {
    list = list.filter(function (p) {
      return normalizeType(p.type) === currentFilter;
    });
  }

  if (currentSort === "price-asc")
    list.sort(function (a, b) {
      return a.price - b.price;
    });
  else if (currentSort === "price-desc")
    list.sort(function (a, b) {
      return b.price - a.price;
    });
  else if (currentSort === "name-asc")
    list.sort(function (a, b) {
      return String(a.name).localeCompare(String(b.name), "vi");
    });
  else if (currentSort === "name-desc")
    list.sort(function (a, b) {
      return String(b.name).localeCompare(String(a.name), "vi");
    });

  return list;
}

function applyFilters() {
  const list = getFilteredList();
  updateStats(products.length, list.length);
  renderProducts(list);
}

function showEmpty(title, desc) {
  const empty = document.getElementById("emptyMessage");
  if (!empty) return;
  const h4 = empty.querySelector("h4");
  const p = empty.querySelector("p");
  if (h4) h4.textContent = title || "Không tìm thấy sản phẩm";
  if (p) p.textContent = desc || "Thử đổi từ khóa hoặc chọn danh mục khác.";
  empty.style.display = "flex";
}

function renderProducts(list) {
  const wrap = document.getElementById("productList");
  const empty = document.getElementById("emptyMessage");
  if (!wrap) return;

  wrap.innerHTML = "";

  if (!list || list.length === 0) {
    if (empty) empty.style.display = "flex";
    return;
  }
  if (empty) empty.style.display = "none";

  list.forEach(function (product) {
    const col = document.createElement("div");
    col.className = "col-xl-3 col-lg-4 col-md-6 col-sm-6";

    col.innerHTML = `
      <div class="productCard">
        <div class="productCard_imageWrapper">
          <span class="productCard_badge">${typeLabel(product.type)}</span>
          <img src="${safeImg(product.img)}" alt="${
      product.name
    }" class="productCard_image"
            loading="lazy" onerror="this.src='https://via.placeholder.com/300x300?text=No+Image'">
        </div>
        <div class="productCard_body">
          <h3 class="productCard_name">${product.name}</h3>
          <p class="productCard_desc">${
            product.desc || "Sản phẩm chính hãng tại TechShop."
          }</p>
          <p class="productCard_price">${formatPrice(product.price)}</p>
          <button type="button" class="productCard_btn" data-id="${product.id}">
            <i class="fa-solid fa-cart-plus"></i> Thêm vào giỏ
          </button>
        </div>
      </div>
    `;

    const btn = col.querySelector(".productCard_btn");
    btn.addEventListener("click", function () {
      addToCart(product.id);
      btn.classList.add("added");
      btn.innerHTML = '<i class="fa-solid fa-check"></i> Đã thêm';
      setTimeout(function () {
        btn.classList.remove("added");
        btn.innerHTML = '<i class="fa-solid fa-cart-plus"></i> Thêm vào giỏ';
      }, 1200);
    });

    wrap.appendChild(col);
  });
}

/* ===== CART ===== */
function addToCart(productId) {
  const product = products.find(function (p) {
    return String(p.id) === String(productId);
  });
  if (!product) return;

  const exist = cart.find(function (c) {
    return String(c.product.id) === String(productId);
  });
  if (exist) exist.quantity += 1;
  else cart.push(new CartItem(product, 1));

  saveCart();
  renderCart();
  showToast("Đã thêm vào giỏ hàng");
}

function renderCart() {
  const cartList = document.getElementById("cartList");
  const emptyCart = document.getElementById("emptyCart");
  const cartSubtotal = document.getElementById("cartSubtotal");
  const cartTotal = document.getElementById("cartTotal");
  const clearCartBtn = document.getElementById("clearCartBtn");
  const cartCountDrawer = document.getElementById("cartCountDrawer");
  if (!cartList) return;

  cartList.innerHTML = "";
  let totalQty = 0;
  cart.forEach(function (c) {
    totalQty += Number(c.quantity) || 0;
  });
  updateCartCounter(totalQty);
  if (cartCountDrawer) cartCountDrawer.textContent = totalQty;

  if (cart.length === 0) {
    if (emptyCart) emptyCart.style.display = "flex";
    if (cartSubtotal) cartSubtotal.textContent = "0 ₫";
    if (cartTotal) cartTotal.textContent = "0 ₫";
    if (clearCartBtn) clearCartBtn.style.display = "none";
    return;
  }

  if (emptyCart) emptyCart.style.display = "none";
  if (clearCartBtn) clearCartBtn.style.display = "flex";

  let total = 0;
  cart.forEach(function (cartItem) {
    const p = cartItem.product;
    const qty = Number(cartItem.quantity) || 1;
    const price = Number(p.price) || 0;
    const itemTotal = price * qty;
    total += itemTotal;

    const el = document.createElement("div");
    el.className = "cartItem";
    el.innerHTML = `
      <div class="row align-items-center g-2">
        <div class="col-3">
          <img src="${safeImg(p.img)}" alt="${p.name}" class="cartItem_image"
            onerror="this.src='https://via.placeholder.com/80x80?text=No+Image'">
        </div>
        <div class="col-9">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <h5 class="cartItem_name">${p.name}</h5>
              <p class="cartItem_price">${formatPrice(price)}</p>
            </div>
            <button type="button" class="cartItem_remove" data-remove="${
              p.id
            }"><i class="fa-solid fa-trash-can"></i></button>
          </div>
          <div class="cartItem_qty">
            <button type="button" class="qtyBtn" data-dec="${
              p.id
            }"><i class="fa-solid fa-minus"></i></button>
            <span class="qtyValue">${qty}</span>
            <button type="button" class="qtyBtn" data-inc="${
              p.id
            }"><i class="fa-solid fa-plus"></i></button>
          </div>
          <div class="cartItem_total">${formatPrice(itemTotal)}</div>
        </div>
      </div>
    `;
    el.querySelector("[data-remove]").addEventListener("click", function () {
      removeFromCart(p.id);
    });
    el.querySelector("[data-inc]").addEventListener("click", function () {
      increaseQuantity(p.id);
    });
    el.querySelector("[data-dec]").addEventListener("click", function () {
      decreaseQuantity(p.id);
    });
    cartList.appendChild(el);
  });

  if (cartSubtotal) cartSubtotal.textContent = formatPrice(total);
  if (cartTotal) cartTotal.textContent = formatPrice(total);
}

function increaseQuantity(id) {
  const item = cart.find(function (c) {
    return String(c.product.id) === String(id);
  });
  if (!item) return;
  item.quantity += 1;
  saveCart();
  renderCart();
}

function decreaseQuantity(id) {
  const item = cart.find(function (c) {
    return String(c.product.id) === String(id);
  });
  if (!item) return;

  // Chỉ giảm khi > 1, không tự xóa sản phẩm
  if (item.quantity > 1) {
    item.quantity -= 1;
    saveCart();
    renderCart();
  }
}

function removeFromCart(id) {
  cart = cart.filter(function (c) {
    return String(c.product.id) !== String(id);
  });
  saveCart();
  renderCart();
}

function clearCart() {
  if (cart.length === 0) return;
  if (!confirm("Xóa toàn bộ sản phẩm trong giỏ hàng?")) return;
  cart = [];
  saveCart();
  renderCart();
}

function updateCartCounter(count) {
  const el = document.getElementById("cartCountHeader");
  if (!el) return;
  el.textContent = count;
  el.style.display = count > 0 ? "flex" : "none";
}

function saveCart() {
  localStorage.setItem("techshop_cart", JSON.stringify(cart));
}

function loadCart() {
  const raw = localStorage.getItem("techshop_cart");
  if (!raw) {
    cart = [];
    renderCart();
    return;
  }
  try {
    const saved = JSON.parse(raw);
    if (!Array.isArray(saved)) {
      cart = [];
      renderCart();
      return;
    }
    cart = saved
      .map(function (item) {
        if (!item || !item.product) return null;
        const product = products.find(function (p) {
          return String(p.id) === String(item.product.id);
        });
        if (!product) return null;
        const q = Number(item.quantity);
        return new CartItem(product, q > 0 ? q : 1);
      })
      .filter(Boolean);
  } catch (e) {
    cart = [];
  }
  renderCart();
}

function checkout() {
  if (cart.length === 0) {
    alert("Giỏ hàng đang trống.");
    return;
  }
  alert("Thanh toán thành công! Cảm ơn bạn đã mua hàng tại TechShop.");
  cart = [];
  saveCart();
  renderCart();
  closeCart();
}

function openCart() {
  document.getElementById("cartDrawer")?.classList.add("active");
  document.getElementById("cartOverlay")?.classList.add("active");
  document.body.classList.add("cartOpen");
}

function closeCart() {
  document.getElementById("cartDrawer")?.classList.remove("active");
  document.getElementById("cartOverlay")?.classList.remove("active");
  document.body.classList.remove("cartOpen");
}

function showToast(msg) {
  let toast = document.querySelector(".toastAdd");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toastAdd";
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(function () {
    toast.classList.remove("show");
  }, 1800);
}

function setFilter(value) {
  currentFilter = value || "all";
  const select = document.getElementById("productFilter");
  if (select) select.value = currentFilter;
  document.querySelectorAll(".chip").forEach(function (chip) {
    chip.classList.toggle("active", chip.dataset.filter === currentFilter);
  });
  applyFilters();
}

function resetAllFilters() {
  currentFilter = "all";
  currentSort = "default";
  currentKeyword = "";
  const search = document.getElementById("productSearch");
  if (search) search.value = "";
  const clearBtn = document.getElementById("clearSearchBtn");
  if (clearBtn) clearBtn.style.display = "none";
  const filter = document.getElementById("productFilter");
  if (filter) filter.value = "all";
  const sort = document.getElementById("sortSelect");
  if (sort) sort.value = "default";
  document.querySelectorAll(".chip").forEach(function (chip) {
    chip.classList.toggle("active", chip.dataset.filter === "all");
  });
  applyFilters();
}

document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("productSearch");
  const clearSearchBtn = document.getElementById("clearSearchBtn");

  if (searchInput) {
    searchInput.addEventListener("input", function () {
      currentKeyword = searchInput.value.trim();
      if (clearSearchBtn)
        clearSearchBtn.style.display = currentKeyword ? "flex" : "none";
      applyFilters();
    });
  }
  if (clearSearchBtn) {
    clearSearchBtn.addEventListener("click", function () {
      if (searchInput) searchInput.value = "";
      currentKeyword = "";
      clearSearchBtn.style.display = "none";
      applyFilters();
    });
  }

  document
    .getElementById("productFilter")
    ?.addEventListener("change", function (e) {
      setFilter(e.target.value);
    });
  document
    .getElementById("sortSelect")
    ?.addEventListener("change", function (e) {
      currentSort = e.target.value;
      applyFilters();
    });
  document.querySelectorAll(".chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      setFilter(chip.dataset.filter);
    });
  });
  document
    .getElementById("resetFilterBtn")
    ?.addEventListener("click", resetAllFilters);
  document.getElementById("cartToggleBtn")?.addEventListener("click", openCart);
  document.getElementById("cartCloseBtn")?.addEventListener("click", closeCart);
  document.getElementById("cartOverlay")?.addEventListener("click", closeCart);
  document.getElementById("checkoutBtn")?.addEventListener("click", checkout);
  document.getElementById("clearCartBtn")?.addEventListener("click", clearCart);
  document
    .getElementById("continueShoppingBtn")
    ?.addEventListener("click", closeCart);

  getProducts();
});
