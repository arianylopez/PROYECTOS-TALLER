const CartService = {
    cart: [],

    addToCart(productId, productsData, quantityToAdd = 1) {
        const product = productsData.find(p => p.id === productId);
        if (!product) return;

        const existingItem = this.cart.find(item => item.id === productId);
        
        if (existingItem) {
            if (existingItem.quantity + quantityToAdd <= product.stock) {
                existingItem.quantity += quantityToAdd;
            } else {
                UI.showToast("Límite alcanzado: No puedes agregar más unidades del stock.", "error");
                return;
            }
        } else {
            if (product.stock > 0 && quantityToAdd <= product.stock) {
                this.cart.push({ ...product, quantity: quantityToAdd, added_at: new Date() });
            }
        }
        UI.renderCart(this.cart);
    },

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        UI.renderCart(this.cart);
    },

    getTotal() {
        return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }
};