const CartService = require('../js/services/cartService.js');

describe('HU-04: Reserva temporal', () => {
    beforeEach(() => {
        CartService.cart = [];
        jest.clearAllMocks();
    });

    test('AC1: Al agregar un producto al carrito el stock debe reducirse temporalmente', async () => {
        // Arrange
        const mockProduct = { id: 'prod-123', name: 'Zapatillas', price: 250, stock: 10 };
        const quantityToAdd = 1;
        
        CartService.api = {
            reserveStock: jest.fn().mockResolvedValue(true)
        };

        // Act
        await CartService.addToCart(mockProduct, quantityToAdd);

        // Assert
        expect(CartService.cart.length).toBe(1);
        expect(CartService.cart[0].id).toBe('prod-123');
        
        expect(CartService.api.reserveStock).toHaveBeenCalledTimes(1);
        expect(CartService.api.reserveStock).toHaveBeenCalledWith('prod-123', quantityToAdd);
    });
})