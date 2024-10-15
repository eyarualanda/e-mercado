document.addEventListener('DOMContentLoaded', function () {

  // Referencias a los elementos del interruptor de modo noche y el body de la página.
  const switchModoNoche = document.getElementById('switchModoNoche');
  const body = document.body;

  // Cargar el estado del modo noche desde Local Storage y aplicarlo al cargar la página.
  // Si 'modoNoche' es true, activamos el tema oscuro. De lo contrario, el tema claro.
  const modoNocheActivo = localStorage.getItem('modoNoche') === 'true';
  switchModoNoche.checked = modoNocheActivo;  // Establece el estado del interruptor.
  body.setAttribute('data-bs-theme', modoNocheActivo ? 'dark' : 'light');  // Cambia el tema visual de la página.

  // Escucha cambios en el switch del modo noche para alternar entre claro y oscuro.
  switchModoNoche.addEventListener('change', () => {
    const modoNoche = switchModoNoche.checked;
    body.setAttribute('data-bs-theme', modoNoche ? 'dark' : 'light'); // Aplica el tema seleccionado.
    localStorage.setItem('modoNoche', modoNoche);  // Guarda la preferencia en Local Storage para mantener el tema en futuras visitas.
  });

  // Referencias a los elementos del formulario de perfil.
  const profileForm = document.getElementById('profileForm');
  const fotoPerfil = document.getElementById('fotoPerfil');
  const previewImage = document.getElementById('previewImage');
  const nombre = document.getElementById('nombre');
  const apellido = document.getElementById('apellido');
  const email = document.getElementById('email');
  const segundoNombre = document.getElementById('segundoNombre');
  const segundoApellido = document.getElementById('segundoApellido');
  const telefono = document.getElementById('telefono');

  // Cargar el email del usuario almacenado en Local Storage al iniciar sesión.
  // Si existe un email guardado, se carga y se buscan los demás datos asociados al usuario.
  const usuario = localStorage.getItem('usuario');
  if (usuario) {
    email.value = usuario;  // Carga el email en el campo correspondiente.
    cargarDatosUsuario(usuario);  // Llama a la función que carga otros datos del perfil.
  }

  // Función para cargar los datos del usuario desde Local Storage.
  function cargarDatosUsuario(emailUsuario) {
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];  // Obtener la lista de usuarios, o un array vacío si no existen.
    const usuario = usuarios.find(u => u.email === emailUsuario);  // Buscar el usuario por email.

    if (usuario) {
      // Asignar los datos del usuario a los campos del formulario si existen.
      nombre.value = usuario.nombre || '';
      apellido.value = usuario.apellido || '';
      segundoNombre.value = usuario.segundoNombre || '';
      segundoApellido.value = usuario.segundoApellido || '';
      telefono.value = usuario.telefono || '';

      // Si hay una imagen de perfil almacenada, mostrarla.
      if (usuario.fotoPerfil) {
        previewImage.src = usuario.fotoPerfil;
      }
    }
  }

  // Función para guardar o actualizar los datos del usuario en Local Storage.
  function guardarDatosUsuario(usuario) {
    let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];  // Obtener la lista de usuarios.
    const index = usuarios.findIndex(u => u.email === usuario.email);  // Buscar si el usuario ya existe.

    if (index !== -1) {
      // Si el usuario ya existe, actualizar sus datos.
      usuarios[index] = usuario;
    } else {
      // Si no existe, agregar el nuevo usuario a la lista.
      usuarios.push(usuario);
    }

    // Guardar la lista actualizada de usuarios en Local Storage.
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
  }

  // Manejar el cambio en el input de la imagen de perfil.
  // Convierte la imagen a base64 para almacenarla y muestra una previsualización.
  fotoPerfil.addEventListener('change', function (event) {
    const file = event.target.files[0];  // Obtiene el archivo de la imagen seleccionada.
    if (file) {
      const reader = new FileReader();  // Crear un lector de archivos para convertir la imagen.
      reader.onload = function (e) {
        const base64Image = e.target.result;  // Convierte la imagen a base64.
        previewImage.src = base64Image;  // Muestra la imagen en la previsualización.
      };
      reader.readAsDataURL(file);  // Leer el archivo como URL de datos (base64).
    } else {
      // Si el archivo no es válido o el usuario no seleccionó uno, restablecer la imagen de previsualización.
      previewImage.src = '';  // Vaciar la previsualización si no hay archivo.
    }
  });

  // Función para validar si un campo está vacío en tiempo real.
  // Si el campo está vacío, se aplica la clase 'is-invalid', de lo contrario, 'is-valid'.
  function validarCampo(campo) {
    if (campo.value.trim() === '') {
      campo.classList.add('is-invalid');  // Marca el campo como inválido.
      campo.classList.remove('is-valid');
    } else {
      campo.classList.add('is-valid');  // Marca el campo como válido.
      campo.classList.remove('is-invalid');
    }
  }

  // Validación en tiempo real de los campos de nombre, apellido y email.
  nombre.addEventListener('input', () => validarCampo(nombre));  // Validar cuando el usuario escribe en el campo de nombre.
  apellido.addEventListener('input', () => validarCampo(apellido));  // Validar cuando el usuario escribe en el campo de apellido.
  email.addEventListener('input', () => validarCampo(email));  // Validar cuando el usuario escribe en el campo de email.

  // Manejar el envío del formulario con validación de campos obligatorios.
  profileForm.addEventListener('submit', function (event) {
    event.preventDefault();  // Evitar el envío automático del formulario.
    event.stopPropagation();  // Evitar la propagación del evento.

    // Validar todos los campos obligatorios.
    validarCampo(nombre);
    validarCampo(apellido);
    validarCampo(email);

    // Si todos los campos obligatorios son válidos, guardar los datos del usuario.
    if (nombre.classList.contains('is-valid') && apellido.classList.contains('is-valid') && email.classList.contains('is-valid')) {
      const usuario = {
        nombre: nombre.value,
        apellido: apellido.value,
        email: email.value,
        segundoNombre: segundoNombre.value,
        segundoApellido: segundoApellido.value,
        telefono: telefono.value,
        fotoPerfil: previewImage.src  // Guardar la imagen de perfil en base64.
      };

      guardarDatosUsuario(usuario);  // Guardar o actualizar los datos del usuario en Local Storage.
      alert('Datos guardados correctamente');
    } else {
      // Mostrar una alerta si los campos obligatorios no están completos.
      alert('Por favor, complete todos los campos obligatorios.');
    }
  });
});
