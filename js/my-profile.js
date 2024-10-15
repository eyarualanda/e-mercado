document.addEventListener('DOMContentLoaded', function () {

  const switchModoNoche = document.getElementById('switchModoNoche');
  const body = document.body;

  // Cargar estado del modo noche desde Local Storage.
  // Si 'modoNoche' está guardado en Local Storage y es 'true', activamos el modo oscuro.
  // También se asegura que el switch de modo noche esté marcado/desmarcado acorde.
  const modoNocheActivo = localStorage.getItem('modoNoche') === 'true';
  switchModoNoche.checked = modoNocheActivo;
  body.setAttribute('data-bs-theme', modoNocheActivo ? 'dark' : 'light');

  // Escucha cambios en el switch de modo noche.
  // Cada vez que el switch cambia, actualizamos el tema de la página (oscuro o claro)
  // y guardamos el estado en Local Storage.
  switchModoNoche.addEventListener('change', () => {
    const modoNoche = switchModoNoche.checked;
    body.setAttribute('data-bs-theme', modoNoche ? 'dark' : 'light');
    localStorage.setItem('modoNoche', modoNoche);
  });

  // Variables que hacen referencia a los elementos del formulario de perfil.
  const profileForm = document.getElementById('profileForm');
  const fotoPerfil = document.getElementById('fotoPerfil');
  const previewImage = document.getElementById('previewImage');
  const nombre = document.getElementById('nombre');
  const apellido = document.getElementById('apellido');
  const email = document.getElementById('email');
  const segundoNombre = document.getElementById('segundoNombre');
  const segundoApellido = document.getElementById('segundoApellido');
  const telefono = document.getElementById('telefono');

  // Cargar el correo del usuario desde Local Storage (que supuestamente se guarda al iniciar sesión).
  // Si existe, se carga en el campo 'email' y se llama a la función para cargar los demás datos del usuario.
  const usuario = localStorage.getItem('usuario');
  if (usuario) {
    email.value = usuario; // Coloca el email almacenado en el campo de email.
    cargarDatosUsuario(usuario); // Intenta cargar los datos del usuario desde Local Storage.
  }

  // Función que carga los datos del usuario desde Local Storage.
  // Recibe como parámetro el email del usuario y busca en el array de usuarios guardado.
  // Si encuentra el usuario, carga sus datos en los campos del formulario.
  function cargarDatosUsuario(emailUsuario) {
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const usuario = usuarios.find(u => u.email === emailUsuario);

    if (usuario) {
      nombre.value = usuario.nombre || '';
      apellido.value = usuario.apellido || '';
      segundoNombre.value = usuario.segundoNombre || '';
      segundoApellido.value = usuario.segundoApellido || '';
      telefono.value = usuario.telefono || '';
      // Si hay una imagen de perfil guardada, la muestra en el elemento de previsualización.
      if (usuario.fotoPerfil) {
        previewImage.src = usuario.fotoPerfil;
      }
    }
  }

  // Función para guardar o actualizar los datos del usuario en Local Storage.
  // Recibe un objeto 'usuario' con todos los datos y lo almacena en el array de usuarios.
  // Si el usuario ya existe (basado en el email), se actualizan sus datos, de lo contrario, se añade como nuevo.
  function guardarDatosUsuario(usuario) {
    let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const index = usuarios.findIndex(u => u.email === usuario.email);

    // Si el usuario ya existe en el array, se actualizan sus datos.
    if (index !== -1) {
      usuarios[index] = usuario;
    } else {
      // Si no existe, se agrega como nuevo.
      usuarios.push(usuario);
    }

    // Guardar el array actualizado de usuarios en Local Storage.
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
  }

  // Escuchar el cambio en el input de la imagen de perfil.
  // Cuando el usuario selecciona una nueva imagen, se convierte a base64 para almacenarla en Local Storage.
  // También se muestra en el elemento de previsualización de la imagen.
  fotoPerfil.addEventListener('change', function (event) {
    const file = event.target.files[0]; // Obtiene el archivo seleccionado.
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const base64Image = e.target.result; // Convierte la imagen a base64.
        previewImage.src = base64Image; // Muestra la imagen en la previsualización.
      };
      reader.readAsDataURL(file); // Leer el archivo como una URL de datos (base64).
    }
  });

  // Escuchar el evento de envío del formulario.
  // Cuando el formulario se envía, se verifica que los campos obligatorios estén completos.
  // Si todo está correcto, los datos del usuario se guardan en Local Storage.
  profileForm.addEventListener('submit', function (event) {
    event.preventDefault(); // Evita que el formulario se envíe de forma predeterminada.

    // Validación: verifica que los campos de nombre, apellido y email no estén vacíos.
    if (nombre.value.trim() === '' || apellido.value.trim() === '' || email.value.trim() === '') {
      alert('Por favor, complete todos los campos obligatorios.');
    } else {
      // Crear un objeto con los datos del usuario.
      const usuario = {
        nombre: nombre.value,
        apellido: apellido.value,
        email: email.value, // Se mantiene el correo con el que inició sesión.
        segundoNombre: segundoNombre.value,
        segundoApellido: segundoApellido.value,
        telefono: telefono.value,
        fotoPerfil: previewImage.src // Guardar la imagen actual en base64.
      };

      // Guardar los datos del usuario en Local Storage.
      guardarDatosUsuario(usuario);
      alert('Datos guardados correctamente');
    }
  });
});