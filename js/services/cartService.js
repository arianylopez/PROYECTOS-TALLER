const CartService = {
    cart: [],
    
    api: {
        reserveStock: () => {} 
    },

    SHIPPING_RATES: {
        'recojo_tienda': 0,
        'domicilio': 20
    },
    deliveryMethod: 'recojo_tienda',
    shippingCost: 0,
    paymentMethod: 'efectivo',

    setDeliveryMethod(method) {
        this.deliveryMethod = method;
        this.shippingCost = this.SHIPPING_RATES[method] || 0;
        
        if (typeof UI !== 'undefined' && UI.renderCart) {
            UI.renderCart(this.cart);
        }
    },

    addToCart(arg1, arg2, quantityToAdd = 1) {
        const isObject = typeof arg1 === 'object' && arg1 !== null;
        const product = isObject ? arg1 : arg2.find(p => p.id === arg1);
        const qty = isObject ? (arg2 !== undefined ? arg2 : 1) : quantityToAdd;

        if (!product) return;

        const existingItem = this.cart.find(item => item.id === product.id);
        const projectedQty = existingItem ? existingItem.quantity + qty : qty;

        if (qty > product.stock) {
            if (typeof UI !== 'undefined' && UI.showToast) {
                UI.showToast("Límite alcanzado: No puedes agregar más unidades del stock.", "error");
            }
            return;
        }

        product.stock -= qty;

        if (this.api && typeof this.api.reserveStock === 'function') {
            this.api.reserveStock(product.id, qty);
        }

        if (existingItem) {
            existingItem.quantity = projectedQty;
        } else {
            this.cart.push({ ...product, quantity: qty, added_at: new Date() });
        }

        if (typeof UI !== 'undefined') {
            if (UI.renderCart) UI.renderCart(this.cart);
            if (UI.refreshStockDisplays) UI.refreshStockDisplays(product);
        }
    },

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        if (typeof UI !== 'undefined' && UI.renderCart) {
            UI.renderCart(this.cart);
        }
    },

    getSubtotal() {
        return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },

    getTotal() {
        return this.getSubtotal() + this.shippingCost;
    },

    setPaymentMethod(method) {
        this.paymentMethod = method;
    },

    confirmOrder() {
        if (this.cart.length === 0) {
            if (typeof UI !== 'undefined' && UI.showToast) UI.showToast("El carrito esta vacio", "error");
            return null;
        }

        const finalStatus = this.paymentMethod === 'efectivo' ? 'Pendiente de pago' : 'Pagado';
        
        this.cart = [];
        
        if (typeof UI !== 'undefined' && UI.renderCart) {
            UI.renderCart(this.cart);
        }

        return { 
            success: true, 
            status: finalStatus, 
            method: this.paymentMethod 
        };
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CartService;
}