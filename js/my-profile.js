document.addEventListener('DOMContentLoaded', function() {
    const switchModoNoche = document.getElementById('switchModoNoche');
    const body = document.body;

    // Cargar estado del modo desde Local Storage
    const modoNocheActivo = localStorage.getItem('modoNoche') === 'true';
    switchModoNoche.checked = modoNocheActivo;
    body.setAttribute('data-bs-theme', modoNocheActivo ? 'dark' : 'light');

    // Cambiar tema y guardar en Local Storage
    switchModoNoche.addEventListener('change', () => {
      const modoNoche = switchModoNoche.checked;
      body.setAttribute('data-bs-theme', modoNoche ? 'dark' : 'light');
      localStorage.setItem('modoNoche', modoNoche);
    });

     // Seleccionamos el formulario y el campo de la imagen
     const profileForm = document.getElementById('profileForm');
     const fotoPerfil = document.getElementById('fotoPerfil');
     const previewImage = document.getElementById('previewImage');
 
     // Cargar la imagen almacenada en LocalStorage (si existe)
     window.onload = function() {
       const storedImage = localStorage.getItem('fotoPerfil');
       if (storedImage) {
         previewImage.src = storedImage;
       }
    const profileForm = document.getElementById('profileForm');
    const nombre = document.getElementById('nombre');
    const apellido = document.getElementById('apellido');
    const email = document.getElementById('email');
    

    // Convertir la imagen a base64 para almacenarla en LocalStorage
    fotoPerfil.addEventListener('change', function(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          const base64Image = e.target.result;
          previewImage.src = base64Image; // Mostrar la imagen seleccionada
          localStorage.setItem('fotoPerfil', base64Image); // Guardar en LocalStorage
        };
        reader.readAsDataURL(file); // Leer el archivo como base64
      }
    });
    // Escuchamos el evento submit del formulario
    profileForm.addEventListener('submit', function(event) {
      event.preventDefault(); // Prevenir el envío del formulario por defecto

      // Validamos si los campos obligatorios tienen algún valor
      if (nombre.value.trim() === '' || apellido.value.trim() === '' || email.value.trim() === '') {
        alert('Por favor, complete todos los campos obligatorios.');
      } else {
        // Si la validación es exitosa, guardamos los datos en LocalStorage
        localStorage.setItem('nombre', nombre.value);
        localStorage.setItem('apellido', apellido.value);
        localStorage.setItem('email', email.value);
        localStorage.setItem('segundoNombre', document.getElementById('segundoNombre').value);
        localStorage.setItem('segundoApellido', document.getElementById('segundoApellido').value);
        localStorage.setItem('telefono', document.getElementById('telefono').value);

        alert('Datos guardados correctamente');
      }
    });
  }});
