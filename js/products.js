var autos = PRODUCTS_URL + "101" + EXT_TYPE; // URL de la categoría autos de la API
var listaDeProductos = document.getElementById('lista-de-productos');
var nombreCategoria = document.getElementById('nombreCategoria');

function mostrarProductos(product) {
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
}

document.addEventListener("DOMContentLoaded", function(){
    fetch(autos)
    .then(response => response.json()) // Convertir la respuesta a JSON
    .then(data => {
        nombreCategoria.innerHTML = data.catName;
        listaDeProductos.innerHTML = '';
        // Crear tarjetas para cada producto
        data.products.forEach(product => {
            mostrarProductos(product);
        });
    })
    .catch(error => console.error('Error al cargar los productos:', error));
});