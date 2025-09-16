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
        notFollowingYou: "Not Following You",
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

// Listener para idioma
function cambiarIdioma(idioma) {
    idiomaActual = idioma;
    const t = textos[idioma];

    document.querySelector('.hero h1').textContent = t.titulo;
    document.querySelector('.hero p').textContent = t.descripcion;
    document.querySelector('.hero a').textContent = t.btnEmpezar;

    document.querySelector('label[for="zipFile"]').textContent = idioma === 'es' ? 'Sube un archivo ZIP con followers.json y following_1.json:' : 'Upload ZIP file with followers.json and following.json:';

    document.getElementById('btnCheck').textContent = t.check;
    document.getElementById('btnReset').textContent = t.reset;

    document.getElementById('tituloResultados').textContent = t.results;
    document.getElementById('aclaracion').textContent = t.aclaracion;
    document.getElementById('tituloNoSiguen').textContent = t.notFollowing;
    document.getElementById('tituloNoLosSigues').textContent = t.notFollowingYou;

    const selectOrden = document.getElementById("ordenResultados");
    selectOrden.options[0].text = t.ordenPorDefecto;
    selectOrden.options[1].text = t.ordenAlfabetico;

    document.getElementById("btnTutorial").textContent = t.tutorialBtn;
    document.getElementById("btnSobreMi").textContent = t.sobreMiBtn;
    document.getElementById("btnCompartir").textContent = t.compartirBtn;

    document.getElementById("tutorialLabel").textContent = t.tutorialLabel;
    document.getElementById("sobreMiLabel").textContent = t.sobreMiLabel;
    document.getElementById("sobreMiTexto").textContent = t.sobreMiTexto;
}

// Función para extraer usernames de followers o following
function extraerUsernames(jsonData, tipo) {
    if (!jsonData) return [];
    let arr;

    if (tipo === "followers") {
        // followers es un array
        arr = Array.isArray(jsonData) ? jsonData : [];
    } else if (tipo === "following") {
        // following está dentro de relationships_following
        arr = jsonData.relationships_following || [];
    } else {
        arr = [];
    }

    // Extraemos los usernames de string_list_data
    return arr.flatMap(obj => obj.string_list_data?.map(u => u.value) || []);
}

// Listener del botón Check para ZIP
document.getElementById("btnCheck").addEventListener("click", async () => {
    const fileInput = document.getElementById("zipFile");
    if (!fileInput.files.length) return alert("Select a ZIP file");

    try {
        const file = fileInput.files[0];
        const zip = await JSZip.loadAsync(file);

        async function leerJSON(nombreArchivo) {
            const file = Object.values(zip.files).find(f => f.name.endsWith(nombreArchivo));
            if (!file) throw new Error(`Archivo ${nombreArchivo} no encontrado en ZIP`);
            const text = await file.async("string");
            return JSON.parse(text);
        }

        const followersData = await leerJSON("followers_1.json");
        const followingData = await leerJSON("following.json");

        // Extraer usernames
        const listaAoriginal = extraerUsernames(followersData, "followers");
        const listaBoriginal = extraerUsernames(followingData, "following");

        // Normalizar para comparar
        const listaANormal = listaAoriginal.map(u => u.trim().toLowerCase());
        const listaBNormal = listaBoriginal.map(u => u.trim().toLowerCase());

        // Comparación correcta
        resultadosA = listaAoriginal.filter(u => !listaBNormal.includes(u.toLowerCase()));
        resultadosB = listaBoriginal.filter(u => !listaANormal.includes(u.toLowerCase()));

        // Mostrar resultados
        document.getElementById("bloqueResultados").style.display = "block";
        mostrarResultados(resultadosA, resultadosB);

    } catch (err) {
        alert("Error reading ZIP or JSON: " + err.message);
        console.error(err);
    }
});


function mostrarResultados(resA, resB) {
    const formatear = (nombre) => `<strong>${nombre}</strong>`;

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
