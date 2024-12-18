const CATEGORIES_URL = "https://japceibal.github.io/emercado-api/cats/cat.json";
const PUBLISH_PRODUCT_URL = "https://japceibal.github.io/emercado-api/sell/publish.json";
const PRODUCTS_URL = "https://japceibal.github.io/emercado-api/cats_products/";
const PRODUCT_INFO_URL = "https://japceibal.github.io/emercado-api/products/";
const PRODUCT_INFO_COMMENTS_URL = "https://japceibal.github.io/emercado-api/products_comments/";
const CART_INFO_URL = "https://japceibal.github.io/emercado-api/user_cart/";
const CART_BUY_URL = "https://japceibal.github.io/emercado-api/cart/buy.json";
const EXT_TYPE = ".json";

let showSpinner = function(){
  document.getElementById("spinner-wrapper").style.display = "block";
}

let hideSpinner = function(){
  document.getElementById("spinner-wrapper").style.display = "none";
}

let getJSONData = function(url){
    let result = {};
    showSpinner();
    return fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      }else{
        throw Error(response.statusText);
      }
    })
    .then(function(response) {
          result.status = 'ok';
          result.data = response;
          hideSpinner();
          return result;
    })
    .catch(function(error) {
        result.status = 'error';
        result.data = error;
        hideSpinner();
        return result;
    });
}

window.onload = function () {
  // Verifica si la sesión no está iniciada
  if (localStorage.getItem('sesionIniciada') !== 'true') {
    window.location.href = 'login.html';  // Redirige al login
  } else {
    // Verifica si los datos obligatorios del perfil están completos
    let emailUsuario = localStorage.getItem('usuario');
    let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    let usuario = usuarios.find(u => u.email === emailUsuario);

    // Evita redirección si ya estás en la página de perfil
    if (!window.location.href.includes('my-profile.html')) {
      if (usuario) {
        let camposObligatoriosCompletos = usuario.nombre && usuario.apellido && usuario.email;
        if (!camposObligatoriosCompletos) {
          Swal.fire({
            title: "Información requerida",
            text: "Antes de continuar, completa los datos de tu perfil",
            icon: "info",
            confirmButtonText: 'Ir a "Mi Perfil"'
          }).then((result) => {
            if (result.isConfirmed) {
              window.location.href = 'my-profile.html';
            }
          });
          
        }
      } else {
        Swal.fire({
          title: "Información requerida",
          text: "Antes de continuar, completa los datos de tu perfil",
          icon: "info",
          confirmButtonText: 'Ir a "Mi Perfil"'
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.href = 'my-profile.html';
          }
        });
      }
    }
  }
};

// Guarda el localStorage el ID de un producto, para mostrar su información en poduct-info
let setProductID = function(id) {
  localStorage.setItem("productID", id);
  window.location = "product-info.html";
}

let getCurrentUser = function getCurrentUser() {
  const usuarios = JSON.parse(localStorage.getItem('usuarios')) || []; // Recupera del localStorage los usuarios 
  const emailActual = localStorage.getItem('usuario'); // Recupera del localStorage el usuario actual 
  return usuarios.find(usuario => usuario.email === emailActual); // Encuentra el usuario que coincida con el actual
}

let actualizarBadgeCarrito = function() {
  const currentUser = getCurrentUser(); // Recupera el usuario actual
  const carrito = currentUser.carrito; // Obtiene el carrito del usuario actual
  const cantidadTotal = carrito.reduce((total, producto) => total + producto.cantidad, 0); // Suma las cantidades de cada producto

  document.getElementById('badgeCarrito').innerText = cantidadTotal; // Actualiza el badge con la cantidad total
};


document.addEventListener("DOMContentLoaded", function(){ 
  var usuario = localStorage.getItem("usuario")|| "Invitado";
  var usuarioDisplay = document.getElementById("usuarioDisplay");
  if (usuarioDisplay){
    usuarioDisplay.textContent = usuario;
  }
document.getElementById('cerrarSesion').addEventListener('click', function () {
  localStorage.removeItem("usuario");
  // Elimina la sesión de localStorage
  localStorage.removeItem('sesionIniciada');
    // Redirige al login
  window.location.href = 'login.html';
    
  });
  
  // Cargar estado del modo desde Local Storage
  const emailUsuario = localStorage.getItem('usuario');  // Obtener el email del usuario actual
  if (emailUsuario) {
      const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
      const usuario = usuarios.find(u => u.email === emailUsuario);
      
      if (usuario) {
          // Cargar el estado del modo noche del usuario y aplicarlo
          const modoNoche = usuario.modoNoche || false;
          document.body.setAttribute('data-bs-theme', modoNoche ? 'dark' : 'light');
      }
  } else {
      // Si no hay usuario, aplicar modo claro por defecto
      document.body.setAttribute('data-bs-theme', 'light');
  }

  actualizarBadgeCarrito();
});