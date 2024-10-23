const productID = PRODUCT_INFO_URL + localStorage.getItem('productID') + EXT_TYPE;

document.addEventListener("DOMContentLoaded", () => {
    mostrarProductosEnCarrito();

    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('eliminar-producto')) {
            const productID = e.target.getAttribute('data-id');
            eliminarDelCarrito(productID);
        }
    });
});

function mostrarProductosEnCarrito() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const cartContainer = document.getElementById('cart-container');
    cartContainer.innerHTML = '';

    if (carrito.length === 0) {
        cartContainer.innerHTML = '<p>No hay productos en el carrito.</p>';
        return;
    }

    let total = 0;

    carrito.forEach(producto => {
        const productoHTML = `
            <div class="row mb-3" id="producto-${producto.id}">
                <div class="col-3">
                    <img src="${producto.image}" class="img-fluid" alt="${producto.name}">
                </div>
                <div class="col-6">
                    <h5>${producto.name}</h5>
                    <p>${producto.currency} ${producto.cost}</p>
                    <p>Cantidad: ${producto.cantidad}</p>
                </div>
                <div class="col-3">
                    <button class="btn btn-danger eliminar-producto" data-id="${producto.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        cartContainer.innerHTML += productoHTML;
        total += producto.cost * producto.cantidad;
    });

    document.getElementById('total-price').innerText = `${carrito[0].currency} ${total.toFixed(2)}`;
}

function eliminarDelCarrito(productID) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    carrito = carrito.filter(producto => producto.id !== productID);
    localStorage.setItem('carrito', JSON.stringify(carrito));
    mostrarProductosEnCarrito();
}
