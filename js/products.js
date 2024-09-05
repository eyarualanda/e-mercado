var catID = PRODUCTS_URL + localStorage.getItem('catID') + EXT_TYPE;
var listaDeProductos = document.getElementById('lista-de-productos');
var nombreCategoria = document.getElementById('nombreCategoria');

let minPrice = undefined;
let maxPrice = undefined;
let productsArray = [];

function mostrarProductos(productsArray) {
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

    document.getElementById("rangeFilterPrice").addEventListener("click", function(){
        minPrice = document.getElementById("rangeFilterPriceMin").value;
        maxPrice = document.getElementById("rangeFilterPriceMax").value;

        minPrice = minPrice ? parseInt(minPrice) : undefined;
        maxPrice = maxPrice ? parseInt(maxPrice) : undefined;

        mostrarProductos(productsArray);
    });

    document.getElementById("clearRangeFilter").addEventListener("click", function(){
        document.getElementById("rangeFilterPriceMin").value = '';
        document.getElementById("rangeFilterPriceMax").value = '';

        minPrice = undefined;
        maxPrice = undefined;

        mostrarProductos(productsArray);
    });

    document.getElementById("sortAsc").addEventListener("click", function(){
        productsArray.sort((a, b) => a.cost - b.cost);
        mostrarProductos(productsArray);
    });

    document.getElementById("sortDesc").addEventListener("click", function(){
        productsArray.sort((a, b) => b.cost - a.cost);
        mostrarProductos(productsArray);
    });

    document.getElementById("sortByCount").addEventListener("click", function(){
        productsArray.sort((a, b) => b.soldCount - a.soldCount);
        mostrarProductos(productsArray);
    });

    getJSONData(catID).then((resultado) => {
        if (resultado.status === "ok") {
            nombreCategoria.innerHTML = resultado.data.catName;
            productsArray = resultado.data.products; // Actualiza el arreglo de productos
            mostrarProductos(productsArray); // Muestra los productos
        } else {
            console.error("Error:", resultado.data);
        }
    }).catch(error => {
        console.error("Error al obtener datos:", error);
    });
});