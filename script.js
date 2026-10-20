{
  id: 7,
  name: "Running Shoes",
  price: 1299,
  category: "Fashion",
  image: "https://placehold.co/300x300?text=Shoes"
},
{
  id: 8,
  name: "Smart Watch",
  price: 1999,
  category: "Electronics",
  image: "https://placehold.co/300x300?text=Watch"
},
{
  id: 9,
  name: "Wireless Headphones",
  price: 1499,
  category: "Electronics",
  image: "https://placehold.co/300x300?text=Headphones"
}
const defaultProducts = [
  {
    id: 1,
    name: "Running Sneakers",
    price: 1499,
    category: "Shoes",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600"
  },
  {
    id: 2,
    name: "Casual T-Shirt",
    price: 599,
    category: "Clothing",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600"
  },
  {
    id: 3,
    name: "Wireless Headphones",
    price: 1999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600"
  },
  {
    id: 4,
    name: "Classic Watch",
    price: 2499,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600"
  }
];

function loadData(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

let products = loadData("shopkart-products", defaultProducts);
let cart = loadData("shopkart-cart", []);
let selectedCategory = "All";

const productList = document.getElementById("product-list");
const searchInput = document.getElementById("search");

function saveData() {
  localStorage.setItem("shopkart-products", JSON.stringify(products));
  localStorage.setItem("shopkart-cart", JSON.stringify(cart));
}

function renderProducts() {
  const search = searchInput.value.toLowerCase();

  const filtered = products.filter(product =>
    product.name.toLowerCase().includes(search) &&
    (selectedCategory === "All" ||
      product.category === selectedCategory)
  );

  if (filtered.length === 0) {
    productList.innerHTML = "<p>No products found.</p>";
    return;
  }

  productList.innerHTML = filtered.map(product => `
    <article class="product-card">
      <img src="${escapeHTML(product.image)}"
           alt="${escapeHTML(product.name)}"
           onerror="this.onerror=null;this.src='https://placehold.co/400x300?text=Product'">

      <div class="product-info">
        <h3>${escapeHTML(product.name)}</h3>
        <p>${escapeHTML(product.category)}</p>
        <p class="price">₹${product.price.toLocaleString("en-IN")}</p>
        <button class="add-btn" onclick="addToCart(${product.id})">
          Add to Cart 🛒
        </button>
      </div>
    </article>
  `).join("");
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

document.querySelectorAll(".category").forEach(button => {
  button.addEventListener("click", () => {
    selectedCategory = button.dataset.category;

    document.querySelectorAll(".category").forEach(item => {
      item.classList.remove("active");
    });

    button.classList.add("active");
    renderProducts();
  });
});

searchInput.addEventListener("input", renderProducts);

document.getElementById("product-form")
  .addEventListener("submit", event => {
    event.preventDefault();

    const name = document.getElementById("product-name").value.trim();
    const price = Number(document.getElementById("product-price").value);
    const category = document.getElementById("product-category").value;
    const image = document.getElementById("product-image").value.trim();

    if (!name || !Number.isFinite(price) || price <= 0 || !image) {
      alert("Please enter a valid name, price and image URL.");
      return;
    }

    products.unshift({
      id: Date.now(),
      name,
      price,
      category,
      image
    });

    saveData();
    event.target.reset();

    selectedCategory = "All";
    document.querySelectorAll(".category").forEach(button => {
      button.classList.toggle(
        "active",
        button.dataset.category === "All"
      );
    });

    searchInput.value = "";
    renderProducts();

    alert("Product added successfully!");
  });

function addToCart(id) {
  const existing = cart.find(item => item.id === id);

  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ id, quantity: 1 });
  }

  saveData();
  renderCart();
}

function changeQuantity(id, amount) {
  const item = cart.find(item => item.id === id);

  if (!item) return;

  item.quantity += amount;
  cart = cart.filter(item => item.quantity > 0);

  saveData();
  renderCart();
}

function renderCart() {
  document.getElementById("cart-count").textContent =
    cart.reduce((total, item) => total + item.quantity, 0);

  const cartItems = document.getElementById("cart-items");
  let total = 0;

  cartItems.innerHTML = cart.map(item => {
    const product = products.find(p => p.id === item.id);

    if (!product) return "";

    total += product.price * item.quantity;

    return `
      <div class="cart-item">
        <div>
          <strong>${escapeHTML(product.name)}</strong>
          <p>₹${product.price.toLocaleString("en-IN")} each</p>
        </div>
        <div>
          <button onclick="changeQuantity(${item.id}, -1)">−</button>
          ${item.quantity}
          <button onclick="changeQuantity(${item.id}, 1)">+</button>
        </div>
      </div>
    `;
  }).join("");

  if (cart.length === 0) {
    cartItems.innerHTML = "<p>Your cart is empty.</p>";
  }

  document.getElementById("cart-total").textContent =
    "Total: ₹" + total.toLocaleString("en-IN");
}

function showCart() {
  document.getElementById("cart-panel").hidden = false;
  renderCart();
  document.getElementById("cart-panel").scrollIntoView({
    behavior: "smooth"
  });
}

function closeCart() {
  document.getElementById("cart-panel").hidden = true;
}

document.getElementById("clear-cart").addEventListener("click", () => {
  cart = [];
  saveData();
  renderCart();
});

renderProducts();
renderCart();