const productID = PRODUCT_INFO_URL + localStorage.getItem('productID') + EXT_TYPE;
const comentariosProducto = PRODUCT_INFO_COMMENTS_URL + localStorage.getItem('productID') + EXT_TYPE;
const infoProducto = document.getElementById('info-producto');
const divComentariosProducto = document.getElementById('comentarios-producto');

function mostrarInfoProducto(product) {
    infoProducto.innerHTML = '';

    // Genera indicadores y items del carrusel basados en el número de imágenes
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
        <h5 class="fw-bold"> ${product.currency} ${product.cost}</h5>
        <p class="small text-muted">Cantidad vendida: ${product.soldCount}</p>
        <div class="col-md-3 my-3">
                <label for="quantity" class="form-label">Cantidad:</label>
                <input id="quantity" type="number" name="quantity" min="1" value="1" class="form-control">
        </div> 
        <div class="d-grid gap-2">
            <button id="buyButton" class="btn btn-primary w-10 p-2">
                <i class="fas fa-shopping-bag"></i> Comprar
            </button>
            <button id="addToCartButton" class="btn btn-secondary w-10 p-2">
                <i class="fas fa-cart-plus"></i> Agregar al carrito
            </button>
        </div>
    </div>
    <div class="col my-4">
        <h5 class="fw-bold">Características: </h5>
        <hr>
        <p>${product.description}</p>
    </div>
    `;
}

function mostrarComentariosProducto(opiniones) {
    // Reiniciar el contenido de comentarios
    divComentariosProducto.innerHTML = "";

    // Construir HTML para las opiniones destacadas
    let comentariosHTML = opiniones.map(opinion => {
        return `
        <div class="mb-3">
            <div class="d-flex justify-content-between align-items-center">
            <div>
                ${mostrarEstrellas(opinion.score)} <!-- Función para mostrar estrellas -->
            </div>
                <small class="text-muted">${formatearFecha(opinion.dateTime)}</small> <!-- Usar la función para formatear la fecha -->
            </div>
            <div>
                <h6 class="mt-2" style="font-size: 14px;">${opinion.user}</h6>
            </div>
            <p class="fst-italic">${opinion.description}</p>
            <hr>
        </div>
        `;
    }).join(''); // Unir todas las opiniones en un solo string HTML

    // Agregar la sección de comentarios destacadas al contenedor
    divComentariosProducto.innerHTML = `
    <div class="col-md-5">
        <h5 class="fw-bold">Opiniones del producto<h5>
        <hr>
        <p id="calificacionPromedio" class="fs-2">5.0</p>

        <div class="progress mb-3" style="height: 2px;">
            <div class="progress-bar" role="progressbar" style="width: 80%;" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"></div>
        </div>
        <div class="progress mb-3" style="height: 2px;">
            <div class="progress-bar" role="progressbar" style="width: 60%;" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"></div>
        </div>
        <div class="progress mb-3" style="height: 2px;">
            <div class="progress-bar" role="progressbar" style="width: 50%;" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"></div>
        </div>
        <div class="progress mb-3" style="height: 2px;">
            <div class="progress-bar" role="progressbar" style="width: 25%;" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"></div>
        </div>
        <div class="progress mb-3" style="height: 2px;">
            <div class="progress-bar" role="progressbar" style="width: 5%;" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"></div>
        </div>

        <div id="product-review" class="my-5">
            <h5 class="fw-bold">Añadir opinión</h5>
            <div id="product-star-rating" class="mb-2">
                <i class="far fa-star" style="color: #FFD43B;"></i>
                <i class="far fa-star" style="color: #FFD43B;"></i>
                <i class="far fa-star" style="color: #FFD43B;"></i>
                <i class="far fa-star" style="color: #FFD43B;"></i>
                <i class="far fa-star" style="color: #FFD43B;"></i>
            </div>
            <textarea class="form-control mb-2" placeholder="Escribe tu reseña aquí"></textarea>
            <div class="d-flex align-items-center mt-2">
                <button class="btn btn-primary btn-sm">Enviar reseña</button>
            </div>
        </div>
    </div>

    <div class="col-md-6">
        <h5 class="fw-bold">Opiniones destacadas</h5>
        <hr>
        ${comentariosHTML}
    </div>
    `;
}

function formatearFecha(fechaISO) {
    const fecha = new Date(fechaISO);
    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const dia = fecha.getDate();
    const mes = meses[fecha.getMonth()];
    const anio = fecha.getFullYear();

    return `${dia} ${mes} ${anio}`;
}


function mostrarEstrellas(score) {
    let estrellasHTML = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= score) {
            estrellasHTML += '<i class="fas fa-star" style="color: #FFD43B;"></i>'; // Estrella llena
        } else {
            estrellasHTML += '<i class="far fa-star" style="color: #FFD43B;"></i>'; // Estrella vacía
        }
    }
    return estrellasHTML;
}

function estrellas() {
    const stars = document.querySelectorAll('#product-star-rating i');
    stars.forEach((star, index) => {
        star.addEventListener('click', () => {
            stars.forEach((s, i) => {
                if (i <= index) {
                    s.classList.replace('far', 'fas');
                } else {
                    s.classList.replace('fas', 'far');
                }
            });
        });
    });
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

    getJSONData(comentariosProducto).then((resultado) => {
        if (resultado.status === "ok") {
            const opiniones = resultado.data; // Array de opiniones
            mostrarComentariosProducto(opiniones); // Pasar el array de opiniones
            estrellas();
        } else {
            console.error("Error:", resultado.data);
        }
    }).catch(error => {
        console.error("Error al obtener datos:", error);
    });

    
});
