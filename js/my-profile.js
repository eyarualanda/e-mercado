document.addEventListener('DOMContentLoaded', function () {

  // Ruta de la imagen predeterminada de perfil.
  const defaultProfileImg = 'img/default_profile_img.jpg'; // Cambia esta ruta a la ubicación correcta de tu imagen.

  // Referencias a los elementos del interruptor de modo noche y el body de la página.
  const switchModoNoche = document.getElementById('switchModoNoche');
  const body = document.body;

  // Cargar el estado del modo noche desde Local Storage y aplicarlo al cargar la página.
  const modoNocheActivo = localStorage.getItem('modoNoche') === 'true';
  switchModoNoche.checked = modoNocheActivo;
  body.setAttribute('data-bs-theme', modoNocheActivo ? 'dark' : 'light');

  // Escucha cambios en el switch del modo noche para alternar entre claro y oscuro.
  switchModoNoche.addEventListener('change', () => {
    const modoNoche = switchModoNoche.checked;
    body.setAttribute('data-bs-theme', modoNoche ? 'dark' : 'light');
    localStorage.setItem('modoNoche', modoNoche);
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
  const usuario = localStorage.getItem('usuario');
  if (usuario) {
    email.value = usuario;
    cargarDatosUsuario(usuario);
  } else {
    // Si no hay un usuario, establecer la imagen predeterminada.
    previewImage.src = defaultProfileImg;
  }

  // Función para cargar los datos del usuario desde Local Storage.
  function cargarDatosUsuario(emailUsuario) {
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const usuario = usuarios.find(u => u.email === emailUsuario);

    if (usuario) {
      // Asignar los datos del usuario a los campos del formulario.
      nombre.value = usuario.nombre || '';
      apellido.value = usuario.apellido || '';
      segundoNombre.value = usuario.segundoNombre || '';
      segundoApellido.value = usuario.segundoApellido || '';
      telefono.value = usuario.telefono || '';

      // Si hay una imagen de perfil almacenada, mostrarla. Si no, usar la imagen predeterminada.
      previewImage.src = usuario.fotoPerfil || defaultProfileImg;
    } else {
      // Si no existe el usuario, usar la imagen predeterminada.
      previewImage.src = defaultProfileImg;
    }
  }

  // Función para guardar o actualizar los datos del usuario en Local Storage.
  function guardarDatosUsuario(usuario) {
    let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const index = usuarios.findIndex(u => u.email === usuario.email);

    if (index !== -1) {
      usuarios[index] = usuario;
    } else {
      usuarios.push(usuario);
    }

    localStorage.setItem('usuarios', JSON.stringify(usuarios));
  }

  // Manejar el cambio en el input de la imagen de perfil.
  fotoPerfil.addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const base64Image = e.target.result;
        previewImage.src = base64Image;
      };
      reader.readAsDataURL(file);
    } else {
      // Si no se selecciona ninguna imagen, mostrar la imagen predeterminada.
      previewImage.src = defaultProfileImg;
    }
  });

  // Función para validar si un campo está vacío en tiempo real.
  function validarCampo(campo) {
    if (campo.value.trim() === '') {
      campo.classList.add('is-invalid');
      campo.classList.remove('is-valid');
    } else {
      campo.classList.add('is-valid');
      campo.classList.remove('is-invalid');
    }
  }

  // Validación en tiempo real de los campos de nombre, apellido y email.
  nombre.addEventListener('input', () => validarCampo(nombre));
  apellido.addEventListener('input', () => validarCampo(apellido));
  email.addEventListener('input', () => validarCampo(email));

  // Manejar el envío del formulario con validación de campos obligatorios.
  profileForm.addEventListener('submit', function (event) {
    event.preventDefault();
    event.stopPropagation();

    validarCampo(nombre);
    validarCampo(apellido);
    validarCampo(email);

    if (nombre.classList.contains('is-valid') && apellido.classList.contains('is-valid') && email.classList.contains('is-valid')) {
      const usuario = {
        nombre: nombre.value,
        apellido: apellido.value,
        email: email.value,
        segundoNombre: segundoNombre.value,
        segundoApellido: segundoApellido.value,
        telefono: telefono.value,
        fotoPerfil: previewImage.src || defaultProfileImg  // Guardar la imagen de perfil o la predeterminada.
      };

      guardarDatosUsuario(usuario);
      alert('Datos guardados correctamente');
    } else {
      alert('Por favor, complete todos los campos obligatorios.');
    }
  });
});
