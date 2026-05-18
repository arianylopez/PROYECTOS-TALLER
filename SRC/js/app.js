let globalProducts = [];

document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById('catalog-container').innerHTML = '<p style="text-align:center; width:100%; grid-column: 1 / -1;">Cargando catálogo...</p>';

    document.getElementById('btn-toggle-cart').addEventListener('click', UI.toggleCart);
    document.getElementById('btn-close-cart').addEventListener('click', UI.toggleCart);

    try {
        globalProducts = await API.getProducts();
        UI.renderProducts(globalProducts);
    } catch (error) {
        document.getElementById('catalog-container').innerHTML = 
            '<p style="text-align:center; width:100%; grid-column: 1 / -1; color: var(--error-color); font-weight: bold;">Error de conexión, intente más tarde</p>';
        UI.showToast("Error de conexión, intente más tarde", "error");
    }
});