const productID = PRODUCT_INFO_URL + localStorage.getItem('productID') + EXT_TYPE;
const infoProductos = document.getElementById('info-producto');

function mostrarInfoProducto(product) {
    infoProductos.innerHTML = '';

    // Genera indicadores y items del carrusel basados en el número de imágenes
    const carouselIndicators = product.images.map((_, index) => `
        <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="${index}" class="${index === 0 ? 'active' : ''}" aria-current="${index === 0 ? 'true' : ''}" aria-label="Slide ${index + 1}"></button>
    `).join('');

    const carouselItems = product.images.map((image, index) => `
        <div class="carousel-item ${index === 0 ? 'active' : ''}">
            <img src="${image}" class="d-block w-100 rounded" alt="...">
        </div>
    `).join('');

    infoProductos.innerHTML = `
    <p class="text-muted">
        <a href="categories.html" class="text-decoration-none text-reset">Categorías</a>
        >
        <a href="products.html" class="text-decoration-none text-reset">${product.category}</a>
    </p>

    <div class="col-md-8">
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
    
    <div class="col-md-4 my-3">
        <h2>${product.name}</h2>
        <hr class="my-4">
        <h5> ${product.currency} ${product.cost}</h5>
        <p class="small text-muted">Cantidad vendida: ${product.soldCount}</p>
        <div class="col-md-3 my-3">
                <label for="quantity" class="form-label">Cantidad:</label>
                <input id="quantity" type="number" name="quantity" min="1" value="1" class="form-control">
        </div> 
        <div class="my-3">
            <button id="buyButton" class="btn btn-primary w-10 mb-2">
                <i class="fas fa-shopping-bag"></i> Comprar
            </button>
            <button id="addToCartButton" class="btn btn-secondary w-10 mb-2">
                <i class="fas fa-cart-plus"></i> Agregar al carrito
            </button>
        </div>
    </div>
    <div class="col my-4">
        <h5>Características: </h5>
        <p>${product.description}</p>
    </div>
    `;
}

document.addEventListener("DOMContentLoaded", function() {
    getJSONData(productID).then((resultado) => {
        if (resultado.status === "ok") {
            const product = resultado.data; // Asumiendo que `resultado.data` es un objeto de producto
            mostrarInfoProducto(product);
        } else {
            console.error("Error:", resultado.data);
        }
    }).catch(error => {
        console.error("Error al obtener datos:", error);
    });
});
