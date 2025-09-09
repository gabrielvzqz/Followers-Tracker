let idiomaActual = 'en'; // valor por defecto
let resultadosA = [];
let resultadosB = [];
const textos = {
    es: {
        titulo: "Follower Analyzer",
        descripcion: "Analiza tus seguidores de manera rápida y sencilla",
        btnEmpezar: "Analizar",
        followers: "Seguidores:",
        following: "Seguidos:",
        check: "Comparar",
        reset: "Borrar",
        results: "Resultados",
        aclaracion: "Algunos nombres de usuario pueden aparecer con la biografía del perfil debajo.",
        notFollowing: "No Sigues",
        notFollowingYou: "No Te Siguen",
        ordenPorDefecto: "Por defecto",
        ordenAlfabetico: "Alfabético",
        tutorialBtn: "Tutorial",
        sobreMiBtn: "Sobre mí",
        compartirBtn: "Compartir",
        tutorialLabel: "Tutorial",
        sobreMiLabel: "Sobre mí",
        sobreMiTexto: "Soy un desarrollador en formación y esta página es uno de mis proyectos personales. Está hecha con cuidado y funcionalidad en mente, buscando que sea práctica y fácil de usar sin iniciar sesión en tu cuenta.",
    },
    en: {
        titulo: "Follower Analyzer",
        descripcion: "Analyze your followers quickly and easily",
        btnEmpezar: "Analyze",
        followers: "Followers:",
        following: "Following:",
        check: "Check",
        reset: "Reset",
        results: "Results",
        aclaracion: "Some usernames may appear with the profile bio underneath.",
        notFollowing: "Not Following:",
        notFollowingYou: "Not Following You:",
        ordenPorDefecto: "Default",
        ordenAlfabetico: "Alphabetical",
        tutorialBtn: "Tutorial",
        sobreMiBtn: "About Me",
        compartirBtn: "Share",
        tutorialLabel: "Tutorial",
        sobreMiLabel: "About Me",
        sobreMiTexto: "I'm a Junior Developer, and this page is one of my personal projects. It was built with care and functionality in mind, aiming for it to be practical and easy to use and without logging into your account",
    }
};
document.getElementById('btnCheck').addEventListener('click', function (e) {
    e.preventDefault(); // Evita que se recargue la página
    comparar(); // Llama a tu función
});

document.getElementById('btnReset').addEventListener('click', function (e) {
    e.preventDefault(); // Evita que se recargue la página
    resetear(); // Llama a tu función
});
// Función para limpiar cualquier línea inválida
function limpiarYNormalizar(lineas) {
    const emojiRegex = /[\p{Emoji_Presentation}\p{Emoji}\u231A-\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD-\u25FE\u2600-\u27BF\u2934-\u2935\u2B05-\u2B07\u2B1B-\u2B1C\u2B50\u2B55]/u;
    const resultados = [];
    const vistos = new Set();

    for (let linea of lineas) {
        const original = linea.trim();
        if (!original) continue;

        const lower = original.toLowerCase();

        // Eliminamos solo si es interpuncto o nombres de perfil
        if (lower === "·" || lower.includes("profile photo") || lower.includes("foto del perfil")) continue;


        // Normalizamos para comparar: minúsculas y sin espacios
        const normalizado = lower.replace(/\s+/g, '');

        // Evitamos duplicados internos
        if (!vistos.has(normalizado)) {
            resultados.push({ original, normalizado });
            vistos.add(normalizado);
        }
    }

    return resultados;
}

async function comparar() {
    const listaA = document.getElementById("listaA").value.split("\n");
    const listaB = document.getElementById("listaB").value.split("\n");

    const usuariosA = limpiarYNormalizar(listaA);
    const usuariosB = limpiarYNormalizar(listaB);

    // Enviar solo las versiones normalizadas al backend
    const response = await fetch("/comparar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            listaA: usuariosA.map(u => u.normalizado),
            listaB: usuariosB.map(u => u.normalizado)
        })
    });

    const data = await response.json();

    // Mapear resultados a nombres originales
    resultadosA = usuariosA
        .filter(u => data.solo_en_A.includes(u.normalizado))
        .map(u => u.original);

    resultadosB = usuariosB
        .filter(u => data.solo_en_B.includes(u.normalizado))
        .map(u => u.original);

    document.getElementById("bloqueResultados").style.display = "block";
    mostrarResultados(resultadosA, resultadosB);
}

