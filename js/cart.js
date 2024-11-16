const API_KEY = '9fbc515fdf44f560c270a07c';
const API_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`;

let tasaCambioUSDToUYU = 40; // Tasa de cambio predeterminada (por si falla la API).
let monedaActual = 'UYU'; // Moneda predeterminada.

// Escucha el evento DOMContentLoaded para iniciar.
document.addEventListener("DOMContentLoaded", async () => {
    document.getElementById('cart-container').addEventListener('click', manejoDeClicksEnCarrito); // Agrega escucha de clics en el contenedor del carrito.
    await obtenerTasaCambio(); // Cargar tasa de cambio al inicio.
    mostrarProductosEnCarrito();
    actualizarSubtotal();
    actualizarTotal();
    actualizarEnvio();
    manejoBotonesNavegacion()

    // Agregar eventos de validación en tiempo real
    const shippingForm = document.getElementById('shippingAddressForm');
    const paymentForm = document.getElementById('paymentForm');

    // Validación en tiempo real del formulario de envío
    shippingForm.addEventListener('input', function (event) {
        validateForm(shippingForm);
    });

    // Validación en tiempo real del formulario de pago
    paymentForm.addEventListener('input', function (event) {
        validateForm(paymentForm);
    });

    // Agregar eventos de cambio de moneda
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
        Swal.fire({
            icon: "info",
            title: "Tasa de conversión",
            text: "No pudimos obtener la tasa de conversión actual de USD a UYU, usaremos la predeterminada.",
          });
    }
}

// Cambia la moneda seleccionada y actualiza los totales.
function cambiarMoneda(nuevaMoneda) {
    monedaActual = nuevaMoneda;
    actualizarSubtotal();
    actualizarTotal();
    actualizarEnvio(); // Recalcula el costo del envío en la nueva moneda.
}

// Convierte un valor entre USD y UYU según la moneda actual.
function convertirMoneda(valor, monedaProducto) {
    if (monedaActual === 'USD') {
        return monedaProducto === 'USD' ? valor : valor / tasaCambioUSDToUYU;
    } else {
        return monedaProducto === 'UYU' ? valor : valor * tasaCambioUSDToUYU;
    }
}

function actualizarSubtotal() {
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.carrito) return;

    let total = 0;

    // Asegúrate de aplicar la conversión de moneda antes de mostrar los valores
    currentUser.carrito.forEach(producto => {
        const subtotalConvertido = convertirMoneda(producto.cost * producto.cantidad, producto.currency);
        total += subtotalConvertido;
    });

    const simboloMoneda = monedaActual === 'USD' ? 'USD' : 'UYU';
    document.getElementById('subtotal').innerText = `${simboloMoneda} ${total.toFixed(2)}`;
}

function actualizarTotal() {
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.carrito) return;

    let total = 0;
    let cantidadTotal = 0;

    currentUser.carrito.forEach(producto => {
        total += convertirMoneda(producto.cost * producto.cantidad, producto.currency);
        cantidadTotal += producto.cantidad;

    });

    const simboloMoneda = monedaActual === 'USD' ? 'USD' : 'UYU';
    document.getElementById('total-items').innerText = cantidadTotal;
    document.getElementById('total-price').innerText = `${simboloMoneda} ${total.toFixed(2)}`;
}


// Maneja los clics en el carrito, eliminando productos cuando se presiona el botón correspondiente.
function manejoDeClicksEnCarrito(e) {
    if (e.target.classList.contains('eliminar-producto')) { // Verifica si el elemento tiene la clase 'eliminar-producto'.
        const productID = e.target.getAttribute('data-id'); // Obtiene el ID del producto.
        eliminarDelCarrito(productID); // Llama a la función para eliminar el producto.
        actualizarSubtotal();
        actualizarTotal();
        actualizarEnvio();
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
    actualizarSubtotal(); // Recalcula el total general del carrito.
    actualizarTotal(); // Recalcula el total general del carrito.
    actualizarEnvio(); // Recalcula el total general del carrito.
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

function mostrarProductosEnCarrito() {
    const currentUser = getCurrentUser(); // Obtiene el usuario actual.
    const cartContainer = document.getElementById('cart-container'); // Elemento del DOM para mostrar el carrito.
    cartContainer.innerHTML = ''; // Limpia el contenido anterior.

    // Verifica si el carrito está vacío y muestra un mensaje en caso afirmativo.
    if (!currentUser || !currentUser.carrito || currentUser.carrito.length === 0) {
        mostrarCarritoVacio();
        return;
    }

    let subtotal = 0; // Inicializa el total general del carrito.
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
        subtotal += producto.cost * producto.cantidad; // Acumula el costo total.
        cantidadTotal += producto.cantidad; // Acumula la cantidad total de productos.
    });

    cartContainer.innerHTML += `
        <div class="d-flex justify-content-center">
            <button type="button" class="btn btn-primary align-items-center" id="toShippingButton">Siguiente</button>
        </div>`; 

    // Almacena los valores para el cálculo posterior del envío.
    const totalPrice = subtotal; // Total sin envío
    const totalItems = cantidadTotal;

    // Actualiza el total y la cantidad total en la interfaz.
    document.getElementById('total-price').innerText = `${currentUser.carrito[0].currency} ${totalPrice.toFixed(2)}`;
    document.getElementById('total-items').innerText = totalItems;

    const shippingButtons = document.querySelectorAll('#shipping-type button');

    shippingButtons.forEach(button => {
        button.addEventListener('click', () => {
            shippingButtons.forEach(btn => {
                btn.classList.remove('btn-info');
                btn.classList.add('btn-light');
            });

            button.classList.remove('btn-light');
            button.classList.add('btn-info');

            let shippingPercentage = 0;
            if (button.id === 'premiumShipping') {
                shippingPercentage = 15;
            } else if (button.id === 'expressShipping') {
                shippingPercentage = 7;
            } else if (button.id === 'standardShipping') {
                shippingPercentage = 5;
            }

            // Ahora se pasa correctamente el total de la compra para calcular el costo de envío.
            actualizarEnvio(totalPrice, totalItems, shippingPercentage);
        });
    });

}

function actualizarEnvio() {
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.carrito) return;

    const totalPrice = currentUser.carrito.reduce((acc, producto) => {
        return acc + convertirMoneda(producto.cost * producto.cantidad, producto.currency);
    }, 0);

    const shippingButtons = document.querySelectorAll('#shipping-type button');
    let shippingPercentage = 0;

    shippingButtons.forEach(button => {
        if (button.classList.contains('btn-info')) {
            if (button.id === 'premiumShipping') {
                shippingPercentage = 15;
            } else if (button.id === 'expressShipping') {
                shippingPercentage = 7;
            } else if (button.id === 'standardShipping') {
                shippingPercentage = 5;
            }
        }
    });

    const shippingCost = (totalPrice * shippingPercentage) / 100;
    const totalWithShipping = totalPrice + shippingCost;

    // Actualizar los valores en la interfaz
    const simboloMoneda = monedaActual === 'USD' ? 'USD' : 'UYU';
    document.getElementById('shipping-summary').textContent = `${simboloMoneda} ${shippingCost.toFixed(2)}`;
    document.getElementById('total-price').textContent = `${simboloMoneda} ${totalWithShipping.toFixed(2)}`;
}


function obtenerPorcentajeEnvio() {
    const shippingButtons = document.querySelectorAll('#shipping-type button');
    let shippingPercentage = 0;

    shippingButtons.forEach(button => {
        button.addEventListener('click', () => {
            shippingButtons.forEach(btn => {
                btn.classList.remove('btn-info');
                btn.classList.add('btn-light');
            });

            button.classList.remove('btn-light');
            button.classList.add('btn-info');

            if (button.id === 'premiumShipping') {
                shippingPercentage = 15;
            } else if (button.id === 'expressShipping') {
                shippingPercentage = 7;
            } else if (button.id === 'standardShipping') {
                shippingPercentage = 5;
            }

            // Actualiza el envío con el nuevo porcentaje
            const totalPrice = parseFloat(document.getElementById('total-price').innerText.replace('$', '').trim());
            const totalItems = parseInt(document.getElementById('total-items').innerText);
            actualizarEnvio(totalPrice, totalItems, shippingPercentage);
        });
    });

    return shippingPercentage; // Devuelve el porcentaje actual de envío
}

// Muestra un mensaje de carrito vacío y oculta secciones innecesarias.
function mostrarCarritoVacio() {
    document.getElementById('alertaCarrito').innerHTML = '<p class="alert alert-light text-center">No hay productos en el carrito.</p>';
    document.getElementById('total-price').innerText = '$ 0.00';
    document.getElementById('total-items').innerText = '0';
    document.getElementById('cart-summary').classList.add('d-none');
    document.getElementById('div-carrito').classList.add('d-none');
}

// Actualiza la información del usuario en localStorage.
function actualizarLocalStorage(currentUser) {
    let usuarios = JSON.parse(localStorage.getItem('usuarios')) || []; // Obtiene todos los usuarios.
    usuarios = usuarios.map(usuario => usuario.email === currentUser.email ? currentUser : usuario); // Actualiza solo el usuario actual.
    localStorage.setItem('usuarios', JSON.stringify(usuarios)); // Guarda los cambios en localStorage.
}

function manejoBotonesNavegacion() {
    document.getElementById("toShippingButton").addEventListener("click", function() {
        let cartTab = new bootstrap.Tab(document.getElementById("shipping-tab"));
        cartTab.show();
    });
    
    document.getElementById("toPaymentButton").addEventListener("click", function() {
        let shippingTab = new bootstrap.Tab(document.getElementById("payment-method-tab"));
        shippingTab.show();
    });
    
    document.getElementById("backToType").addEventListener("click", function() {
        let cartTab = new bootstrap.Tab(document.getElementById("cart-tab"));
        cartTab.show();
    });
    
    document.getElementById("nextButtonPayment").addEventListener("click", function() {
        let finalizeTab = new bootstrap.Tab(document.getElementById("finalize-tab"));
        finalizeTab.show();
    });
    
    document.getElementById("backToShipping").addEventListener("click", () => {
        let shippingTab = new bootstrap.Tab(document.getElementById("shipping-tab"));
        shippingTab.show();
    });
    
    // Seleccionar los formularios y botones
    const shippingForm = document.getElementById('shippingAddressForm');
    const paymentForm = document.getElementById('paymentForm');
    const toPaymentButton = document.getElementById('toPaymentButton'); 
    
    // Verificar si el formulario de forma de pago es válido antes de avanzar
    toPaymentButton.addEventListener('click', (e) => {
        if (!isFormValid(shippingForm)) {
            e.preventDefault(); // Evitar que se avance
            shippingForm.reportValidity(); // Mostrar mensaje de campos incompletos
        } else {
            document.getElementById('payment-method-tab').click(); // Avanzar a la sección de Forma de Pago
        }
    });
    
    // Finalizar compra si todos los formularios están completos
    document.getElementById("finalizarCompra").addEventListener("click", function(e) {
        // Verificar si los formularios son válidos
        const shippingValid = isFormValid(document.getElementById('shippingAddressForm'));
        const paymentMethodSelected = isPaymentFormValid(document.getElementById('paymentForm'));
    
        // Verificar si se seleccionó un método de envío
        const shippingButtons = document.querySelectorAll('#shipping-type button');
        let shippingSelected = false;
        shippingButtons.forEach(button => {
            if (button.classList.contains('btn-info')) {
                shippingSelected = true;
            }
        });
    
        // Mostrar errores si falta información
        if (!shippingSelected || !shippingValid || !paymentValid || !paymentMethodSelected) {
            e.preventDefault(); // Evita que se complete la compra
            Swal.fire({
                icon: "error",
                title: "Información incompleta",
                text: "Por favor, completa todos los campos requeridos y selecciona un método de pago válido.",
            });
            document.getElementById('error-message').innerText = 'Revisa los campos y asegúrate de completar todo correctamente.';
        } else {
            // Confirmación de compra exitosa
            Swal.fire({
                icon: "success",
                title: "¡Gracias por tu compra!",
                text: "Tu compra ha sido finalizada con éxito. En los próximos días recibirás tu pedido.",
            });
            window.location.href = 'index.html'; // Redirige a la página principal
        }
    });    
};


function validateForm(form) {
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        if (input.checkValidity()) {
            input.classList.remove('is-invalid');
            input.classList.add('is-valid');
        } else {
            input.classList.remove('is-valid');
            input.classList.add('is-invalid');
        }
    });
}

function isFormValid(form) {
    const isValid = form.checkValidity();
    validateForm(form); // Llama la validación en tiempo real
    return isValid;
}

function isPaymentFormValid() {
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked');
    if (!paymentMethod) return false; // Verifica que haya un método seleccionado

    const method = paymentMethod.value;
    let form;
    if (method === 'credit-card') {
        form = document.getElementById('creditCardForm');
    } else if (method === 'debit-card') {
        form = document.getElementById('debitCardForm');
    } else if (method === 'bank-transfer') {
        form = document.getElementById('bankTransferForm');
    }

    if (form) {
        return form.checkValidity(); // Verifica si el formulario es válido
    }

    return true; // Para métodos sin formularios específicos
}

const paymentOptions = document.querySelectorAll('.payment-option');
const creditCardForm = document.getElementById('creditCardForm');
const debitCardForm = document.getElementById('debitCardForm');
const bankTransferForm = document.getElementById('bankTransferForm');
const cashOptions = document.getElementById('cashOptions');

// Manejar la selección de método de pago
paymentOptions.forEach(option => {
    option.addEventListener('click', () => {
        // Ocultar todos los formularios
        creditCardForm.style.display = 'none';
        debitCardForm.style.display = 'none';
        bankTransferForm.style.display = 'none';
        cashOptions.style.display = 'none';

        // Mostrar formulario correspondiente
        const paymentMethod = option.getAttribute('data-payment');
        if (paymentMethod === 'credit-card') creditCardForm.style.display = 'block';
        else if (paymentMethod === 'debit-card') debitCardForm.style.display = 'block';
        else if (paymentMethod === 'bank-transfer') bankTransferForm.style.display = 'block';
        else if (paymentMethod === 'cash-on-delivery') cashOptions.style.display = 'block';
    });
});