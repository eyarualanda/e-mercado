document.addEventListener("DOMContentLoaded", () => {
    mostrarProductosEnCarrito();

    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('eliminar-producto')) {
            const productID = e.target.getAttribute('data-id');
            eliminarDelCarrito(productID);
        }
    });
});

const currentUser = getCurrentUser();
const carrito = currentUser.carrito;

document.getElementById('cart-container').addEventListener('click', function (e) {
    if (e.target.classList.contains('eliminar-producto')) {
        const productID = e.target.getAttribute('data-id');
        eliminarDelCarrito(productID);
    }
});

function actualizarCantidad(productID, cantidad) {
    const currentUser = getCurrentUser();
    
    if (!currentUser) return;

    const producto = currentUser.carrito.find(p => p.id === productID);

    if (!producto) return;
    producto.cantidad = Math.max(1, producto.cantidad + cantidad);
    document.getElementById(`cantidad-${productID}`).innerText = producto.cantidad;


    document.getElementById(`subtotal-${productID}`).innerText = `${producto.currency} ${(producto.cost * producto.cantidad).toFixed(2)}`;

   
    let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    usuarios = usuarios.map(usuario => usuario.email === currentUser.email ? currentUser : usuario);
    localStorage.setItem('usuarios', JSON.stringify(usuarios));

    // Recalcula y actualiza el total general
    actualizarTotal();
}

function eliminarDelCarrito(productID) {
    let currentUser = getCurrentUser();

    if (!currentUser) return;
    currentUser.carrito = currentUser.carrito.filter(
        producto => producto.id !== parseInt(productID)
    );

    let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    usuarios = usuarios.map(usuario => usuario.email === currentUser.email ? currentUser : usuario);
    localStorage.setItem('usuarios', JSON.stringify(usuarios));


    mostrarProductosEnCarrito();
    actualizarBadgeCarrito();

}

function mostrarProductosEnCarrito() {
    const currentUser = getCurrentUser();
    
    if (!currentUser || !currentUser.carrito) {
        return;
    }

    const carrito = currentUser.carrito;
    const cartContainer = document.getElementById('cart-container');
    cartContainer.innerHTML = '';

    if (carrito.length === 0) {
        cartContainer.innerHTML = '<p class="alert alert-light text-center">No hay productos en el carrito.</p>';
        document.getElementById('total-price').innerText = `${carrito[0]?.currency || '$'} 0.00`;
        document.getElementById('total-items').innerText = '0'; // Actualiza aquí si está vacío
        document.getElementById('cart-summary').classList += ' d-none'; // Actualiza aquí si está vacío
        return;
    }

    let total = 0;
    let cantidadTotal = 0; // Variable para contar el total de productos

    carrito.forEach(producto => {
        const productoHTML = `
            <div class="row mb-3" id="producto-${producto.id}">
                <div class="col-3">
                    <img src="${producto.images[0]}" class="img-fluid" alt="${producto.name}">
                </div>
                <div class="col-3">
                    <h5>${producto.name}</h5>
                    <p class="d-md-block d-none">${producto.description}</p>
                </div>
                <div class="btn-group btn-group-sm col-2 align-items-center">
                    <button class="btn btn-outline-secondary btn-sm" onclick="actualizarCantidad(${producto.id}, -1)">-</button>
                    <button class="btn btn-outline-secondary">
                    <span id="cantidad-${producto.id}">${producto.cantidad}</span>
                    </button>
                    <button class="btn btn-outline-secondary btn-sm" onclick="actualizarCantidad(${producto.id}, 1)">+</button>
                </div>
                <div class="col-3">
                    <p>${producto.currency} ${producto.cost}</p>
                    <p>Subtotal: <span id="subtotal-${producto.id}">${producto.currency} ${(producto.cost * producto.cantidad).toFixed(2)}</span></p>
                </div>
                <div class="col-1">
                    <button class="btn btn-danger eliminar-producto" data-id="${producto.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        
        cartContainer.innerHTML += productoHTML;
        total += producto.cost * producto.cantidad;
        cantidadTotal += producto.cantidad; // Suma la cantidad del producto actual
    });

    document.getElementById('total-price').innerText = `${carrito[0].currency} ${total.toFixed(2)}`;
    document.getElementById('total-items').innerText = cantidadTotal; // Actualiza la cantidad total de productos
}
