const CartService = {
    cart: [],
    
    api: {
        reserveStock: () => {} 
    },

    addToCart(arg1, arg2, quantityToAdd = 1) {
        let product;
        let qty;

        if (typeof arg1 === 'object' && arg1 !== null) {
            product = arg1;
            qty = arg2 !== undefined ? arg2 : 1;
        } else {
            product = arg2.find(p => p.id === arg1);
            qty = quantityToAdd;
        }

        if (!product) return;

        const existingItem = this.cart.find(item => item.id === product.id);
        
        if (existingItem) {
            if (existingItem.quantity + qty <= product.stock) {
                existingItem.quantity += qty;
            } else {
                if (typeof UI !== 'undefined' && UI.showToast) {
                    UI.showToast("Límite alcanzado: No puedes agregar más unidades del stock.", "error");
                }
                return;
            }
        } else {
            if (product.stock > 0 && qty <= product.stock) {
                this.cart.push({ ...product, quantity: qty, added_at: new Date() });
            }
        }

        if (this.api && typeof this.api.reserveStock === 'function') {
            this.api.reserveStock(product.id, qty);
        }

        if (typeof UI !== 'undefined' && UI.renderCart) {
            UI.renderCart(this.cart);
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