const CartService = require('../js/services/cartService.js');

describe('HU-05: Elegir método de entrega', () => {
    beforeEach(() => {
        CartService.cart = [];
        CartService.shippingCost = 0;
        CartService.deliveryMethod = '';
        global.UI = { renderCart: jest.fn() };
    });

    test('AC1: Al elegir "Recojo en tienda", el costo de envio debe ser 0 y mostrarse en el total', () => {
        // Arrange
        CartService.cart.push({ id: 'prod-1', name: 'Gorra', price: 50, quantity: 1 });
        
        // Act
        CartService.setDeliveryMethod('recojo_tienda');

        // Assert
        expect(CartService.deliveryMethod).toBe('recojo_tienda');
        expect(CartService.shippingCost).toBe(0);
        expect(CartService.getTotal()).toBe(50); 
    });
});