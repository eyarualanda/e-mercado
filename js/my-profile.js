document.addEventListener('DOMContentLoaded', function () {

  // Ruta de la imagen predeterminada de perfil.
  const defaultProfileImg = 'img/default_profile_img.jpg'; // Cambia esta ruta a la ubicación correcta de tu imagen.

  // Referencias a los elementos del interruptor de modo noche y el body de la página.
  const switchModoNoche = document.getElementById('switchModoNoche');
  const body = document.body;

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
  
  // Referencia al elemento donde se muestra el email del usuario en el navbar
  const usuarioDisplay = document.getElementById('usuarioDisplay');

  // Cargar el email del usuario almacenado en Local Storage al iniciar sesión.
  const usuarioGuardado = localStorage.getItem('usuario');
  if (usuarioGuardado) {
    email.value = usuarioGuardado;
    usuarioDisplay.textContent = usuarioGuardado; // Mostrar el email en el navbar
    cargarDatosUsuario(usuarioGuardado);
  } else {
    // Si no hay un usuario, establecer la imagen predeterminada.
    previewImage.src = defaultProfileImg;
    body.setAttribute('data-bs-theme', 'light'); // Modo claro por defecto.
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

      // Cargar imagen de perfil o establecer la imagen predeterminada.
      previewImage.src = usuario.fotoPerfil || defaultProfileImg;

      // Cargar el estado del modo oscuro.
      const modoNocheActivo = usuario.modoNoche || false;
      switchModoNoche.checked = modoNocheActivo;
      body.setAttribute('data-bs-theme', modoNocheActivo ? 'dark' : 'light');
    } else {
      // Si no existe el usuario, usar la imagen predeterminada y modo claro.
      previewImage.src = defaultProfileImg;
      body.setAttribute('data-bs-theme', 'light');
    }
  }

  // Función para guardar o actualizar los datos del usuario en Local Storage.
  function guardarDatosUsuario(usuario) {
    let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const index = usuarios.findIndex(u => u.email === usuario.email);

    if (index !== -1) {
      usuarios[index] = usuario; // Actualizar el usuario existente.
    } else {
      usuarios.push(usuario); // Agregar el nuevo usuario.
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

  // Escucha cambios en el switch del modo noche.
  switchModoNoche.addEventListener('change', () => {
    const modoNoche = switchModoNoche.checked;
    body.setAttribute('data-bs-theme', modoNoche ? 'dark' : 'light');
    
    // Obtener el email del usuario actual
    const emailUsuario = email.value;
    if (emailUsuario) {
        let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
        const index = usuarios.findIndex(u => u.email === emailUsuario);

        if (index !== -1) {
            // Actualizar el estado del modo noche del usuario en el array
            usuarios[index].modoNoche = modoNoche;

            // Guardar los cambios en localStorage
            localStorage.setItem('usuarios', JSON.stringify(usuarios));
        }
    }
  });

  // Función para validar si un campo está vacío en tiempo real.
  // Función para validar si un campo está vacío o, si es email, que tenga un formato válido.
function validarCampo(campo) {
  if (campo.type === 'email') {
    // Validación de email usando checkValidity()
    if (campo.checkValidity()) {
      campo.classList.add('is-valid');
      campo.classList.remove('is-invalid');
    } else {
      campo.classList.add('is-invalid');
      campo.classList.remove('is-valid');
    }
  } else {
    // Validación para otros campos (que no estén vacíos)
    if (campo.value.trim() === '') {
      campo.classList.add('is-invalid');
      campo.classList.remove('is-valid');
    } else {
      campo.classList.add('is-valid');
      campo.classList.remove('is-invalid');
    }
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
        fotoPerfil: previewImage.src || defaultProfileImg,  // Guardar la imagen de perfil o la predeterminada.
        modoNoche: switchModoNoche.checked  // Guardar el estado del modo oscuro.
      };

      guardarDatosUsuario(usuario);  // Guardar o actualizar los datos del usuario en Local Storage.
      localStorage.setItem('usuario', email.value); // Actualizar el email en localStorage

      // Actualizar el email del usuario en el navbar
      usuarioDisplay.textContent = email.value;
      
      alert('Datos guardados correctamente');
    } else {
      alert('Por favor, complete todos los campos obligatorios.');
    }
  });
});