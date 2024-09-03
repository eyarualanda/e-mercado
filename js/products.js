var autos = PRODUCTS_URL + "101" + EXT_TYPE; // URL de la categoría autos de la API
var listaDeProductos = document.getElementById('lista-de-productos');
var nombreCategoria = document.getElementById('nombreCategoria');

let minPrice = undefined;
let maxPrice = undefined;
let productsArray = [];

function mostrarProductos() {
    listaDeProductos.innerHTML = '';

    let filteredProducts = productsArray;

    if (minPrice !== undefined) {
        filteredProducts = filteredProducts.filter(product => product.cost >= minPrice);
    }

    if (maxPrice !== undefined) {
        filteredProducts = filteredProducts.filter(product => product.cost <= maxPrice);
    }

    filteredProducts.forEach(product => {
        listaDeProductos.innerHTML += `
            <div class="col-md-4 cursor-active">
                <div class="card h-100" style="width: 100%;">
                    <img src="${product.image}" class="card-img-top" alt="${product.name}">
                    <div class="card-body">
                        <h5 class="card-title title">${product.name}</h5>
                        <p class="card-text">${product.description}</p>
                    </div>
                    <div class="card-footer">
                        <p class="text-body-secondary precio">Precio: ${product.currency} ${product.cost}</p>
                        <p class="text-body-secondary cantVend">Cantidad de vendidos: ${product.soldCount}</p>
                    </div>
                </div>
            </div>
        `;
    });
}

document.addEventListener("DOMContentLoaded", function(){
    fetch(autos)
    .then(response => response.json())
    .then(data => {
        nombreCategoria.innerHTML = data.catName;
        productsArray = data.products;
        mostrarProductos();
    })
    .catch(error => console.error('Error al cargar los productos:', error));
});

document.getElementById("rangeFilterPrice").addEventListener("click", function(){
    minPrice = document.getElementById("rangeFilterPriceMin").value;
    maxPrice = document.getElementById("rangeFilterPriceMax").value;

    minPrice = minPrice ? parseInt(minPrice) : undefined;
    maxPrice = maxPrice ? parseInt(maxPrice) : undefined;

    mostrarProductos();
});

document.getElementById("clearRangeFilter").addEventListener("click", function(){
    document.getElementById("rangeFilterPriceMin").value = '';
    document.getElementById("rangeFilterPriceMax").value = '';

    minPrice = undefined;
    maxPrice = undefined;

    mostrarProductos();
});

document.getElementById("sortAsc").addEventListener("click", function(){
    productsArray.sort((a, b) => a.cost - b.cost);
    mostrarProductos();
});

document.getElementById("sortDesc").addEventListener("click", function(){
    productsArray.sort((a, b) => b.cost - a.cost);
    mostrarProductos();
});

document.getElementById("sortByCount").addEventListener("click", function(){
    productsArray.sort((a, b) => b.soldCount - a.soldCount);
    mostrarProductos();
});