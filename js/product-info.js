const productID = PRODUCT_INFO_URL + localStorage.getItem('productID') + EXT_TYPE;
const comentariosProducto = PRODUCT_INFO_COMMENTS_URL + localStorage.getItem('productID') + EXT_TYPE;
const infoProducto = document.getElementById('info-producto');
const divComentariosProducto = document.getElementById('comentarios-producto');
const divProductosRelacionados = document.getElementById('productos-relacionados');

let opiniones = [];

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
            <h5 class="fw-bold"> ${product.currency} ${product.cost}</h5>
            <p class="small text-muted">Cantidad vendida: ${product.soldCount}</p>
            <div class="col-md-3 my-3">
                <label for="quantity" class="form-label">Cantidad:</label>
                <input id="quantity" type="number" name="quantity" min="1" value="1" class="form-control">
            </div> 
            <div class="d-grid gap-2">
                <a href="cart.html">
                    <button id="buyButton" class="btn btn-primary w-100 p-2">
                        <i class="fas fa-shopping-bag"></i> Comprar
                    </button>
                </a>
                <button id="addToCartButton" class="btn btn-secondary w-100 p-2">
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

    mostrarProductosRelacionados(product.relatedProducts);
}

function mostrarComentariosProducto(opiniones) {
    divComentariosProducto.innerHTML = "";

    let comentariosHTML = opiniones.map(opinion => {
        return `
        <div class="mb-3">
            <div class="d-flex justify-content-between align-items-center">
            <div>
                ${mostrarEstrellas(opinion.score)} 
            </div>
                <small class="text-muted">${formatearFecha(opinion.dateTime)}</small> 
            </div>
            <div>
                <h6 class="mt-2" style="font-size: 14px;">${opinion.user}</h6>
            </div>
            <p class="fst-italic">${opinion.description}</p>
            <hr>
        </div>
        `;
    }).join('');

    let promedio = calcularPromedio(opiniones);

    divComentariosProducto.innerHTML = `
    <div class="col-md-5">
        <h5 class="fw-bold">Opiniones del producto<h5>
        <hr>
        <div class="row d-flex justify-content-between align-items-center">
            <div class="col-auto">
                <p id="calificacionPromedio" class="fs-2">${calcularPromedio(opiniones)}</p>
            </div>
            <div class="col-auto mb-3">
                ${mostrarEstrellas(promedio)}
            </div>
        </div>

        ${generarBarrasProgreso(opiniones)}

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
                <button id="enviarReseniaButton" class="btn btn-primary btn-sm">Enviar reseña</button>
            </div>
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

function mostrarProductosRelacionados(productosRelacionados) {
    if (productosRelacionados.length > 0) { // Si hay productos relacionados
        // Crea tarjetas para cada elemento de productosRelacionados
        const tarjetasHTML = productosRelacionados.map(product => ` 
            <div class="col-md-4 mb-4 cursor-active" onclick="setProductID(${product.id})"> 
                <div class="card shadow product">
                    <img src="${product.image}" class="card-img-top product-image" alt="${product.name}">
                    <div class="card-body product-info">
                        <h5 class="card-title">${product.name}</h5>
                    </div>
                </div>
            </div>
        `).join('');

        divProductosRelacionados.innerHTML = `
            <h5 class="fw-bold">Productos relacionados</h5>
            <hr>
            <div class="row justify-content-center">
                ${tarjetasHTML}
            </div>
        `;
    }
}


function formatearFecha(fechaISO) {
    const fecha = new Date(fechaISO); // Convertimos la cadena de fecha (ejemplo: "2024-09-26") en una fecha que JavaScript pueda entender

    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]; // Creamos un array con los nombres de los meses, desde "Enero" hasta "Diciembre"

    const dia = fecha.getDate(); // Extraemos el día de la fecha (del 1 al 31)

    const mes = meses[fecha.getMonth()]; // Extraemos el mes, pero como JavaScript devuelve números (0 para enero, 1 para febrero...), usamos ese número para buscar el nombre correcto del mes en nuestro array `meses`

    const anio = fecha.getFullYear(); // Extraemos el año (por ejemplo, 2024) 

    return `${dia} ${mes} ${anio}`; // Devolvemos una cadena que combina el día, el mes en español y el año, por ejemplo: "26 Septiembre 2024"
}


function mostrarEstrellas(score) {
    let estrellasHTML = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= score) {
            estrellasHTML += '<i class="fas fa-star" style="color: #FFD43B;"></i>';
        } else if (i - score < 1) {
            estrellasHTML += '<i class="fas fa-star-half-alt" style="color: #FFD43B;"></i>';
        } else {
            estrellasHTML += '<i class="far fa-star" style="color: #FFD43B;"></i>';
        }
    }
    return estrellasHTML;
}


function generarEstrellas() {
    // Seleccionamos todos los elementos <i> que representan estrellas en el contenedor con el id 'product-star-rating'
    const stars = document.querySelectorAll('#product-star-rating i');

    // Recorremos cada estrella y su índice usando forEach
    stars.forEach((star, index) => {
        // A cada estrella le agregamos un "escuchador" de eventos para cuando se haga clic sobre ella
        star.addEventListener('click', () => {
            // Recorremos nuevamente todas las estrellas para cambiar su apariencia según el índice de la estrella clicada
            stars.forEach((s, i) => {
                // Si la estrella actual tiene un índice menor o igual al de la clicada, la convertimos en "fas" (estrella llena)
                // Si no, la dejamos como "far" (estrella vacía)
                s.classList.replace(i <= index ? 'far' : 'fas', i <= index ? 'fas' : 'far');
            });
        });
    });
}


function enviarResenia() {
    // Obtiene el valor ingresado en el campo de texto (textarea) para la nueva reseña
    const nuevaResenia = document.querySelector('textarea').value;

    // Cuenta cuántas estrellas llenas (clase 'fas') hay en el sistema de calificación
    const nuevaCalificacion = document.querySelectorAll('#product-star-rating .fas').length;

    // Verifica que ambos, la reseña y la calificación, no estén vacíos
    if (nuevaResenia && nuevaCalificacion) {
        // Crea un nuevo objeto que representa la opinión del usuario
        const nuevaOpinion = {
            score: nuevaCalificacion, // Asigna la calificación
            description: nuevaResenia, // Asigna la reseña
            user: localStorage.getItem("usuario"), // Obtiene el nombre del usuario desde localStorage
            dateTime: new Date().toISOString() // Asigna la fecha y hora actual en formato ISO
        };

        // Añade la nueva opinión al array de opiniones existente
        opiniones.push(nuevaOpinion);

        // Llama a la función que vuelve a mostrar todos los comentarios, incluyendo la nueva opinión
        mostrarComentariosProducto(opiniones);
    } else {
        // Si faltan la reseña o la calificación, muestra un mensaje de alerta
        alert("Por favor ingresa una reseña y una calificación.");
    }
}


// Cálculo de calificación promedio
function calcularPromedio(opiniones) {
    // Utiliza reduce para sumar todas las puntuaciones de las opiniones
    const total = opiniones.reduce((sum, opinion) => sum + opinion.score, 0);
    // Calcula el promedio dividiendo el total por la cantidad de opiniones y redondea a un decimal
    const promedio = (total / opiniones.length).toFixed(1);

    if (promedio > 0) {
        return promedio; // si el promedio es mayor a 0, o sea que haya alguna calificación, muestra el promedio
    } else {
        return '<small class="fs-6">Aún no hay opiniones</small>'; // si no hay calificaciones (el promedio es 0), retorna este mensaje
    }
}

// Generar las barras de progreso de acuerdo a las calificaciones
function generarBarrasProgreso(opiniones) {
    // Define un array con las calificaciones posibles, de 5 a 1
    const calificaciones = [5, 4, 3, 2, 1];
    
    // Almacena la cantidad total de opiniones
    const total = opiniones.length;
    
    // Mapea cada calificación para generar el HTML correspondiente
    return calificaciones.map(score => {
        // Filtra las opiniones para contar cuántas tienen la calificación actual
        const cantidad = opiniones.filter(opinion => opinion.score === score).length;
        
        // Calcula el porcentaje de la calificación actual respecto al total de opiniones
        const porcentaje = (cantidad / total) * 100;

        // Devuelve el HTML para una barra de progreso, incluyendo el porcentaje y la cantidad
        return `
            <div class="progress my-2">
                <div class="progress-bar bg-secondary" role="progressbar" style="width: ${porcentaje}%" aria-valuenow="${porcentaje}" aria-valuemin="0" aria-valuemax="100">
                    <small>${score} <i class="fa-solid fa-star"></i> (${cantidad})</small>
                </div>
            </div>
        `;
    }).join(''); // Une todas las barras generadas en un solo string
}

document.addEventListener("DOMContentLoaded", function() {
    getJSONData(productID).then((resultado) => {
        if (resultado.status === "ok") {
            const product = resultado.data; 
            mostrarInfoProducto(product);
        } else {
            console.error("Error:", resultado.data);
        }
    }).catch(error => {
        console.error("Error al obtener datos:", error);
    });

    getJSONData(comentariosProducto).then((resultado) => {
        if (resultado.status === "ok") {
            opiniones = resultado.data; 
            mostrarComentariosProducto(opiniones);
        } else {
            console.error("Error:", resultado.data);
        }
    }).catch(error => {
        console.error("Error al obtener datos:", error);
    });

    
});
