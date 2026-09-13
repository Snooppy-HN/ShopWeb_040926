/* =========================================================
   CUSTOMER STORE
   BÀI TẬP CAPSTONE JS
========================================================= */

/* =========================================================
   1. API
========================================================= */

const API_URL = "https://6a9ff54c3e0d88d3d7e5384e.mockapi.io/products";

/* =========================================================
   2. GLOBAL DATA
========================================================= */

let products = [];
let cart = [];

/* =========================================================
   3. PRODUCTS CLASS
========================================================= */

class Products {
  constructor(
    name,
    price,
    screen,
    backCamera,
    frontCamera,
    img,
    desc,
    type,
    id
  ) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.screen = screen;
    this.backCamera = backCamera;
    this.frontCamera = frontCamera;
    this.img = img;
    this.desc = desc;
    this.type = type;
  }
}

/* =========================================================
   4. CART ITEM CLASS
========================================================= */

class CartItem {
  constructor(product, quantity = 1) {
    this.product = product;
    this.quantity = quantity;
  }
}

/* =========================================================
   5. GET PRODUCTS FROM API
========================================================= */

function getProducts() {
  axios
    .get(API_URL)
    .then(function (response) {
      console.log("API products:", response.data);

      // Chuyển dữ liệu API thành object Products
      products = response.data.map(function (item) {
        return new Products(
          item.name,
          item.price,
          item.screen,
          item.backCamera,
          item.frontCamera,
          item.img,
          item.desc,
          item.type,
          item.id
        );
      });

      console.log("Products:", products);

      // Tắt loading
      const loading = document.getElementById("loading");

      if (loading) {
        loading.style.display = "none";
      }

      // Hiển thị danh sách sản phẩm
      renderProducts(products);

      // Load giỏ hàng sau khi products đã được load
      loadCart();
    })
    .catch(function (error) {
      console.error("Không thể lấy danh sách sản phẩm:", error);

      const loading = document.getElementById("loading");

      if (loading) {
        loading.style.display = "none";
      }

      const emptyMessage = document.getElementById("emptyMessage");

      if (emptyMessage) {
        emptyMessage.innerText = "Không thể tải danh sách sản phẩm.";
        emptyMessage.style.display = "flex";
      }
    });
}

/* =========================================================
   6. RENDER PRODUCTS
========================================================= */

function renderProducts(productList) {
  const productListElement = document.getElementById("productList");

  const emptyMessage = document.getElementById("emptyMessage");

  if (!productListElement) {
    console.error("Không tìm thấy #productList trong HTML.");
    return;
  }

  // Xóa giao diện cũ
  productListElement.innerHTML = "";

  // Không có sản phẩm
  if (productList.length === 0) {
    if (emptyMessage) {
      emptyMessage.innerText = "Không tìm thấy sản phẩm.";
      emptyMessage.style.display = "flex";
    }

    return;
  }

  // Có sản phẩm → ẩn empty message
  if (emptyMessage) {
    emptyMessage.style.display = "none";
  }

  // Duyệt từng sản phẩm
  productList.forEach(function (product) {
    const productCol = document.createElement("div");

    productCol.className = "col-xl-4 col-md-6";

    productCol.innerHTML = `
      <div class="productCard">

        <!-- PRODUCT IMAGE -->
        <div class="productCard_imageWrapper">

          <span class="productCard_badge">
            ${product.type}
          </span>

          <img
            src="${product.img}"
            alt="${product.name}"
            class="productCard_image"
          >

        </div>

        <!-- PRODUCT BODY -->
        <div class="productCard_body">

          <h3 class="productCard_name">
            ${product.name}
          </h3>

          <p class="productCard_desc">
            ${product.desc || ""}
          </p>

          <p class="productCard_price">
            ${formatPrice(product.price)}
          </p>

          <button
            type="button"
            class="productCard_btn"
            onclick="addToCart('${product.id}')"
          >
            <i class="fa-solid fa-cart-plus"></i>
            Thêm vào giỏ
          </button>

        </div>

      </div>
    `;

    productListElement.appendChild(productCol);
  });
}

/* =========================================================
   7. FILTER PRODUCT
========================================================= */

function filterProducts() {
  const productFilter = document.getElementById("productFilter");

  if (!productFilter) {
    return;
  }

  const selectedType = productFilter.value;

  // Hiển thị tất cả
  if (selectedType === "all") {
    renderProducts(products);
    return;
  }

  // Lọc theo product.type
  const filteredProducts = products.filter(function (product) {
    return (
      String(product.type || "").toLowerCase() === selectedType.toLowerCase()
    );
  });

  renderProducts(filteredProducts);
}

