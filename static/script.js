let resultadosA = [];
let resultadosB = [];


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
    const formatear = (nombre) => `<hr><div><strong>${nombre}</strong></div>`;
    document.getElementById("resultadoA").innerHTML = resA.map(formatear).join("") + "<hr>";
    document.getElementById("resultadoB").innerHTML = resB.map(formatear).join("") + "<hr>";
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
let lastScrollTop = 0;
const nav = document.getElementById('mainNav');

window.addEventListener('scroll', () => {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > lastScrollTop) {
        // Scroll hacia abajo → esconder nav
        nav.style.transform = 'translateY(-100%)';
    } else {
        // Scroll hacia arriba → mostrar nav
        nav.style.transform = 'translateY(0)';
    }

    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // Para evitar valores negativos
});
