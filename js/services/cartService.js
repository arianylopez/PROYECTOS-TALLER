const CartService = {
    cart: [],
    
    api: {
        reserveStock: () => {} 
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
                UI.showToast("Limite alcanzado: No se puede agregar mas unidades del stock", "error");
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

    getTotal() {
        return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CartService;
}