/* =========================================================
   SEARCH PRODUCT
========================================================= */

function searchProducts() {
  const searchInput = document.getElementById("productSearch");

  const productFilter = document.getElementById("productFilter");

  if (!searchInput) {
    return;
  }

  const keyword = searchInput.value.trim().toLowerCase();

  const selectedType = productFilter
    ? productFilter.value.toLowerCase()
    : "all";

  const filteredProducts = products.filter(function (product) {
    // Tìm theo tên
    const matchName = String(product.name || "")
      .toLowerCase()
      .includes(keyword);

    // Lọc theo loại
    const matchType =
      selectedType === "all" ||
      String(product.type || "").toLowerCase() === selectedType;

    return matchName && matchType;
  });

  renderProducts(filteredProducts);
}

/* ---------------------------------------------------------
   CLEAR SEARCH
--------------------------------------------------------- */

const clearSearchBtn = document.getElementById("clearSearchBtn");

if (clearSearchBtn) {
  clearSearchBtn.addEventListener("click", function () {
    const productSearch = document.getElementById("productSearch");

    if (productSearch) {
      productSearch.value = "";
    }

    searchProducts();
  });
}
/* =========================================================
   8. ADD PRODUCT TO CART
========================================================= */

function addToCart(productId) {
  // Tìm sản phẩm trong products
  const product = products.find(function (item) {
    return String(item.id) === String(productId);
  });

  if (!product) {
    console.error("Không tìm thấy sản phẩm:", productId);

    return;
  }

  // Tìm sản phẩm trong cart
  const cartItem = cart.find(function (item) {
    return String(item.product.id) === String(productId);
  });

  // Chưa có → thêm mới với quantity = 1
  if (!cartItem) {
    const newCartItem = new CartItem(product, 1);

    cart.push(newCartItem);
  }

  // Đã có → tăng quantity
  else {
    cartItem.quantity += 1;
  }

  // Lưu cart
  saveCart();

  // Render cart
  renderCart();

  // Mở drawer giỏ hàng
  //   openCart();

  console.log("Cart:", cart);
}

/* =========================================================
   9. RENDER CART
========================================================= */

function renderCart() {
  const cartList = document.getElementById("cartList");

  const emptyCart = document.getElementById("emptyCart");

  const cartSubtotal = document.getElementById("cartSubtotal");

  const cartTotal = document.getElementById("cartTotal");

  const clearCartBtn = document.getElementById("clearCartBtn");

  if (!cartList) {
    console.error("Không tìm thấy #cartList trong HTML.");

    return;
  }

  // Xóa giao diện cart cũ
  cartList.innerHTML = "";

  /* -------------------------------------------------------
     TÍNH TỔNG SỐ LƯỢNG
  ------------------------------------------------------- */

  let totalQuantity = 0;

  cart.forEach(function (cartItem) {
    totalQuantity += Number(cartItem.quantity);
  });

  // Cập nhật số lượng trên header
  updateCartCounter(totalQuantity);

  /* -------------------------------------------------------
     CART RỖNG
  ------------------------------------------------------- */

  if (cart.length === 0) {
    if (emptyCart) {
      emptyCart.style.display = "flex";
    }

    if (cartSubtotal) {
      cartSubtotal.innerText = "0 ₫";
    }

    if (cartTotal) {
      cartTotal.innerText = "0 ₫";
    }

    // ẨN NÚT XÓA TOÀN BỘ
    if (clearCartBtn) {
      clearCartBtn.style.display = "none";
    }

    return;
  }

  /* =================================================
     GIỎ HÀNG CÓ SẢN PHẨM
  ================================================= */

  if (emptyCart) {
    emptyCart.style.display = "none";
  }

  // Hiện nút Xóa toàn bộ
  if (clearCartBtn) {
    clearCartBtn.style.display = "flex";
  }

  /* -------------------------------------------------------
     TÍNH TỔNG TIỀN
  ------------------------------------------------------- */

  let total = 0;

  /* -------------------------------------------------------
     RENDER CART ITEM
  ------------------------------------------------------- */

  cart.forEach(function (cartItem) {
    const product = cartItem.product;

    const quantity = Number(cartItem.quantity);

    const price = Number(product.price);

    const itemTotal = price * quantity;

    total += itemTotal;

    const cartItemElement = document.createElement("div");

    cartItemElement.className = "cartItem";

    cartItemElement.innerHTML = `
      <div class="row align-items-center g-2">

        <!-- IMAGE -->
        <div class="col-3">

          <img
            src="${product.img}"
            alt="${product.name}"
            class="cartItem_image"
          >

        </div>

        <!-- INFO -->
        <div class="col-9">

          <div
            class="d-flex justify-content-between"
          >

            <div>

              <h5 class="cartItem_name">
                ${product.name}
              </h5>

              <p class="cartItem_price">
                ${formatPrice(price)}
              </p>

            </div>

            <!-- REMOVE -->
            <button
              type="button"
              class="cartRemoveBtn"
              onclick="removeFromCart('${product.id}')"
              title="Xóa sản phẩm"
            >
              <i class="fa-solid fa-trash"></i>
            </button>

          </div>

          <!-- QUANTITY + ITEM TOTAL -->
          <div
            class="d-flex justify-content-between align-items-center mt-2"
          >

            <!-- QUANTITY -->
            <div class="quantityControl">

              <!-- DECREASE -->
              <button
                type="button"
                onclick="decreaseQuantity('${product.id}')"
                title="Giảm số lượng"
              >
                <i class="fa-solid fa-minus"></i>
              </button>

              <!-- NUMBER -->
              <span>
                ${quantity}
              </span>

              <!-- INCREASE -->
              <button
                type="button"
                onclick="increaseQuantity('${product.id}')"
                title="Tăng số lượng"
              >
                <i class="fa-solid fa-plus"></i>
              </button>

            </div>

            <!-- ITEM TOTAL -->
            <strong class="cartItemTotal">
              ${formatPrice(itemTotal)}
            </strong>

          </div>

        </div>

      </div>
    `;

    cartList.appendChild(cartItemElement);
  });

  /* -------------------------------------------------------
     HIỂN THỊ TỔNG TIỀN
  ------------------------------------------------------- */

  if (cartSubtotal) {
    cartSubtotal.innerText = formatPrice(total);
  }

  if (cartTotal) {
    cartTotal.innerText = formatPrice(total);
  }
}

