document.addEventListener('DOMContentLoaded', () => {
    var usuario = document.getElementById('inputUsuario');
    var contrasenia = document.getElementById('inputContrasenia');

    function validarCampo(campo) {
        if (campo.type === 'email') {
            if (campo.checkValidity() && campo.value !== '') {
                campo.classList.add('is-valid');
                campo.classList.remove('is-invalid');
            } else {
                campo.classList.add('is-invalid');
                campo.classList.remove('is-valid');
            }
        } else {
            if (campo.value.trim() === '') {
                campo.classList.add('is-invalid');
                campo.classList.remove('is-valid');
            } else {
                campo.classList.add('is-valid');
                campo.classList.remove('is-invalid');
            }
        }
    }

    usuario.addEventListener('input', () => validarCampo(usuario));
    contrasenia.addEventListener('input', () => validarCampo(contrasenia));

    document.getElementById('loginForm').addEventListener('submit', function (event) {
        var usuarioValue = usuario.value;
        var contraseniaValue = contrasenia.value;

        if (usuarioValue === "" || contraseniaValue === "") {
            event.preventDefault();
            alert("Por favor, completa ambos campos.");
        } else {
            event.preventDefault();
            localStorage.setItem("usuario", usuarioValue);
            localStorage.setItem('sesionIniciada', 'true');
            window.location.href = "index.html";
        }
    });
});
