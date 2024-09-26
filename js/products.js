var catID = PRODUCTS_URL + localStorage.getItem('catID') + EXT_TYPE;
var listaDeProductos = document.getElementById('lista-de-productos');
var nombreCategoria = document.getElementById('nombreCategoria');

let minPrice = undefined;
let maxPrice = undefined;
let productsArray = [];
let searchProducts = '';

// Función que guarda el ID del producto seleccionado y redirige a la página de detalles del producto
function setProductID(id) {
    localStorage.setItem("productID", id);
    window.location = "product-info.html";
}

// Función que crea una tarjeta de producto
var crearTarjeta = function crearTarjeta(product) {
    return `
        <div onclick="setProductID(${product.id})" class="col-md-4 cursor-active">
            <div class="card h-100" style="width: 100%;">
                <img src="${product.image}" class="card-img-top" alt="${product.name}">
                <div class="card-body">
                    <h5 class="card-title title">${product.name}</h5>
                    <p class="card-text">${product.description}</p>
                    <p class="text-body-secondary precio">${product.currency} ${product.cost}</p>
                    <p class="text-body-secondary cantVend">Cantidad de vendidos: ${product.soldCount}</p>
                    <div class="d-grid gap-2">
                        <button id="buyButton" class="btn btn-primary w-10 p-2">
                            <i class="fas fa-shopping-bag"></i> Comprar
                        </button>
                        <button id="addToCartButton" class="btn btn-secondary w-10 p-2">
                            <i class="fas fa-cart-plus"></i> Agregar al carrito
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Función que muestra los productos filtrados en el contenedor
function mostrarProductos(productsArray) {
    listaDeProductos.innerHTML = ''; // Limpiar el contenedor de productos

    let filteredProducts = productsArray;

    // Filtrar productos por precio mínimo
    if (minPrice !== undefined) {
        filteredProducts = filteredProducts.filter(product => product.cost >= minPrice);
    }

    // Filtrar productos por precio máximo
    if (maxPrice !== undefined) {
        filteredProducts = filteredProducts.filter(product => product.cost <= maxPrice);
    }
    
    // Filtrar productos por término de búsqueda
    if (searchProducts) {
        filteredProducts = filteredProducts.filter(product => 
            product.name.toLowerCase().includes(searchProducts.toLowerCase()) || 
            product.description.toLowerCase().includes(searchProducts.toLowerCase())
        );
    }
    
    // Verificar si no hay productos para mostrar
    if (filteredProducts.length === 0) {
        listaDeProductos.innerHTML = `
            <div class="d-flex justify-content-center align-items-center m-auto w-100">
                <div class="text-center p-4 shadow rounded" role="alert">
                    <h4 class="alert-heading">No hay productos disponibles.</h4>
                    <p>Prueba ajustar los filtros o selecciona otra categoría.</p>
                </div>
            </div>
        `;
    } else {
        // Crear y agregar la estructura HTML de cada producto filtrado
        filteredProducts.forEach(product => {
            listaDeProductos.innerHTML += crearTarjeta(product);
        });
    }
}

document.addEventListener("DOMContentLoaded", function() {
    // Filtrar productos por rango de precios cuando se hace clic en el botón de filtrar
    document.getElementById("rangeFilterPrice").addEventListener("click", function() {
        minPrice = document.getElementById("rangeFilterPriceMin").value;
        maxPrice = document.getElementById("rangeFilterPriceMax").value;

        minPrice = minPrice ? parseInt(minPrice) : undefined;
        maxPrice = maxPrice ? parseInt(maxPrice) : undefined;

        mostrarProductos(productsArray); // Actualizar la lista de productos
    });

    // Limpiar los filtros de precio cuando se hace clic en el botón de limpiar
    document.getElementById("clearRangeFilter").addEventListener("click", function() {
        document.getElementById("rangeFilterPriceMin").value = '';
        document.getElementById("rangeFilterPriceMax").value = '';

        minPrice = undefined;
        maxPrice = undefined;

        mostrarProductos(productsArray); // Actualizar la lista de productos
    });

    // Función para ordenar los productos según el criterio pasado como argumento
    function ordenarProductos(comparador) {
        productsArray.sort(comparador);
        mostrarProductos(productsArray); // Mostrar productos ordenados
    }

    // Ordenar productos de menor a mayor precio
    document.getElementById("sortAsc").addEventListener("click", function() {
        ordenarProductos((a, b) => a.cost - b.cost);
    });

    // Ordenar productos de mayor a menor precio
    document.getElementById("sortDesc").addEventListener("click", function() {
        ordenarProductos((a, b) => b.cost - a.cost);
    });

    // Ordenar productos por cantidad de vendidos
    document.getElementById("sortByCount").addEventListener("click", function() {
        ordenarProductos((a, b) => b.soldCount - a.soldCount);
    });

    // Filtrar productos según el término de búsqueda introducido por el usuario
    document.getElementById("search").addEventListener("input", function() {
        searchProducts = this.value;
        mostrarProductos(productsArray); // Actualizar la lista de productos
    });

    // Obtener los datos de los productos desde el servidor y mostrarlos
    getJSONData(catID).then((resultado) => {
        if (resultado.status === "ok") {
            nombreCategoria.innerHTML = resultado.data.catName;
            productsArray = resultado.data.products; // Guardar los productos obtenidos
            mostrarProductos(productsArray); // Mostrar los productos
        } else {
            console.error("Error:", resultado.data);
        }
    }).catch(error => {
        console.error("Error al obtener datos:", error);
    });

    // Script para manejar el despliegue de la barra de búsqueda y filtro en pantallas pequeñas
    const searchIcon = document.querySelector('.search-icon button');
    const searchBar = document.querySelector('.search-bar');
    const priceFilterIcon = document.querySelector('.price-filter-icon button');
    const priceFilter = document.querySelector('.price-filter');

    // Alternar entre mostrar la barra de búsqueda y el filtro de precio
    function toggleElemento(elementoMostrar, elementoOcultar) {
        elementoMostrar.classList.toggle('show');
        if (elementoOcultar.classList.contains('show')) {
            elementoOcultar.classList.remove('show');
        }
    }

    // Mostrar u ocultar la barra de búsqueda
    searchIcon.addEventListener('click', function () {
        toggleElemento(searchBar, priceFilter);
    });

    // Mostrar u ocultar el filtro de precio
    priceFilterIcon.addEventListener('click', function () {
        toggleElemento(priceFilter, searchBar);
    });

    // Ocultar barra de búsqueda y filtro cuando se hace clic fuera de ellos
    document.addEventListener('click', function (event) {
        if (!searchBar.contains(event.target) && !searchIcon.contains(event.target)) {
            searchBar.classList.remove('show');
        }
        if (!priceFilter.contains(event.target) && !priceFilterIcon.contains(event.target)) {
            priceFilter.classList.remove('show');
        }
    });

    // Evitar que al hacer clic dentro de la barra de búsqueda o filtro se oculten
    searchBar.addEventListener('click', function (event) {
        event.stopPropagation();
    });

    priceFilter.addEventListener('click', function (event) {
        event.stopPropagation();
    });
});