/* =========================================================
   10. INCREASE QUANTITY
========================================================= */

function increaseQuantity(productId) {
  const cartItem = cart.find(function (item) {
    return String(item.product.id) === String(productId);
  });

  if (!cartItem) {
    return;
  }

  cartItem.quantity += 1;

  saveCart();

  renderCart();
}

/* =========================================================
   11. DECREASE QUANTITY
========================================================= */

function decreaseQuantity(productId) {
  const cartItem = cart.find(function (item) {
    return String(item.product.id) === String(productId);
  });

  if (!cartItem) {
    return;
  }

  // Không cho quantity < 1
  if (cartItem.quantity > 1) {
    cartItem.quantity -= 1;
  }

  saveCart();

  renderCart();
}

/* =========================================================
   12. REMOVE PRODUCT FROM CART
========================================================= */

function removeFromCart(productId) {
  cart = cart.filter(function (cartItem) {
    return String(cartItem.product.id) !== String(productId);
  });

  saveCart();

  renderCart();
}
/* =========================================================
   CLEAR ALL CART
========================================================= */

function clearCart() {
  // Nếu giỏ hàng đang trống
  if (cart.length === 0) {
    return;
  }

  // Hỏi xác nhận
  const confirmClear = confirm(
    "Bạn có chắc muốn xóa toàn bộ sản phẩm khỏi giỏ hàng?"
  );

  // Người dùng bấm Cancel
  if (!confirmClear) {
    return;
  }

  // Xóa toàn bộ cart
  cart = [];

  // Lưu lại localStorage
  saveCart();

  // Render lại giao diện
  renderCart();
}
/* =========================================================
   13. LOCAL STORAGE
========================================================= */

/*
    Lưu giỏ hàng vào localStorage
*/

function saveCart() {
  localStorage.setItem("techshop_cart", JSON.stringify(cart));
}

/*
    Load giỏ hàng từ localStorage
*/

function loadCart() {
  const cartData = localStorage.getItem("techshop_cart");

  // Chưa có dữ liệu
  if (!cartData) {
    cart = [];

    renderCart();

    return;
  }

  try {
    const savedCart = JSON.parse(cartData);

    // Kiểm tra dữ liệu có phải mảng không
    if (!Array.isArray(savedCart)) {
      cart = [];

      renderCart();

      return;
    }

    // Chuyển dữ liệu thành CartItem
    cart = savedCart
      .map(function (item) {
        if (!item || !item.product) {
          return null;
        }

        // Tìm product tương ứng trong API
        const product = products.find(function (product) {
          return String(product.id) === String(item.product.id);
        });

        // Product không còn tồn tại
        if (!product) {
          return null;
        }

        // Kiểm tra quantity
        const savedQuantity = Number(item.quantity);

        const quantity = savedQuantity > 0 ? savedQuantity : 1;

        return new CartItem(product, quantity);
      })
      .filter(function (item) {
        return item !== null;
      });
  } catch (error) {
    console.error("Lỗi khi đọc localStorage:", error);

    cart = [];
  }

  // Hiển thị cart
  renderCart();
}

