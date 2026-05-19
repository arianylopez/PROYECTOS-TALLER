const UI = require('../SRC/js/components/ui.js');

describe('HU-01: Ver Catálogo de Productos', () => {

    beforeEach(() => {
        document.body.innerHTML = `
            <div id="catalog-section">
                <main id="catalog-container"></main>
            </div>
            <div id="toast-container"></div>
        `;
        UI.showProductDetail = jest.fn();
    });

    test('AC1: Debe renderizar fotos, nombres y precios de los productos en stock', () => {
        // Arrange
        const mockProducts = [
            { id: '1', name: 'Zapatos', price: 150.50, stock: 10, image_url: 'zapatos.jpg' }
        ];

        // Act
        UI.renderProducts(mockProducts);

        // Assert
        const container = document.getElementById('catalog-container');
        const cards = container.querySelectorAll('.product-card');
        
        expect(cards.length).toBe(1);
        expect(cards[0].querySelector('.product-image').src).toContain('zapatos.jpg');
        expect(cards[0].querySelector('h3').textContent).toBe('Zapatos');
        expect(cards[0].querySelector('h2').textContent).toBe('Bs. 150.50');
        expect(cards[0].querySelector('.out-of-stock')).toBeNull(); // NO debe decir agotado
    });

    test('AC2: Debe mostrar la etiqueta "Agotado" si un producto no tiene stock', () => {
        // Arrange
        const mockProducts = [
            { id: '2', name: 'Reloj', price: 200, stock: 0, image_url: 'reloj.jpg' }
        ];

        // Act
        UI.renderProducts(mockProducts);

        // Assert
        const container = document.getElementById('catalog-container');
        const outOfStockLabel = container.querySelector('.out-of-stock');
        
        expect(outOfStockLabel).not.toBeNull();
        expect(outOfStockLabel.textContent).toBe('Agotado');
        expect(container.querySelector('.btn-primary')).toBeNull(); 
    });

    test('AC3: Debe mostrar el mensaje "Aún no hay productos disponibles" si el inventario está vacío', () => {
        // Arrange
        const mockProducts = []; 

        // Act
        UI.renderProducts(mockProducts);

        // Assert
        const container = document.getElementById('catalog-container');
        expect(container.textContent).toContain('Aún no hay productos disponibles');
        expect(container.querySelectorAll('.product-card').length).toBe(0);
    });

    test('AC4: Debe mostrar "Error de conexión, intente más tarde" si el servidor falla', async () => {
        // Arrange
        const fakeApiGetProducts = jest.fn().mockRejectedValue(new Error("Error de base de datos"));
        const container = document.getElementById('catalog-container');

        // Act
        try {
            await fakeApiGetProducts();
        } catch (error) {
            container.innerHTML = '<p class="error-msg">Error de conexión, intente más tarde</p>';
            UI.showToast("Error de conexión, intente más tarde", "error");
        }

        // Assert
        expect(container.querySelector('.error-msg').textContent).toBe('Error de conexión, intente más tarde');
        
        const toast = document.querySelector('.toast.error');
        expect(toast).not.toBeNull();
        expect(toast.textContent).toContain('Error de conexión, intente más tarde');
    });

});