// Número de teléfono configurado para los pedidos por WhatsApp
const WHATSAPP_PHONE = "5491160027906"; 

// Catálogo de Hamburguesas Budger
const products = [
    {
        id: 1,
        name: "Simple Cheese",
        category: "simples",
        price: 5200,
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop",
        desc: "Pan de papa, 1 medallón smash, cheddar doble y salsa de la casa.",
        ingredients: ["Cheddar doble", "Salsa de la casa"]
    },
    {
        id: 2,
        name: "Doble Bacon",
        category: "dobles",
        price: 7500,
        image: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?q=80&w=600&auto=format&fit=crop",
        desc: "Pan de papa, 2 medallones smash, cheddar, bacon crocante y salsa barbacoa.",
        ingredients: ["Cheddar", "Bacon crocante", "Salsa Barbacoa"]
    },
    {
        id: 3,
        name: "Doble Oklahoma",
        category: "dobles",
        price: 7800,
        image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?q=80&w=600&auto=format&fit=crop",
        desc: "Pan de papa, 2 medallones smash con cebolla finamente smashada y doble cheddar.",
        ingredients: ["Cebolla smashada", "Doble Cheddar"]
    },
    {
        id: 4,
        name: "Triple Royale",
        category: "triples",
        price: 9200,
        image: "https://images.unsplash.com/photo-1582196016295-f8c8bd4b3a99?q=80&w=600&auto=format&fit=crop",
        desc: "Pan de papa, 3 medallones smash, cheddar triple, pepinillos, cebolla picada y kétchup.",
        ingredients: ["Cheddar triple", "Pepinillos", "Cebolla picada", "Kétchup"]
    },
    {
        id: 5,
        name: "Cuádruple Beast",
        category: "cuadruples",
        price: 11000,
        image: "productos/disenos-HAMBUR-100G-300x300.jpg",
        desc: "Para verdaderos hambrientos: 4 medallones smash, 8 fetas de cheddar y extra bacon.",
        ingredients: ["8 Fetas de Cheddar", "Extra Bacon"]
    }
];

// Estado global de la aplicación
let cart = [];
let selectedProduct = null;

// Elementos del DOM
const menuGrid = document.getElementById("menuGrid");
const categoryBtns = document.querySelectorAll(".cat-btn");
const customizeModal = document.getElementById("customizeModal");
const closeCustomizeModal = document.getElementById("closeCustomizeModal");
const modalIngredientsList = document.getElementById("modalIngredientsList");
const modalBurgerName = document.getElementById("modalBurgerName");
const modalBurgerDesc = document.getElementById("modalBurgerDesc");
const modalPrice = document.getElementById("modalPrice");
const confirmAddToCartBtn = document.getElementById("confirmAddToCartBtn");

const cartDrawer = document.getElementById("cartDrawer");
const cartOverlay = document.getElementById("cartOverlay");
const openCartBtn = document.getElementById("openCartBtn");
const closeCartBtn = document.getElementById("closeCartBtn");
const cartItemsContainer = document.getElementById("cartItemsContainer");
const cartBadge = document.getElementById("cartBadge");
const cartTotal = document.getElementById("cartTotal");
const checkoutForm = document.getElementById("checkoutForm");