function mostrarResultados(resA, resB) {
    const t = textos[idiomaActual]; // idioma actual

    const emojiRegex = /[\p{Emoji_Presentation}\p{Emoji}\u231A-\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD-\u25FE\u2600-\u27BF\u2934-\u2935\u2B05-\u2B07\u2B1B-\u2B1C\u2B50\u2B55]/u;

    const formatear = (nombre) => {
        const empiezaMayus = /^[A-Z]/.test(nombre);
        if (!emojiRegex.test(nombre) && !empiezaMayus) {
            return `<strong>${nombre}</strong>`;
        }
        return nombre;
    };

    document.getElementById("resultadoA").innerHTML = resA.map(formatear).join("<hr>");
    document.getElementById("resultadoB").innerHTML = resB.map(formatear).join("<hr>");
}


function ordenarResultados() {
    const tipo = document.getElementById("ordenResultados").value;

    let resA = resultadosA.slice();
    let resB = resultadosB.slice();

    if (tipo === "alfabetico") {
        resA.sort((a, b) => a.localeCompare(b));
        resB.sort((a, b) => a.localeCompare(b));
    }

    mostrarResultados(resA, resB);
}

function resetear() {
    document.getElementById("listaA").value = "";
    document.getElementById("listaB").value = "";
    document.getElementById("resultadoA").innerHTML = "";
    document.getElementById("resultadoB").innerHTML = "";
    document.getElementById("bloqueResultados").style.display = "none";
}
function cambiarIdioma(idioma) {
    const t = textos[idioma];

    // Portada
    document.querySelector('.hero h1').textContent = t.titulo;
    document.querySelector('.hero p').textContent = t.descripcion;
    document.querySelector('.hero a').textContent = t.btnEmpezar;

    // Etiquetas de formularios
    document.querySelector('label[for="listaA"]').textContent = t.followers;
    document.querySelector('label[for="listaB"]').textContent = t.following;

    // Botones
    document.getElementById('btnCheck').textContent = t.check;
    document.getElementById('btnReset').textContent = t.reset;


    // Resultados
    document.getElementById('tituloResultados').textContent = t.results;
    document.getElementById('aclaracion').textContent = t.aclaracion;
    document.getElementById('tituloNoSiguen').textContent = t.notFollowing;
    document.getElementById('tituloNoLosSigues').textContent = t.notFollowingYou;

    // Select de ordenación
    const selectOrden = document.getElementById("ordenResultados");
    selectOrden.options[0].text = t.ordenPorDefecto;
    selectOrden.options[1].text = t.ordenAlfabetico;
    // Los títulos dentro de las tarjetas se cambiarán dinámicamente al generar los resultados

    // Botones nuevos
    document.getElementById("btnTutorial").textContent = t.tutorialBtn;
    document.getElementById("btnSobreMi").textContent = t.sobreMiBtn;
    document.getElementById("btnCompartir").textContent = t.compartirBtn;


    // Títulos modales
    document.getElementById("tutorialLabel").textContent = t.tutorialLabel;
    document.getElementById("sobreMiLabel").textContent = t.sobreMiLabel;
    document.getElementById("sobreMiTexto").textContent = t.sobreMiTexto;
}
document.querySelectorAll('.iconos-fondo i').forEach(icono => {
    const top = Math.random() * 100; // porcentaje vertical
    const left = Math.random() * 100; // porcentaje horizontal
    const size = 1 + Math.random() * 3; // tamaño aleatorio entre 1rem y 3rem
    const rot = Math.random() * 360; // rotación aleatoria

    icono.style.top = top + '%';
    icono.style.left = left + '%';
    icono.style.fontSize = size + 'rem';
    icono.style.transform = `rotate(${rot}deg)`;
});
function compartirPagina() {
    if (navigator.share) {
        navigator.share({
            title: 'Follower Analyzer',
            text: 'Check out this tool to compare your followers!',
            url: window.location.href,
        }).catch(console.error);
    } else {
        alert('Your browser does not support sharing. Copy the URL instead: ' + window.location.href);
    }
}