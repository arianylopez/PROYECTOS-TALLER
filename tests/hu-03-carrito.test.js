const CartService = require('../SRC/js/services/cartService.js');
const UI = require('../SRC/js/components/ui.js');

global.CartService = CartService;
global.UI = UI;

describe('HU-03: Agregar al Carrito', () => {

    let mockProducts;

    beforeEach(() => {
        document.body.innerHTML = `
            <div id="cart-items-container"></div>
            <span id="cart-count">0</span>
            <span id="cart-total">0.00</span>
            <div id="cart-sidebar" class="hidden"></div>
            <div id="toast-container"></div>
            
            <div class="hero"></div>
            <div id="catalog-section"></div>
            <section id="product-detail-section" class="hidden">
                <img id="detail-image">
                <h1 id="detail-name"></h1>
                <h2 id="detail-price"></h2>
                <p id="detail-description"></p>
                <p class="stock-info"><span id="detail-stock">0</span></p>
                <input type="number" id="detail-quantity" value="1">
                <button id="btn-minus"></button>
                <button id="btn-plus"></button>
                <button id="btn-add-detail">🛒 Agregar al Carrito</button>
            </section>
        `;

        mockProducts = [
            { id: 'prod-1', name: 'Laptop', price: 5000, stock: 5, image_url: 'laptop.jpg' }
        ];

        CartService.cart = [];
        
        window.scrollTo = jest.fn();
    });

    test('1: Debe sumar el producto a la lista si hay stock suficiente', () => {
        // Act
        CartService.addToCart('prod-1', mockProducts, 2);

        // Assert
        expect(CartService.cart.length).toBe(1);
        expect(CartService.cart[0].id).toBe('prod-1');
        expect(CartService.cart[0].quantity).toBe(2);
        
        expect(document.getElementById('cart-count').textContent).toBe('2');
        expect(document.getElementById('cart-total').textContent).toBe('10000.00');
    });

    test('2: No debe agregar al carrito si se intenta ingresar una cantidad mayor al stock', () => {
        // Act
        CartService.addToCart('prod-1', mockProducts, 10);

        // Assert
        expect(CartService.cart.length).toBe(0);
        expect(document.getElementById('cart-count').textContent).toBe('0');
    });

    test('3: Debe avisar con "Límite alcanzado" si intento superar el stock de un producto que ya está en el carrito', () => {
        const toastSpy = jest.spyOn(UI, 'showToast');

        // Act 
        CartService.addToCart('prod-1', mockProducts, 5);
        expect(CartService.cart[0].quantity).toBe(5);

        // Act 
        CartService.addToCart('prod-1', mockProducts, 1);

        expect(CartService.cart[0].quantity).toBe(5);
        expect(toastSpy).toHaveBeenCalledWith("Límite alcanzado: No puedes agregar más unidades del stock.", "error");
        
        toastSpy.mockRestore(); 
    });

    test('4: Debe registrar la acción solo una vez al hacer doble clic rápido en "Agregar"', () => {
        jest.useFakeTimers();

        global.globalProducts = mockProducts;
        UI.showProductDetail('prod-1');
        
        const btnAdd = document.getElementById('btn-add-detail');
        const addToCartSpy = jest.spyOn(CartService, 'addToCart');

        // Act
        btnAdd.click(); // Primer clic entra
        btnAdd.click(); // El segundo no debería hacer nada porque el botón se deshabilita
        btnAdd.click(); // El tercero tampoco

        // Assert
        expect(addToCartSpy).toHaveBeenCalledTimes(1);
        
        // Assert 
        expect(btnAdd.disabled).toBe(true);

        // Act
        jest.advanceTimersByTime(800);

        // Assert
        expect(btnAdd.disabled).toBe(false);

        addToCartSpy.mockRestore();
        jest.useRealTimers(); 
    });

    test('5. Debe calcular el total general correctamente al agregar distintos productos', () => {
        const mixProducts = [
            { id: 'p1', name: 'A', price: 10, stock: 5 },
            { id: 'p2', name: 'B', price: 20, stock: 5 }
        ];

        CartService.addToCart('p1', mixProducts, 2); 
        CartService.addToCart('p2', mixProducts, 1); 

        expect(CartService.getTotal()).toBe(40);
        expect(document.getElementById('cart-total').textContent).toBe('40.00');
    });

});