// Renderizar Productos
function renderProducts(filterCategory = "todos") {
    menuGrid.innerHTML = "";
    
    const filteredProducts = filterCategory === "todos" 
        ? products 
        : products.filter(p => p.category === filterCategory);

    filteredProducts.forEach(product => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="card-img">
            <div class="card-body">
                <h3 class="card-title">${product.name}</h3>
                <p class="card-desc">${product.desc}</p>
            </div>
            <div class="card-footer">
                <span class="card-price">$${product.price.toLocaleString("es-AR")}</span>
                <button class="btn-card-add" onclick="openCustomizeModal(${product.id})">
                    Pedir
                </button>
            </div>
        `;
        menuGrid.appendChild(card);
    });
}

// Abrir Modal de Personalización
function openCustomizeModal(productId) {
    selectedProduct = products.find(p => p.id === productId);
    if (!selectedProduct) return;

    modalBurgerName.textContent = selectedProduct.name;
    modalBurgerDesc.textContent = selectedProduct.desc;
    modalPrice.textContent = `$${selectedProduct.price.toLocaleString("es-AR")}`;

    modalIngredientsList.innerHTML = "";
    selectedProduct.ingredients.forEach((ing, idx) => {
        const item = document.createElement("label");
        item.className = "ingredient-item";
        item.innerHTML = `
            <input type="checkbox" checked value="${ing}" id="ing-${idx}">
            <span>${ing}</span>
        `;
        modalIngredientsList.appendChild(item);
    });

    customizeModal.classList.add("active");
}

// Cerrar Modal
closeCustomizeModal.addEventListener("click", () => {
    customizeModal.classList.remove("active");
});

// Confirmar Agregar al Carrito desde el Modal (SIN ABRIR EL CARRITO AUTOMÁTICAMENTE)
confirmAddToCartBtn.addEventListener("click", () => {
    if (!selectedProduct) return;

    const checkboxes = modalIngredientsList.querySelectorAll("input[type='checkbox']");
    const removedIngredients = [];

    checkboxes.forEach(cb => {
        if (!cb.checked) {
            removedIngredients.push(cb.value);
        }
    });

    const cartItem = {
        cartItemId: Date.now(),
        id: selectedProduct.id,
        name: selectedProduct.name,
        price: selectedProduct.price,
        removedIngredients: removedIngredients
    };

    cart.push(cartItem);
    updateCartUI();
    customizeModal.classList.remove("active");
});

// Actualizar UI del Carrito
function updateCartUI() {
    cartBadge.textContent = cart.length;
    cartItemsContainer.innerHTML = "";

    let total = 0;

    cart.forEach(item => {
        total += item.price;
        const itemEl = document.createElement("div");
        itemEl.className = "cart-item";
        
        let removedText = item.removedIngredients.length > 0
            ? `<div class="cart-item-removed">Sin: ${item.removedIngredients.join(", ")}</div>`
            : "";

        itemEl.innerHTML = `
            <div>
                <div class="cart-item-title">${item.name}</div>
                ${removedText}
                <div class="cart-item-price">$${item.price.toLocaleString("es-AR")}</div>
            </div>
            <button class="remove-item-btn" onclick="removeFromCart(${item.cartItemId})">
                <i class="fa-solid fa-trash"></i>
            </button>
        `;
        cartItemsContainer.appendChild(itemEl);
    });

    cartTotal.textContent = `$${total.toLocaleString("es-AR")}`;
}

// Eliminar un producto del carrito
function removeFromCart(cartItemId) {
    cart = cart.filter(item => item.cartItemId !== cartItemId);
    updateCartUI();
}

// Control del Drawer del Carrito
function openCart() {
    cartDrawer.classList.add("active");
    cartOverlay.classList.add("active");
}

function closeCart() {
    cartDrawer.classList.remove("active");
    cartOverlay.classList.remove("active");
}

openCartBtn.addEventListener("click", openCart);
closeCartBtn.addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);

// Filtros por Categoría
categoryBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        categoryBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        renderProducts(btn.dataset.category);
    });
});

// Enviar Pedido por WhatsApp
checkoutForm.addEventListener("submit", (e) => {
    e.preventDefault();

    if (cart.length === 0) {
        alert("Tu carrito está vacío.");
        return;
    }

    const name = document.getElementById("custName").value.trim();
    const address = document.getElementById("custAddress").value.trim();
    const notes = document.getElementById("custNotes").value.trim();
    const payment = document.getElementById("custPayment").value;

    let total = cart.reduce((sum, item) => sum + item.price, 0);

    let message = `🍔 *NUEVO PEDIDO - BUDGER* 🍔\n\n`;
    message += `👤 *Nombre:* ${name}\n`;
    message += `📍 *Dirección:* ${address}\n`;
    if (notes) message += `📝 *Aclaraciones:* ${notes}\n`;
    message += `💳 *Pago:* ${payment}\n\n`;
    message += `🛒 *DETALLE DEL PEDIDO:*\n`;

    cart.forEach((item, index) => {
        message += `${index + 1}. *${item.name}* - $${item.price.toLocaleString("es-AR")}\n`;
        if (item.removedIngredients.length > 0) {
            message += `   ❌ _SIN: ${item.removedIngredients.join(", ")}_\n`;
        }
    });

    message += `\n💰 *TOTAL:* $${total.toLocaleString("es-AR")}`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodedMessage}`;

    window.open(whatsappUrl, "_blank");
});

// Inicialización
renderProducts();