document.addEventListener("DOMContentLoaded", () => {
    mostrarProductosEnCarrito(); // Muestra productos del carrito en la página.
    document.getElementById('cart-container').addEventListener('click', manejoDeClicksEnCarrito); // Agrega escucha de clics en el contenedor del carrito.
});

// Clave de API y URL para ExchangeRate-API (reemplaza con tu clave).
const API_KEY = 'c21e93603f7dead2043de597';
const API_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`;

let tasaCambioUSDToUYU = 40; // Tasa de cambio predeterminada (por si falla la API).
let monedaActual = 'UYU'; // Moneda predeterminada.

// Escucha el evento DOMContentLoaded para iniciar.
document.addEventListener("DOMContentLoaded", async () => {
    mostrarProductosEnCarrito();
    await obtenerTasaCambio(); // Cargar tasa de cambio al inicio.

    // Agregar eventos para los botones de cambio de moneda.
    document.getElementById('currency-uyu').addEventListener('click', () => cambiarMoneda('UYU'));
    document.getElementById('currency-usd').addEventListener('click', () => cambiarMoneda('USD'));
});

// Obtiene la tasa de cambio actual desde la API.
async function obtenerTasaCambio() {
    try {
        const respuesta = await fetch(API_URL);
        const datos = await respuesta.json();

        // Si la respuesta es correcta, guarda la tasa de cambio.
        tasaCambioUSDToUYU = datos.conversion_rates.UYU;
        console.log(`Tasa de cambio actualizada: 1 USD = ${tasaCambioUSDToUYU} UYU`);
    } catch (error) {
        console.error('Error al obtener la tasa de cambio:', error);
        alert('No se pudo actualizar la tasa de cambio. Usando tasa predeterminada.');
    }
}

// Cambia la moneda seleccionada y actualiza los totales.
function cambiarMoneda(nuevaMoneda) {
    monedaActual = nuevaMoneda;
    actualizarTotal(); // Recalcula el total en la nueva moneda.
}

// Convierte un valor entre USD y UYU según la moneda actual.
function convertirMoneda(valor, monedaProducto) {
    if (monedaActual === 'USD') {
        return monedaProducto === 'USD' ? valor : valor / tasaCambioUSDToUYU;
    } else {
        return monedaProducto === 'UYU' ? valor : valor * tasaCambioUSDToUYU;
    }
}

// Recalcula y actualiza el total del carrito en la interfaz.
function actualizarTotal() {
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.carrito) return;

    let total = 0;
    let cantidadTotal = 0;

    // Recorre los productos del carrito para calcular el total convertido.
    currentUser.carrito.forEach(producto => {
        const subtotalConvertido = convertirMoneda(producto.cost * producto.cantidad, producto.currency);
        total += subtotalConvertido;
        cantidadTotal += producto.cantidad;
    });

    // Actualiza el total y la cantidad en la UI.
    const simboloMoneda = monedaActual === 'USD' ? 'USD' : 'UYU';
    document.getElementById('total-price').innerText = `${simboloMoneda} ${total.toFixed(2)}`;
    document.getElementById('total-items').innerText = cantidadTotal;
}


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
    actualizarBadgeCarrito(); // Actualiza la insignia del carrito (si existe en la UI).
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

        <div class="col-12">
            <div class="row my-2" id="producto-${producto.id}">
                <div class="col-12 col-md-6">
                    <div class="row">
                        <div class="col-6">
                            <img src="${producto.images[0]}" class="img-fluid mb-4" alt="${producto.name}">
                        </div>

                        <div class="col-6">
                            <div class="row">
                                <div class="col-8">
                                    <h5>${producto.name}</h5>
                                </div>
                                <div class="col-2 d-block d-md-none">
                                    <button class="btn btn-outline-secondary eliminar-producto" data-id="${producto.id}">
                                        <i class="fas fa-trash fa-sm"></i>
                                    </button>
                                </div>
                                <p class="d-md-block d-none">${producto.description}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-12 col-md-5">
                    <div class="row">
                        <div class="col-6 text-center">
                            <p class="fw-semibold">Cantidad:</p>
                            <div class="btn-group btn-group-sm">
                                <button class="btn btn-secondary btn-sm btn-no-transition" onclick="actualizarCantidad(${producto.id}, -1)">-</button>
                                <button class="btn btn-secondary btn-no-transition">
                                    <span id="cantidad-${producto.id}">${producto.cantidad}</span>
                                </button>
                                <button class="btn btn-secondary btn-sm btn-no-transition" onclick="actualizarCantidad(${producto.id}, 1)">+</button>
                            </div>
                        </div>

                        <div class="col-6">
                            <p class="fw-semibold">Precio:</p>
                            <p>${producto.currency} ${producto.cost}</p>

                            <p class="d-none d-md-block">Subtotal: <span id="subtotal-${producto.id}">${producto.currency} ${(producto.cost * producto.cantidad).toFixed(2)}</span></p>
                        </div>
                    </div>
                </div>

                <div class="col-1 d-none d-md-block">
                    <button class="btn btn-outline-secondary eliminar-producto" data-id="${producto.id}">
                        <i class="fas fa-trash fa-sm"></i>
                    </button>
                </div>
            </div>
        </div>
        <hr class="mb-4">
        
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
document.addEventListener("DOMContentLoaded", function() {
    // Selección de botones y elementos
    const premiumButton = document.getElementById("premiumShipping");
    const expressButton = document.getElementById("expressShipping");
    const standardButton = document.getElementById("standardShipping");
    const siguienteButton = document.getElementById("siguienteButton");
    const shippingTypeDisplay = document.getElementById("selected-shipping");
    const errorMessage = document.getElementById("error-message");

    let selectedShipping = null; // Variable para almacenar el tipo de envío seleccionado

    // Función para actualizar el tipo de envío seleccionado
    function selectShipping(type, costPercentage) {
        selectedShipping = { type, costPercentage };
        shippingTypeDisplay.innerText = `Tipo de Envío: ${type}`;
        errorMessage.innerText = ""; // Limpiar mensaje de error si ya se seleccionó un envío
    }

    // Asignar acciones a cada botón de envío
    premiumButton.addEventListener("click", function() {
        selectShipping("Premium", 0.15);
    });
    expressButton.addEventListener("click", function() {
        selectShipping("Express", 0.07);
    });
    standardButton.addEventListener("click", function() {
        selectShipping("Standard", 0.05);
    });

    // Acción para el botón "Siguiente"
    siguienteButton.addEventListener("click", function() {
        if (selectedShipping) {
            // Si hay un tipo de envío seleccionado, cambia a la siguiente pestaña
            const nextTab = new bootstrap.Tab(document.getElementById('shipping-address-tab'));
            nextTab.show();
        } else {
            // Mostrar mensaje de error si no se seleccionó ningún tipo de envío
            errorMessage.innerText = "Por favor, selecciona un tipo de envío antes de continuar.";
        }
    });
});
// Obtener el botón y el formulario
const siguienteButton = document.getElementById("nextButton");
const shippingAddressForm = document.getElementById("shippingAddressForm");
const errorMessage = document.getElementById("error-message");

// Función para validar el formulario de dirección
function validateShippingAddress() {
    const fullName = document.getElementById("fullName").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const address = document.getElementById("address").value.trim();
    const city = document.getElementById("city").value.trim();
    const country = document.getElementById("country").value.trim();
    const zip = document.getElementById("zip").value.trim();

    // Verificar si hay algún campo vacío
    if (!fullName || !phone || !address || !city || !country || !zip) {
        errorMessage.textContent = "Por favor, completa todos los campos.";
        return false;
    }

    // Si todo es válido, limpiar el mensaje de error
    errorMessage.textContent = "";
    return true;
}

// Añadir el manejador de evento al botón "Siguiente"
siguienteButton.addEventListener("click", function() {
    if (validateShippingAddress()) {
        // Si la validación es exitosa, cambiar a la siguiente pestaña (forma de pago)
        const shippingAddressTab = document.getElementById("shipping-address-tab");
        const paymentMethodTab = document.getElementById("payment-method-tab");

        // Cambiar a la pestaña "Forma de Pago"
        const bootstrapTab = new bootstrap.Tab(paymentMethodTab);
        bootstrapTab.show();
    }
});
//Añade funcionalidad al botón
document.getElementById('nextButtonPayment').addEventListener('click', function () {
    // Selecciona la pestaña de "Costos"
    const costSummaryTab = new bootstrap.Tab(document.getElementById('cost-summary-tab'));
    // Cambia a la pestaña de "Costos"
    costSummaryTab.show();
});
//Le asigna la funcionalidad al botón de "Atrás" en la pestaña de Forma de envíos
document.getElementById("backToShipping").addEventListener("click", function (e) {
    e.preventDefault();
    // Cambia al tab anterior (Dirección de Envío)
    var previousTab = new bootstrap.Tab(document.querySelector('#shipping-address-tab'));
    previousTab.show();
});
