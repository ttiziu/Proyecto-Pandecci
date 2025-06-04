document.addEventListener('DOMContentLoaded', () => {
    const quoteText = document.getElementById('quote-text');
    const quoteAuthor = document.getElementById('quote-author');
    const newQuoteBtn = document.getElementById('new-quote-btn');
    const twitterShareBtn = document.getElementById('twitter-share');
    const whatsappShareBtn = document.getElementById('whatsapp-share');
    const body = document.body; // Para cambiar el fondo

    // URLs de APIs de citas (puedes elegir una o combinarlas)
    const zenQuotesApiUrl = 'https://api.zenquotes.io/v1/random'; // Requiere CORS. Consulta su documentación.
    const forismaticApiUrl = 'https://api.forismatic.com/api/1.0/?method=getQuote&lang=es&format=jsonp'; // Es un JSONP
    // Otra opción: Unsplash para imágenes de fondo (requiere API Key y manejo de JSON)
    const unsplashApiUrl = 'https://api.unsplash.com/photos/random?orientation=landscape&query=nature,abstract';
    const unsplashAccessKey = 'TU_ACCESO_DE_UNSPLASH_AQUI'; // ¡IMPORTANTE! Reemplaza con tu clave de acceso de Unsplash

    // Paleta de colores para el fondo (simple)
    const backgroundColors = [
        '#f4f4f4', '#e0f7fa', '#ffe0b2', '#c8e6c9', '#bbdefb',
        '#d1c4e9', '#ffccbc', '#b2dfdb', '#f8bbd0', '#ffecb3'
    ];

    async function getNewQuote() {
        // Mostrar un estado de carga mientras se obtiene la cita
        quoteText.textContent = 'Cargando cita...';
        quoteAuthor.textContent = '';
        newQuoteBtn.disabled = true; // Deshabilitar botón para evitar múltiples peticiones

        try {
            // Intento con ZenQuotes API (generalmente más sencilla de usar)
            const response = await fetch(zenQuotesApiUrl);
            const data = await response.json(); // ZenQuotes devuelve un array con un objeto

            // Asegúrate de que la API de ZenQuotes no está bloqueada por CORS si pruebas localmente.
            // Para despliegue, usualmente funciona bien. Si no, considera un proxy o usar Forismatic.

            const quote = data[0].q; // Cita
            const author = data[0].a; // Autor

            quoteText.textContent = `"${quote}"`;
            quoteAuthor.textContent = `- ${author}`;

            // Mejoras: Compartir en redes sociales
            updateShareLinks(quote, author);

            // Mejoras: Cambiar el fondo
            changeBackground();

            // Mejoras: Cambiar imagen de fondo (opcional, requiere Unsplash API Key)
            // await changeBackgroundImage(); // Descomenta si quieres usar Unsplash

        } catch (error) {
            console.error('Error al obtener la cita:', error);
            quoteText.textContent = 'No se pudo cargar la cita. Intenta de nuevo.';
            quoteAuthor.textContent = '';
            // Si ZenQuotes da problemas, puedes intentar con Forismatic como fallback
            // getForismaticQuote();
        } finally {
            newQuoteBtn.disabled = false; // Habilitar el botón de nuevo
        }
    }

    // Función alternativa para Forismatic (usa JSONP, lo cual es diferente a Fetch API)
    // Para usar Forismatic, necesitarías una forma de manejar JSONP,
    // por ejemplo, insertando un script dinámicamente.
    // Esto es un poco más complejo que el uso directo de fetch.
    // function getForismaticQuote() {
    //     const script = document.createElement('script');
    //     script.src = forismaticApiUrl + '&jsonp=processForismaticQuote'; // La API llama a esta función
    //     document.body.appendChild(script);
    //     script.remove(); // Limpiar el script después de usarlo
    // }

    // Función de callback para Forismatic (si la usas)
    // window.processForismaticQuote = function(response) {
    //     if (response && response.quoteText && response.quoteAuthor) {
    //         quoteText.textContent = `"${response.quoteText}"`;
    //         quoteAuthor.textContent = `- ${response.quoteAuthor}`;
    //         updateShareLinks(response.quoteText, response.quoteAuthor);
    //         changeBackground();
    //     } else {
    //         console.error('Respuesta inválida de Forismatic');
    //         quoteText.textContent = 'No se pudo cargar la cita de Forismatic.';
    //     }
    // };


    function updateShareLinks(quote, author) {
        const encodedQuote = encodeURIComponent(`"${quote}" - ${author}`);

        // Compartir en Twitter
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedQuote}&hashtags=citaDelDia,inspiracion`;
        twitterShareBtn.href = twitterUrl;

        // Compartir en WhatsApp (usando la API web de WhatsApp)
        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedQuote}`;
        whatsappShareBtn.href = whatsappUrl;
    }

    function changeBackground() {
        const randomColor = backgroundColors[Math.floor(Math.random() * backgroundColors.length)];
        body.style.backgroundColor = randomColor;
    }

    // *** MEJORA AVANZADA: Cambiar imagen de fondo con Unsplash ***
    // Requiere una API Key de Unsplash y considerar los límites de requests.
    // Esta función DEBE SER async porque usa fetch.
    async function changeBackgroundImage() {
        if (!unsplashAccessKey || unsplashAccessKey === 'TU_ACCESO_DE_UNSPLASH_AQUI') {
            console.warn('Para usar imágenes de fondo de Unsplash, necesitas una API Key. Regístrate en unsplash.com/developers');
            return;
        }
        try {
            const response = await fetch(unsplashApiUrl, {
                headers: {
                    Authorization: `Client-ID ${unsplashAccessKey}`
                }
            });
            const data = await response.json();
            if (data && data.urls && data.urls.full) {
                body.style.backgroundImage = `url('${data.urls.full}')`;
                body.style.backgroundSize = 'cover';
                body.style.backgroundPosition = 'center';
                body.style.backgroundAttachment = 'fixed'; // Para que el fondo no se desplace
                body.style.color = 'white'; // Cambiar color de texto para que se vea sobre la imagen
                quoteText.style.color = 'white';
                quoteAuthor.style.color = '#ccc';
                // Puedes ajustar otros colores para que la cita sea legible.
            } else {
                console.warn('No se pudo obtener una imagen de Unsplash.');
                // Volver a color si falla
                changeBackground();
            }
        } catch (error) {
            console.error('Error al cargar imagen de Unsplash:', error);
            changeBackground(); // Volver a color si falla
        }
    }


    // Event Listener para el botón
    newQuoteBtn.addEventListener('click', getNewQuote);

    // Cargar una cita al inicio
    getNewQuote();
});