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
  });
