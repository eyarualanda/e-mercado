document.addEventListener("DOMContentLoaded", () => {
    mostrarProductosEnCarrito(); // Muestra productos del carrito en la página.
    document.getElementById('cart-container').addEventListener('click', manejoDeClicksEnCarrito); // Agrega escucha de clics en el contenedor del carrito.
});

// Maneja los clics en el carrito, eliminando productos cuando se presiona el botón correspondiente.
function manejoDeClicksEnCarrito(e) {
    if (e.target.classList.contains('eliminar-producto')) { // Verifica si el elemento tiene la clase 'eliminar-producto'.
        const productID = e.target.getAttribute('data-id'); // Obtiene el ID del producto.
        eliminarDelCarrito(productID); // Llama a la función para eliminar el producto.
    }
}

// Actualiza la cantidad de un producto específico en el carrito y el total general.
function actualizarCantidad(productID, cantidad) {
    const currentUser = getCurrentUser(); // Obtiene el usuario actual.
    if (!currentUser) return; // Si no hay usuario, detiene la ejecución.

    const producto = currentUser.carrito.find(p => p.id === productID); // Busca el producto en el carrito.
    if (!producto) return; // Si el producto no existe, termina la función.

    producto.cantidad = Math.max(1, producto.cantidad + cantidad); // Actualiza la cantidad (mínimo 1).
    document.getElementById(`cantidad-${productID}`).innerText = producto.cantidad; // Actualiza la cantidad en la UI.
    document.getElementById(`subtotal-${productID}`).innerText = `${producto.currency} ${(producto.cost * producto.cantidad).toFixed(2)}`; // Actualiza el subtotal.

    actualizarLocalStorage(currentUser); // Guarda el estado del carrito en localStorage.
    actualizarTotal(); // Recalcula el total general del carrito.
}

// Elimina un producto del carrito según su ID y actualiza el almacenamiento y la interfaz.
function eliminarDelCarrito(productID) {
    const currentUser = getCurrentUser(); // Obtiene el usuario actual.
    if (!currentUser) return; // Si no hay usuario, detiene la ejecución.

    // Filtra el producto a eliminar del carrito.
    currentUser.carrito = currentUser.carrito.filter(producto => producto.id !== parseInt(productID));
    actualizarLocalStorage(currentUser); // Guarda el carrito actualizado en localStorage.

    mostrarProductosEnCarrito(); // Vuelve a mostrar el carrito actualizado en la página.
    actualizarBadgeCarrito(); // Actualiza la insignia del carrito (si existe en la UI).
}

// Muestra los productos del carrito en el contenedor designado en la UI.
function mostrarProductosEnCarrito() {
    const currentUser = getCurrentUser(); // Obtiene el usuario actual.
    const cartContainer = document.getElementById('cart-container'); // Elemento del DOM para mostrar el carrito.
    cartContainer.innerHTML = ''; // Limpia el contenido anterior.

    // Verifica si el carrito está vacío y muestra un mensaje en caso afirmativo.
    if (!currentUser || !currentUser.carrito || currentUser.carrito.length === 0) {
        mostrarCarritoVacio();
        return;
    }

    let total = 0; // Inicializa el total general del carrito.
    let cantidadTotal = 0; // Inicializa el contador de productos.

    // Itera sobre cada producto del carrito y genera su HTML.
    currentUser.carrito.forEach(producto => {
        const productoHTML = `
            <div class="row my-2" id="producto-${producto.id}">

                <div class="col-6">
                    <div class="row">
                        <div class="col-6">
                            <img src="${producto.images[0]}" class="img-fluid" alt="${producto.name}">
                        </div>

                        <div class="col-6">
                            <h5>${producto.name}</h5>
                            <p class="d-md-block d-none">${producto.description}</p>
                        </div>
                    </div>
                </div>

                <div class="col-2 text-center">
                    <p class="fw-semibold">Cantidad:</p>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-secondary btn-sm" onclick="actualizarCantidad(${producto.id}, -1)">-</button>
                        <button class="btn btn-outline-secondary">
                            <span id="cantidad-${producto.id}">${producto.cantidad}</span>
                        </button>
                        <button class="btn btn-outline-secondary btn-sm" onclick="actualizarCantidad(${producto.id}, 1)">+</button>
                    </div>
                </div>

                <div class="col-3">
                    <p class="fw-semibold">Precio:</p>
                    <p>${producto.currency} ${producto.cost}</p>
                    <p>Subtotal: <span id="subtotal-${producto.id}">${producto.currency} ${(producto.cost * producto.cantidad).toFixed(2)}</span></p>
                </div>
                <div class="col-1">
                    <button class="btn btn-outline-secondary eliminar-producto" data-id="${producto.id}">
                        <i class="fas fa-trash fa-sm"></i>
                    </button>
                </div>
            </div>
        `;
        
        cartContainer.innerHTML += productoHTML; // Agrega el producto al contenedor del carrito.
        total += producto.cost * producto.cantidad; // Acumula el costo total.
        cantidadTotal += producto.cantidad; // Acumula la cantidad total de productos.
    });

    // Actualiza el total y la cantidad total en la interfaz.
    document.getElementById('total-price').innerText = `${currentUser.carrito[0].currency} ${total.toFixed(2)}`;
    document.getElementById('total-items').innerText = cantidadTotal;
}

// Muestra un mensaje de carrito vacío y oculta secciones innecesarias.
function mostrarCarritoVacio() {
    document.getElementById('alertaCarrito').innerHTML = '<p class="alert alert-light text-center">No hay productos en el carrito.</p>';
    document.getElementById('total-price').innerText = '$ 0.00';
    document.getElementById('total-items').innerText = '0';
    document.getElementById('cart-summary').classList.add('d-none');
    document.getElementById('cart-container').classList.add('d-none');
}

// Actualiza la información del usuario en localStorage.
function actualizarLocalStorage(currentUser) {
    let usuarios = JSON.parse(localStorage.getItem('usuarios')) || []; // Obtiene todos los usuarios.
    usuarios = usuarios.map(usuario => usuario.email === currentUser.email ? currentUser : usuario); // Actualiza solo el usuario actual.
    localStorage.setItem('usuarios', JSON.stringify(usuarios)); // Guarda los cambios en localStorage.
}

// Recalcula y actualiza el total general y la cantidad total de productos en el carrito en la interfaz.
function actualizarTotal() {
    const currentUser = getCurrentUser(); // Obtiene el usuario actual.
    if (!currentUser || !currentUser.carrito) return; // Si no hay usuario o carrito, detiene la función.

    let total = 0; // Inicializa el total en dinero.
    let cantidadTotal = 0; // Inicializa la cantidad total de productos.

    // Itera sobre los productos del carrito para calcular el total y la cantidad total.
    currentUser.carrito.forEach(producto => {
        total += producto.cost * producto.cantidad; // Suma el subtotal de cada producto.
        cantidadTotal += producto.cantidad; // Suma la cantidad de cada producto.
    });

    // Actualiza el total en la interfaz con el símbolo de moneda adecuado.
    document.getElementById('total-price').innerText = `${currentUser.carrito[0]?.currency || '$'} ${total.toFixed(2)}`;

    // Actualiza la cantidad total de productos en la interfaz.
    document.getElementById('total-items').innerText = cantidadTotal;
}