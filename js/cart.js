const API_KEY = 'bfce5baafc634cd0814d26ae';
const API_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`;

let tasaCambioUSDToUYU = 40; // Tasa de cambio predeterminada (por si falla la API).
let monedaActual = 'UYU'; // Moneda predeterminada.

// Escucha el evento DOMContentLoaded para iniciar.
document.addEventListener("DOMContentLoaded", async () => {
    document.getElementById('cart-container').addEventListener('click', manejoDeClicksEnCarrito); // Agrega escucha de clics en el contenedor del carrito.
    await obtenerTasaCambio(); // Cargar tasa de cambio al inicio.
    mostrarProductosEnCarrito();
    showPaymentForms();
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
                btn.classList.remove('selected');
                btn.classList.add('btn-light');
            });

            button.classList.remove('btn-light');
            button.classList.add('selected');

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

function showPaymentForms() {
    const paymentOptions = document.querySelectorAll('.payment-option');
    const paymentOptionsContainer = document.getElementById('payment-options-container');

    // Manejar la selección de método de pago
    paymentOptions.forEach(option => {
        option.addEventListener('click', () => {
            const paymentMethod = option.getAttribute('data-payment');
            // Vaciar contenedor de formularios antes de cargar uno nuevo
            paymentOptionsContainer.innerHTML = '';

            if (paymentMethod === 'credit-card') {
                paymentOptionsContainer.innerHTML = `
                <div id="creditCardForm" class="mt-4">
                    <h5>Detalles del Pago - Tarjeta de Crédito</h5>
                    <div class="mb-3">
                        <label for="cardHolder" class="form-label">Titular de la Tarjeta</label>
                        <input type="text" name="paymentMethod" class="form-control" id="cardHolder" placeholder="Nombre del titular" required>
                    </div>
                    <div class="mb-3">
                        <label for="cardNumber" class="form-label">Número de Tarjeta</label>
                        <input type="text" name="paymentMethod" class="form-control" id="cardNumber" placeholder="1234 5678 9123 4567" required>
                    </div>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="expiryDate" class="form-label">Vencimiento</label>
                            <input type="text" name="paymentMethod" class="form-control" id="expiryDate" placeholder="MM/AA" required>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="cvv" class="form-label">CVV</label>
                            <input type="text" name="paymentMethod" class="form-control" id="cvv" placeholder="123" required>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label for="installments" class="form-label">Cuotas</label>
                        <select class="form-select" name="paymentMethod" id="installments" required>
                            <option disabled>Seleccione</option>
                            <option value="1">1 cuota</option>
                            <option value="3">3 cuotas</option>
                            <option value="6">6 cuotas</option>
                            <option value="12">12 cuotas</option>
                        </select>
                    </div>
                </div>
                `;
            } else if (paymentMethod === 'debit-card') {
                paymentOptionsContainer.innerHTML = `
                <div id="debitCardForm" class="mt-4">
                    <h5>Detalles del Pago - Tarjeta de Débito</h5>
                    <div class="mb-3">
                        <label for="debitCardHolder" class="form-label">Titular de la Tarjeta</label>
                        <input type="text" name="paymentMethod" class="form-control" id="debitCardHolder" placeholder="Nombre del titular" required>
                    </div>
                    <div class="mb-3">
                        <label for="debitCardNumber" class="form-label">Número de Tarjeta</label>
                        <input type="text" name="paymentMethod" class="form-control" id="debitCardNumber" placeholder="1234 5678 9123 4567" required>
                    </div>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="debitExpiryDate" class="form-label">Vencimiento</label>
                            <input type="text" name="paymentMethod" class="form-control" id="debitExpiryDate" placeholder="MM/AA" required>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="debitCvv" class="form-label">CVV</label>
                            <input type="text" name="paymentMethod" class="form-control" id="debitCvv" placeholder="123" required>
                        </div>
                    </div>
                </div>
                `;
            } else if (paymentMethod === 'bank-transfer') {
                paymentOptionsContainer.innerHTML = `
                <div id="bankTransferForm" class="mt-4">
                    <h5>Detalles del Pago - Transferencia Bancaria</h5>
                    <div class="mb-3">
                        <input class="form-check-input" type="radio" name="flexRadioDefault" id="bankCardNumber" checked>
                        <label class="form-check-label" for="flexRadioDefault2">
                            BROU: <br>
                            Juan Perez <br>
                            CA 123456789-00001
                        </label>
                    </div>
                </div>
                `;
            } else if (paymentMethod === 'cash-on-delivery') {
                paymentOptionsContainer.innerHTML = `
                <div id="cashOptions" class="mt-4">
                    <h5>Seleccione su forma de pago en efectivo</h5>
                    <div class="mb-3">
                        <label for="cashMethod" class="form-label">Opciones</label>
                        <select class="form-select" name="paymentMethod" id="cashMethod" required>
                            <option disabled>Seleccione</option>
                            <option value="abitab">Abitab</option>
                            <option value="redpagos">RedPagos</option>
                        </select>
                    </div>
                </div>
                `;
            }
        });
    });
}

function finalizarCompra() {
    const shippingValid = isFormValid(document.getElementById('shippingAddressForm'));
    const paymentValid = validatePaymentForm();
    
    // Verificar si se seleccionó un método de envío
    const shippingButtons = document.querySelectorAll('#shipping-type button');
    let shippingSelected = false;
    shippingButtons.forEach(button => {
        if (button.classList.contains('selected')) {
            shippingSelected = true;
        }
    });
    
    if (!shippingSelected || !shippingValid || !paymentValid) {
        Swal.fire({
            icon: "error",
            title: "Información incompleta",
            text: "Por favor, completa todos los campos requeridos y selecciona un método de pago válido.",
        });
    } else {
        Swal.fire({
            icon: "success",
            title: "¡Gracias por tu compra!",
            text: "Tu compra ha sido finalizada con éxito. En los próximos días recibirás tu pedido.",
        });
    }
}

// Este es un ejemplo de cómo puedes conectar el proceso de validación en los formularios de pago
document.getElementById('finalizarCompra').addEventListener('click', finalizarCompra);


function actualizarEnvio() {
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.carrito) return;

    const totalPrice = currentUser.carrito.reduce((acc, producto) => {
        return acc + convertirMoneda(producto.cost * producto.cantidad, producto.currency);
    }, 0);

    const shippingButtons = document.querySelectorAll('#shipping-type button');
    let shippingPercentage = 0;

    shippingButtons.forEach(button => {
        if (button.classList.contains('selected')) {
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
                btn.classList.remove('selected');
                btn.classList.add('btn-light');
            });

            button.classList.remove('btn-light');
            button.classList.add('selected');

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
        
    // Verificar si el formulario de forma de pago es válido antes de avanzar
    document.getElementById("toPaymentButton").addEventListener("click", (e) => {
        const shippingForm = document.getElementById('shippingAddressForm');
        if (!isFormValid(shippingForm)) {
            e.preventDefault(); // Evita avanzar si no es válido
            shippingForm.reportValidity(); // Muestra errores de validación de la dirección de envío
        } else {
            document.getElementById('payment-method-tab').click(); // Avanza a la sección de Forma de Pago
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

function validatePaymentForm() {
    const paymentOptionsContainer = document.getElementById('payment-options-container');

    if (!paymentOptionsContainer) {
        console.log("Contenedor de opciones de pago no encontrado.");
        return false;
    }

    // Recorre los nodos y selecciona el primer nodo de tipo Element (es decir, el formulario)
    let activeForm = null;
    for (let i = 0; i < paymentOptionsContainer.childNodes.length; i++) {
        const child = paymentOptionsContainer.childNodes[i];
        if (child.nodeType === 1) { // Verifica si es un nodo de tipo Element (el formulario)
            activeForm = child;
            break;
        }
    }

    // Si no encontramos un formulario
    if (!activeForm) {
        console.log("No se encontró ningún formulario dentro del contenedor.");
        return false;
    }

    console.log("Formulario activo:", activeForm);

    // Asegúrate de que `activeForm` tiene un id y no es undefined
    if (!activeForm.id) {
        console.log("El formulario activo no tiene un ID.");
        return false;
    }

    // Comprobación de id y validación para cada tipo de formulario
    if (activeForm.id === 'creditCardForm') {
        // Validación para tarjeta de crédito...
        const cardHolder = document.getElementById('cardHolder');
        const cardNumber = document.getElementById('cardNumber');
        const expiryDate = document.getElementById('expiryDate');
        const cvv = document.getElementById('cvv');
        const installments = document.getElementById('installments');
        if (!cardHolder.value || !cardNumber.value || !expiryDate.value || !cvv.value || !installments.value) {
            return false;
        }
    } else if (activeForm.id === 'debitCardForm') {
        // Validación para tarjeta de débito...
        const debitCardHolder = document.getElementById('debitCardHolder');
        const debitCardNumber = document.getElementById('debitCardNumber');
        const debitExpiryDate = document.getElementById('debitExpiryDate');
        const debitCvv = document.getElementById('debitCvv');
        if (!debitCardHolder.value || !debitCardNumber.value || !debitExpiryDate.value || !debitCvv.value) {
            return false;
        }
    } else if (activeForm.id === 'bankTransferForm') {
        // Validación para transferencia bancaria...
        const bankCardNumber = document.getElementById('bankCardNumber');
        if (!bankCardNumber.value) {
            return false;
        }
    } else if (activeForm.id === 'cashOptions') {
        // Validación para pago en efectivo...
        const cashMethod = document.getElementById('cashMethod');
        if (!cashMethod.value) {
            return false;
        }
    } else {
        console.log("Formulario de pago no reconocido. ID:", activeForm.id);
        return false;
    }

    return true;
}

// Oculta el boton de siguiente en la pestaña de pago
const nextButtonPayment = document.getElementById("nextButtonPayment");
if (nextButtonPayment) {
    nextButtonPayment.style.display = "none";
}