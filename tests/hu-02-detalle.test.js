const UI = require('../SRC/js/components/ui.js');

describe('HU-02: Detalle de Producto', () => {

    beforeEach(() => {
        document.body.innerHTML = `
            <div class="hero"></div>
            <div id="catalog-section"></div>
            
            <section id="product-detail-section" class="hidden">
                <img id="detail-image" src="" alt="">
                <h1 id="detail-name"></h1>
                <h2 id="detail-price"></h2>
                <p id="detail-description"></p>
                <p class="stock-info"><span id="detail-stock">0</span> disponibles</p>
                
                <div class="quantity-selector">
                    <button id="btn-minus">−</button>
                    <input type="number" id="detail-quantity" value="1">
                    <button id="btn-plus">+</button>
                </div>
                <button id="btn-add-detail">🛒 Agregar al Carrito</button>
            </section>
        `;

        window.scrollTo = jest.fn();
    });

    test('1: Debe mostrar la cantidad de stock disponible en tiempo real al cargar la vista', () => {
        // Arrange
        global.globalProducts = [
            { id: 'prod-1', name: 'Teclado', price: 300, stock: 5, description: 'Teclado mecánico', image_url: 'img.jpg' }
        ];

        // Act
        UI.showProductDetail('prod-1');

        // Assert
        const detailStock = document.getElementById('detail-stock');
        expect(detailStock.textContent).toBe('5');
    });

    test('2: No debe permitir superar el número de stock actual al usar los botones', () => {
        // Arrange
        global.globalProducts = [
            { id: 'prod-2', name: 'Mouse', price: 150, stock: 2, description: 'Mouse gamer', image_url: 'img.jpg' }
        ];
        UI.showProductDetail('prod-2');
        
        const inputQuantity = document.getElementById('detail-quantity');
        const btnPlus = document.getElementById('btn-plus');

        UI.updateQuantity(1);
        expect(inputQuantity.value).toBe('2');
        expect(btnPlus.disabled).toBe(true);

        UI.updateQuantity(1);
        expect(inputQuantity.value).toBe('2'); 
    });

    test('AC3: Debe mostrar el aviso visual "Última unidad disponible" si queda solo 1 en stock', () => {
        // Arrange
        global.globalProducts = [
            { id: 'prod-3', name: 'Monitor', price: 1200, stock: 1, description: 'Monitor 24', image_url: 'img.jpg' }
        ];

        // Act
        UI.showProductDetail('prod-3');

        // Assert
        const stockInfoContainer = document.querySelector('.stock-info');
        expect(stockInfoContainer.textContent).toContain('¡Última unidad disponible!');
        
        expect(document.getElementById('btn-plus').disabled).toBe(true);
    });

    test('AC4: Debe restablecer automáticamente a "1" si se ingresa un número negativo', () => {
        // Arrange
        global.globalProducts = [
            { id: 'prod-4', name: 'Audífonos', price: 200, stock: 10, description: 'Audífonos Bluetooth', image_url: 'img.jpg' }
        ];
        UI.showProductDetail('prod-4');
        const inputQuantity = document.getElementById('detail-quantity');

        // Act
        inputQuantity.value = '-2';
        UI.validateManualQuantity();

        // Assert
        expect(inputQuantity.value).toBe('1');
        
        inputQuantity.value = 'abc';
        UI.validateManualQuantity();
        expect(inputQuantity.value).toBe('1');

        inputQuantity.value = '50';
        UI.validateManualQuantity();
        expect(inputQuantity.value).toBe('10'); 
    });

});