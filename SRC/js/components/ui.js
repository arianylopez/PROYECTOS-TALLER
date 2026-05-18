const UI = {
    currentDetailProduct: null,

    renderProducts(products) {
        const container = document.getElementById('catalog-container');
        container.innerHTML = ''; 

        if (products.length === 0) {
            container.innerHTML = '<p style="text-align:center; width:100%; grid-column: 1 / -1; color: #6b7280; font-size: 1.1rem;">Aún no hay productos disponibles</p>';
            return;
        }

        for (let i = 0; i < products.length; i++) {
            const product = products[i];
            const card = document.createElement('div');
            card.className = 'product-card';
            
            const isOutOfStock = product.stock === 0;
            const buttonHtml = isOutOfStock 
                ? `<p class="out-of-stock">Agotado</p>`
                : `<button class="btn-primary" onclick="UI.showProductDetail('${product.id}')">Ver Detalle</button>
                   <p style="font-size: 0.8rem; color: #6b7280; margin-top:0.5rem; text-align:center;">Stock: ${product.stock}</p>`;

            card.innerHTML = `
                <img src="${product.image_url}" alt="${product.name}" class="product-image" onclick="UI.showProductDetail('${product.id}')">
                <h3 style="margin: 0 0 0.5rem 0; cursor:pointer;" onclick="UI.showProductDetail('${product.id}')">${product.name}</h3>
                <h2 style="margin: 0.5rem 0 1rem 0; color: var(--primary-color);">Bs. ${product.price.toFixed(2)}</h2>
                ${buttonHtml}
            `;
            container.appendChild(card);
        }
    },

    showProductDetail(productId) {
        this.currentDetailProduct = globalProducts.find(p => p.id === productId);
        const p = this.currentDetailProduct;

        if (!p) return;

        document.querySelector('.hero').classList.add('hidden');
        document.getElementById('catalog-section').classList.add('hidden');
        document.getElementById('product-detail-section').classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });

        document.getElementById('detail-image').src = p.image_url;
        document.getElementById('detail-name').textContent = p.name;
        document.getElementById('detail-price').textContent = `Bs. ${p.price.toFixed(2)}`;
        document.getElementById('detail-description').textContent = p.description || 'Sin descripción detallada.';
        
        const stockContainer = document.querySelector('.stock-info');
        if (p.stock === 1) {
            stockContainer.innerHTML = `<span id="detail-stock">1</span> disponibles <span style="color: var(--primary-color); font-weight: bold; margin-left: 8px;">¡Última unidad disponible!</span>`;
        } else {
            stockContainer.innerHTML = `<span id="detail-stock">${p.stock}</span> disponibles`;
        }

        const qtyInput = document.getElementById('detail-quantity');
        const btnAdd = document.getElementById('btn-add-detail');
        const btnPlus = document.getElementById('btn-plus');
        const btnMinus = document.getElementById('btn-minus');

        if (p.stock === 0) {
            qtyInput.value = 0;
            btnAdd.textContent = "Agotado";
            btnAdd.disabled = true;
            btnPlus.disabled = true;
            btnMinus.disabled = true;
        } else {
            qtyInput.value = 1;
            btnAdd.textContent = "🛒 Agregar al Carrito";
            btnAdd.disabled = false;
            btnMinus.disabled = true; 
            btnPlus.disabled = (p.stock <= 1); 

            btnAdd.onclick = () => {
                btnAdd.disabled = true; 
                
                const qty = parseInt(qtyInput.value);
                CartService.addToCart(p.id, globalProducts, qty);
                UI.toggleCart(); 
                
                setTimeout(() => {
                    btnAdd.disabled = false;
                }, 800);
            };
        }
    },

    validateManualQuantity() {
        const input = document.getElementById('detail-quantity');
        let val = parseInt(input.value);
        const maxStock = this.currentDetailProduct.stock;

        if (isNaN(val) || val < 1) {
            input.value = 1;
        } else if (val > maxStock) {
            input.value = maxStock;
        }

        document.getElementById('btn-minus').disabled = (parseInt(input.value) <= 1);
        document.getElementById('btn-plus').disabled = (parseInt(input.value) >= maxStock);
    },

    showCatalog() {
        document.querySelector('.hero').classList.remove('hidden');
        document.getElementById('catalog-section').classList.remove('hidden');
        document.getElementById('product-detail-section').classList.add('hidden');
    },

    updateQuantity(change) {
        const input = document.getElementById('detail-quantity');
        let currentVal = parseInt(input.value);
        const maxStock = this.currentDetailProduct.stock;

        let newVal = currentVal + change;

        if (newVal >= 1 && newVal <= maxStock) {
            input.value = newVal;
        }

        document.getElementById('btn-minus').disabled = (input.value <= 1);
        document.getElementById('btn-plus').disabled = (input.value >= maxStock);
    },

    toggleCart() {
        const sidebar = document.getElementById('cart-sidebar');
        sidebar.classList.toggle('hidden');
    },

    renderCart(cartItems) {
        const container = document.getElementById('cart-items-container');
        const countSpan = document.getElementById('cart-count');
        const totalSpan = document.getElementById('cart-total');
        
        container.innerHTML = '';
        let totalItems = 0;

        cartItems.forEach(item => {
            totalItems += item.quantity;
            const div = document.createElement('div');
            div.style.display = 'flex';
            div.style.justifyContent = 'space-between';
            div.style.alignItems = 'center';
            div.style.marginBottom = '1rem';
            div.style.borderBottom = '1px solid #e5e7eb';
            div.style.paddingBottom = '0.5rem';
            
            div.innerHTML = `
                <div>
                    <h4 style="margin: 0; color: var(--text-color);">${item.name}</h4>
                    <p style="margin: 0; color: #6b7280; font-size: 0.9rem;">Bs. ${item.price.toFixed(2)} x ${item.quantity}</p>
                </div>
                <button onclick="CartService.removeFromCart('${item.id}')" style="background: none; border: none; color: var(--error-color); cursor: pointer; font-size: 1.2rem;">🗑️</button>
            `;
            container.appendChild(div);
        });

        countSpan.textContent = totalItems;
        totalSpan.textContent = CartService.getTotal().toFixed(2);
    },

    showToast(message, type = 'error') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'error' ? '⚠️' : '✅';

        toast.innerHTML = `<span class="toast-icon">${icon}</span> <span>${message}</span>`;
        
        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('fade-out');
            toast.addEventListener('animationend', () => toast.remove());
        }, 3500);
    },
};