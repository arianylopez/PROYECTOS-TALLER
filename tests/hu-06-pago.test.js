const CartService = require('../js/services/cartService.js');

describe('HU-07: Pagar en efectivo contra entrega', () => {
    beforeEach(() => {
        CartService.cart = [];
        CartService.paymentMethod = '';
        global.UI = { renderCart: jest.fn(), showToast: jest.fn() };
    });

    test('AC1: Al elegir efectivo y finalizar, la orden se marca como Pendiente', () => {
        // Arrange
        CartService.cart.push({ id: 'prod-1', name: 'Gorra', price: 50, quantity: 1 });
        CartService.setPaymentMethod('efectivo');

        // Act
        const orderResult = CartService.confirmOrder();

        // Assert
        expect(orderResult.status).toBe('Pendiente de pago');
        expect(orderResult.method).toBe('efectivo');
        expect(CartService.cart.length).toBe(0); 
    });
});