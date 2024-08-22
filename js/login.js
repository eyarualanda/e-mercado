document.getElementById('loginForm').addEventListener('submit', function (event) {
    // Obtener valores de los campos de entrada
    var usuario = document.getElementById('inputUsuario').value;
    var contrasenia = document.getElementById('inputContraseña').value;

    // Verificará si los campos están vacíos
    if (usuario === "" || contrasenia === "") {
        // Previene el envío del formulario con campos vacíos
        event.preventDefault();
        alert("Por favor, completa ambos campos.");
    }else{
        // Redirige a la página de portada si los campos no están vacíos
        event.preventDefault();  // Previene la recarga del formulario
        window.location.href = "index.html";  // Cambia "index.html" a la ruta correcta
                // Guarda la sesión en localStorage
localStorage.setItem('sesionIniciada', 'true');
  window.location.href = "index.html";  // Redirige a la página de portada
}
});

window.onload = function () {
    // Verifica si la sesión no está iniciada
if (localStorage.getItem('sesionIniciada') !== 'true') {
        window.location.href = 'login.html';  // Redirige al login
}
};
document.getElementById('cerrarSesion').addEventListener('click', function () {
              // Elimina la sesión de localStorage
            localStorage.removeItem('sesionIniciada')
              // Redirige al login
            window.location.href = 'login.html';
        ;
    })