/* =========================================================
   14. CHECKOUT
========================================================= */

function checkout() {
  // Giỏ hàng trống
  if (cart.length === 0) {
    alert("Giỏ hàng đang trống.");

    return;
  }

  // Thông báo
  alert("Thanh toán thành công!");

  // Xóa cart
  cart = [];

  // Lưu cart rỗng
  saveCart();

  // Render lại
  renderCart();

  // Đóng drawer
  closeCart();
}

/* =========================================================
   15. FORMAT PRICE
========================================================= */

function formatPrice(price) {
  return Number(price).toLocaleString("vi-VN") + " ₫";
}

/* =========================================================
   16. CART DRAWER
========================================================= */

const cartDrawer = document.getElementById("cartDrawer");

const cartOverlay = document.getElementById("cartOverlay");

/* ---------------------------------------------------------
   OPEN CART
--------------------------------------------------------- */

function openCart() {
  if (!cartDrawer || !cartOverlay) {
    return;
  }

  cartDrawer.classList.add("active");

  cartOverlay.classList.add("active");

  document.body.classList.add("cartOpen");
}

/* ---------------------------------------------------------
   CLOSE CART
--------------------------------------------------------- */

function closeCart() {
  if (!cartDrawer || !cartOverlay) {
    return;
  }

  cartDrawer.classList.remove("active");

  cartOverlay.classList.remove("active");

  document.body.classList.remove("cartOpen");
}

/* =========================================================
   17. UPDATE CART COUNTER
========================================================= */

function updateCartCounter(quantity) {
  const cartCountHeader = document.getElementById("cartCountHeader");

  const cartCountDrawer = document.getElementById("cartCountDrawer");

  // Header
  if (cartCountHeader) {
    cartCountHeader.innerText = quantity;
  }

  // Drawer
  if (cartCountDrawer) {
    cartCountDrawer.innerText = quantity;
  }
}

/* =========================================================
   18. EVENTS
========================================================= */

/* ---------------------------------------------------------
   FILTER
--------------------------------------------------------- */

const productFilter = document.getElementById("productFilter");

if (productFilter) {
  productFilter.addEventListener("change", filterProducts);
}

/* ---------------------------------------------------------
   SEARCH
--------------------------------------------------------- */

const productSearch = document.getElementById("productSearch");

if (productSearch) {
  productSearch.addEventListener("input", searchProducts);
}

/* ---------------------------------------------------------
   CHECKOUT
--------------------------------------------------------- */

const checkoutBtn = document.getElementById("checkoutBtn");

if (checkoutBtn) {
  checkoutBtn.addEventListener("click", checkout);
}

/* ---------------------------------------------------------
   OPEN CART
--------------------------------------------------------- */

const cartToggleBtn = document.getElementById("cartToggleBtn");

if (cartToggleBtn) {
  cartToggleBtn.addEventListener("click", openCart);
}

/* ---------------------------------------------------------
   CLOSE CART
--------------------------------------------------------- */

const cartCloseBtn = document.getElementById("cartCloseBtn");

if (cartCloseBtn) {
  cartCloseBtn.addEventListener("click", closeCart);
}

/* ---------------------------------------------------------
   CLICK OVERLAY → CLOSE
--------------------------------------------------------- */

if (cartOverlay) {
  cartOverlay.addEventListener("click", closeCart);
}

/* ---------------------------------------------------------
   CLEAR CART
--------------------------------------------------------- */

const clearCartBtn = document.getElementById("clearCartBtn");

if (clearCartBtn) {
  clearCartBtn.addEventListener("click", clearCart);
}

/* ---------------------------------------------------------
   CONTINUE SHOPPING
--------------------------------------------------------- */

const continueShoppingBtn = document.getElementById("continueShoppingBtn");

if (continueShoppingBtn) {
  continueShoppingBtn.addEventListener("click", closeCart);
}

/* =========================================================
   19. START APPLICATION
========================================================= */

/*
    Flow:

    getProducts()
         ↓
    API trả về products
         ↓
    renderProducts()
         ↓
    loadCart()
         ↓
    renderCart()
*/

getProducts();
