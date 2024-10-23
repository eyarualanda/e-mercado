document.addEventListener("DOMContentLoaded", () => {
    mostrarProductosEnCarrito();
});

var getCurrentUser = function getCurrentUser() {
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const emailActual = localStorage.getItem('usuario');
    return usuarios.find(usuario => usuario.email === emailActual);
}

function mostrarProductosEnCarrito() {
    const currentUser = getCurrentUser();
    
    if (!currentUser || !currentUser.carrito) {
        return; // Si no hay usuario o carrito, no hacer nada
    }

    const carrito = currentUser.carrito;
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
                    <img src="${producto.images[0]}" class="img-fluid" alt="${producto.name}">
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
    let currentUser = getCurrentUser();

    if (!currentUser) return;

    // Filtrar el producto eliminando el que coincide con el ID
    currentUser.carrito = currentUser.carrito.filter(
        producto => producto.id !== parseInt(productID)
    );

    // Guardar el carrito actualizado en localStorage
    let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    usuarios = usuarios.map(usuario => usuario.email === currentUser.email ? currentUser : usuario);
    localStorage.setItem('usuarios', JSON.stringify(usuarios));

    // Actualizar la vista del carrito
    mostrarProductosEnCarrito();
}

document.getElementById('cart-container').addEventListener('click', function (e) {
    if (e.target.classList.contains('eliminar-producto')) {
        const productID = e.target.getAttribute('data-id');
        eliminarDelCarrito(productID);
    }
});
