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
}
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
});

// Guarda el localStorage el ID de un producto, para mostrar su información en poduct-info
let setProductID = function(id) {
  localStorage.setItem("productID", id);
  window.location = "product-info.html";
}