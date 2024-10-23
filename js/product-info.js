const productID = PRODUCT_INFO_URL + localStorage.getItem('productID') + EXT_TYPE;
const comentariosProducto = PRODUCT_INFO_COMMENTS_URL + localStorage.getItem('productID') + EXT_TYPE;
const infoProducto = document.getElementById('info-producto');
const divComentariosProducto = document.getElementById('comentarios-producto');
const divProductosRelacionados = document.getElementById('productos-relacionados');

let opiniones = [];

// Mostrar información del producto
function mostrarInfoProducto(product) {
    infoProducto.innerHTML = '';
    divProductosRelacionados.innerHTML = '';

    const carouselIndicators = product.images.map((_, index) => `
        <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="${index}" class="${index === 0 ? 'active' : ''}" aria-current="${index === 0 ? 'true' : ''}" aria-label="Slide ${index + 1}"></button>
    `).join('');

    const carouselItems = product.images.map((image, index) => `
        <div class="carousel-item ${index === 0 ? 'active' : ''}">
            <img src="${image}" class="d-block w-100 rounded" alt="...">
        </div>
    `).join('');

    infoProducto.innerHTML = `
        <p class="text-muted">
            <a href="categories.html" class="text-decoration-none text-reset">Categorías</a>
            >
            <a href="products.html" class="text-decoration-none text-reset">${product.category}</a>
        </p>

        <div class="col-md-7">
            <div id="carouselExampleIndicators" class="carousel slide">
                <div class="carousel-indicators">
                    ${carouselIndicators}
                </div>
                <div class="carousel-inner">
                    ${carouselItems}
                </div>
                <button class="carousel-control-prev" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="prev">
                    <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span class="visually-hidden">Previous</span>
                </button>
                <button class="carousel-control-next" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="next">
                    <span class="carousel-control-next-icon" aria-hidden="true"></span>
                    <span class="visually-hidden">Next</span>
                </button>
            </div>
        </div>
        
        <div class="col-md-5 my-3">
            <h2 class="fw-bold">${product.name}</h2>
            <hr class="my-4">
            <h5 class="fw-bold">${product.currency} ${product.cost}</h5>
            <p class="small text-muted">Cantidad vendida: ${product.soldCount}</p>
            <div class="col-md-3 my-3">
                <label for="quantity" class="form-label">Cantidad:</label>
                <input id="quantity" type="number" name="quantity" min="1" value="1" class="form-control">
            </div> 
            <div class="d-grid gap-2">
                <button id="buyButton" class="btn btn-primary w-100 p-2">
                    <i class="fas fa-shopping-bag"></i> Comprar
                </button>
                <button id="addToCartButton" class="btn btn-secondary w-100 p-2">
                    <i class="fas fa-cart-plus"></i> Agregar al carrito
                </button>
            </div>
        </div>
        <div class="col my-4">
            <h5 class="fw-bold">Características:</h5>
            <hr>
            <p>${product.description}</p>
        </div>
    `;

    // Asignar eventos de clic para botones de compra y carrito
    document.getElementById('buyButton').addEventListener('click', () => agregarAlCarrito(product, true));
    document.getElementById('addToCartButton').addEventListener('click', () => agregarAlCarrito(product, false));

    mostrarProductosRelacionados(product.relatedProducts);
}

// Mostrar comentarios
function mostrarComentariosProducto(opiniones) {
    divComentariosProducto.innerHTML = "";

    let comentariosHTML = opiniones.map(opinion => `
        <div class="mb-3">
            <div class="d-flex justify-content-between align-items-center">
                ${mostrarEstrellas(opinion.score)}
                <small class="text-muted">${formatearFecha(opinion.dateTime)}</small>
            </div>
            <h6 class="mt-2" style="font-size: 14px;">${opinion.user}</h6>
            <p class="fst-italic">${opinion.description}</p>
            <hr>
        </div>
    `).join('');

    let promedio = calcularPromedio(opiniones);

    divComentariosProducto.innerHTML = `
        <div class="col-md-5">
            <h5 class="fw-bold">Opiniones del producto</h5>
            <hr>
            <div class="row d-flex justify-content-between align-items-center">
                <p id="calificacionPromedio" class="fs-2">${promedio}</p>
                ${mostrarEstrellas(promedio)}
            </div>
            ${generarBarrasProgreso(opiniones)}
            <div id="product-review" class="my-5">
                <h5 class="fw-bold">Añadir opinión</h5>
                <div id="product-star-rating" class="mb-2">
                    ${'<i class="far fa-star" style="color: #FFD43B;"></i>'.repeat(5)}
                </div>
                <textarea class="form-control mb-2" placeholder="Escribe tu reseña aquí"></textarea>
                <button id="enviarReseniaButton" class="btn btn-primary btn-sm">Enviar reseña</button>
            </div>
        </div>
        <div class="col-md-6">
            <h5 class="fw-bold">Opiniones destacadas</h5>
            <hr>
            ${comentariosHTML}
        </div>
    `;

    generarEstrellas();
    document.getElementById('enviarReseniaButton').addEventListener('click', enviarResenia);
}

// Agregar al carrito
function agregarAlCarrito(product, redirigirAlCarrito) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const cantidad = parseInt(document.getElementById('quantity').value);

    const productoExistente = carrito.find(p => p.id === product.id);

    if (productoExistente) {
        productoExistente.cantidad += cantidad;
    } else {
        carrito.push({ ...product, cantidad });
    }

    localStorage.setItem('carrito', JSON.stringify(carrito));

    if (redirigirAlCarrito) {
        window.location.href = "cart.html";
    } else {
        alert("Producto agregado al carrito");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    getJSONData(productID).then((resultado) => {
        if (resultado.status === "ok") {
            mostrarInfoProducto(resultado.data);
        } else {
            console.error("Error:", resultado.data);
        }
    });

    getJSONData(comentariosProducto).then((resultado) => {
        if (resultado.status === "ok") {
            opiniones = resultado.data;
            mostrarComentariosProducto(opiniones);
        } else {
            console.error("Error:", resultado.data);
        }
    });
});
