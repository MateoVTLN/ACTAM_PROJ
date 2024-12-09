//////////////////////////////////////////////////////////////////////////
// ########################## HTML ELEMENTS #############################
//////////////////////////////////////////////////////////////////////////

const localAudioRadio = document.getElementById("local-audio");
const siteAudioRadio = document.getElementById("site-audio");
const audioFileInput = document.getElementById("audio-file-input");
const siteAudioSelect = document.getElementById("site-audio-select");
const roomSelect = document.getElementById("room-select");
const applyReverbButton = document.getElementById("apply-reverb");
const stopReverbButton = document.getElementById("stop-reverb");
const roomCategorySelect = document.getElementById("room-category-select");
const roomSelectDiv = document.getElementById("room-selection");
const specificRoomSelect = document.getElementById("specific-room-select");
const irSelectDiv = document.getElementById("ir-selection");
const irSelect = document.getElementById("ir-select");

//////////////////////////////////////////////////////////////////////////
// ############################# PATHS TO ASSETS #########################
//////////////////////////////////////////////////////////////////////////

// Room background images
const roomBackgrounds = {
    "Taormina Amphitheatre (Italy)": "img/taormina.jpg",
    "Sydney Opera House Concert Hall (Australia)": "img/sydney.jpg",
    "Classroom (Italy)": "img/classroom.jpg",
    "Parma Auditorium (Italy)": "img/parma.jpg",
    "Knights Refectorium (Israel)": "img/knightshall.jpg",
    "Luzit Caves (Israel)": "img/luzit.jpg",
    "Dinkelspiel Auditorium (Ca. USA)": "img/dinkelspiel.jpeg",
    "London Arena (UK)": "img/londonarena.jpg",
    "Wembley Arena (UK)": "img/wembley.jpg",
    "Siracusa Amphitheatre(Italy)": "img/siracusa.jpg",
    "Disney Concert Hall (Ca. USA)" : "img/disney.jpg",
    "Living Room (Italy)" : "img/living.png",
    "Kitchen (Italy)" : "img/kitchen.png",
    "Trinity Church (NY USA)" : "img/trinity.jpg",
    "Belle Meade Church (USA)" : "img/bellemeade.png"
};

// IR files (impulse responses)
const roomData = {
    "Arenas": {
        "Wembley Arena (UK)": ["assets/ir_files/Wembley Arena_mcg1v2.wav", "assets/ir_files/Wembley Arena_scg1v2.wav", "assets/ir_files/Wembley Arena_xcg1v2.wav"],
        "London Arena (UK)": ["assets/ir_files/London Arena_mcg1v2.wav", "assets/ir_files/London Arena_scg1v2.wav", "assets/ir_files/London Arena_xcg1v2.wav"]
    },
    "Concert Halls": {
        "Sydney Opera House Concert Hall (Australia)": ["assets/ir_files/SOH Concert Hall_mWg2v2.wav", "assets/ir_files/SOH Concert Hall_sWg2v2.wav", "assets/ir_files/SOH Concert Hall_xWg2v2.wav"],
        "Disney Concert Hall (Ca. USA)": ["assets/ir_files/Disney_mcg2v2.wav", "assets/ir_files/Disney_scg2v2.wav", "assets/ir_files/Disney_xcg2v2.wav"]
    },
    "Churches": {
        "Trinity Church (NY USA)": ["assets/ir_files/Trinity Church_mWg1v2.wav", "assets/ir_files/Trinity Church_sWg1v2.wav", "assets/ir_files/Trinity Church_xWg1v2.wav"],
        "Belle Meade Church (USA)": ["assets/ir_files/Belle Meade_mWg1v2.wav", "assets/ir_files/Belle Meade_sWg1v2.wav", "assets/ir_files/Belle Meade_xWg1v2.wav"]
    },
    "Auditoriums": {
        "Dinkelspiel Auditorium (Ca. USA)": ["assets/ir_files/Dinkelspiel Aud_mWg1v2.wav", "assets/ir_files/Dinkelspiel Aud_sWg1v2.wav", "assets/ir_files/Dinkelspiel Aud_xWg1v2.wav"],
        "Parma Auditorium (Italy)": ["assets/ir_files/Parma Auditorium_mcd2.wav", "assets/ir_files/Parma Auditorium_scd2.wav", "assets/ir_files/Parma Auditorium_xcd2.wav"]
    },
    "Amphitheatres": {
        "Taormina Amphitheatre (Italy)": ["assets/ir_files/Taormina_mcd1.wav", "assets/ir_files/Taormina_scd1.wav", "assets/ir_files/Taormina_xcd1.wav"],
        "Siracusa Amphitheatre(Italy)": ["assets/ir_files/Siracusa_mcd1.wav", "assets/ir_files/Siracusa_xcd1.wav"]
    },
    "Others": {
        "Knights Refectorium (Israel)": ["assets/ir_files/Knights Refectorium_mWg1v2.wav", "assets/ir_files/Knights Refectorium_sWg1v2.wav", "assets/ir_files/Knights Refectorium_xWg1v2.wav"],
        "Luzit Caves (Israel)": ["assets/ir_files/Luzit Cave - Medium_mWg1v2.wav", "assets/ir_files/Luzit Cave - Medium_sWg1v2.wav", "assets/ir_files/Luzit Cave - Medium_xWg1v2.wav"],
        "Classroom (Italy)": ["assets/ir_files/IRclassroom_441.wav"]
    },
    "Home": {
        "Living Room (Italy)": ["assets/ir_files/Living Room_mcg1v2.wav", "assets/ir_files/Living Room_scg1v2.wav", "assets/ir_files/Living Room_xcg1v2.wav"],
        "Kitchen (Italy)": ["assets/ir_files/Kitchen_mcg1v2.wav", "assets/ir_files/Kitchen_xcg1v2.wav"]
    }
};

//////////////////////////////////////////////////////////////////////////
// ############################# FUNCTIONS ###############################
//////////////////////////////////////////////////////////////////////////

function handleAudioSourceChange() {
    audioFileInput.disabled = !localAudioRadio.checked;
    siteAudioSelect.disabled = !siteAudioRadio.checked;

    if (localAudioRadio.checked) siteAudioSelect.value = "";
    if (siteAudioRadio.checked) audioFileInput.value = "";
}

function setupRoomBackgroundChange() {
    const specificRoomSelect = document.getElementById("specific-room-select");

    // Vérifie que l'élément existe dans le DOM
    if (!specificRoomSelect) {
        console.error("specificRoomSelect is null. Please check the element ID in your HTML.");
        return;
    }

    // Écoute les changements sur la sélection de salle spécifique
    specificRoomSelect.addEventListener("change", () => {
        const room = specificRoomSelect.value; // Récupère la valeur de la salle sélectionnée
        if (!room) {
            // Si aucune salle n'est sélectionnée (valeur vide), n'applique pas de fond d'écran
            document.body.style.backgroundImage = "";
            return;
        }

        const backgroundUrl = roomBackgrounds[room]; // Cherche l'image de fond correspondante
        if (backgroundUrl) {
            document.body.style.backgroundImage = `url(${backgroundUrl})`;
            document.body.style.backgroundSize = "cover";
            document.body.style.backgroundPosition = "bottom center";
            document.body.style.backgroundAttachment = "fixed";
        } else {
            console.warn(`No background defined for room: ${room}`);
        }
    });
}

// #####################################


async function loadAudioFile(url, audioContext) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch: ${url}');
        const arrayBuffer = await response.arrayBuffer();
        return await audioContext.decodeAudioData(arrayBuffer);
    } catch (error) {
        console.error("Error loading audio file:", error);
        throw error;
    }
}

function normalizeBuffer(buffer) {
    const maxAmplitude = Math.max(...buffer.map(Math.abs));
    if (maxAmplitude === 0) return buffer;
    return buffer.map(sample => sample / maxAmplitude);
}

let currentSourceNode = null;
let gainNode = null; 

async function applyReverbAndPlay(audioUrl, irUrl) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    try {
        const [audioBuffer, irBuffer] = await Promise.all([
            loadAudioFile(audioUrl, audioContext),
            loadAudioFile(irUrl, audioContext)
        ]);

        const audioSource = audioContext.createBufferSource();
        const convolver = audioContext.createConvolver();
        gainNode = audioContext.createGain(); // Initialise le gainNode global

        audioSource.buffer = audioBuffer;
        convolver.buffer = irBuffer;

        // Connecter les nœuds
        audioSource.connect(convolver);
        convolver.connect(gainNode); // Convolution passe par le gain
        gainNode.connect(audioContext.destination);

        gainNode.gain.value = 0.5; // Volume par défaut à 50%

        currentSourceNode = audioSource;
        audioSource.start();
        audioSource.onended = () => (currentSourceNode = null);
    } catch (error) {
        console.error("Error applying reverb:", error);
    }
}



function stopAudio() {
    if (currentSourceNode) {
        currentSourceNode.stop();
        currentSourceNode = null;
    }
}

//////////////////////////////////////////////////////////////////////////
// ###################### EVENTS LISTENERS ###############################
//////////////////////////////////////////////////////////////////////////

window.addEventListener("DOMContentLoaded", () => {
    handleAudioSourceChange();
    setupRoomBackgroundChange();
});

localAudioRadio.addEventListener("change", handleAudioSourceChange);
siteAudioRadio.addEventListener("change", handleAudioSourceChange);

roomCategorySelect.addEventListener("change", () => {
    const category = roomCategorySelect.value; // Récupère la catégorie sélectionnée
    const rooms = roomData[category]; // Trouve les salles associées à cette catégorie

    // Affiche ou masque la section de sélection de salle
    roomSelectDiv.style.display = rooms ? "block" : "none";

    // Génère les options pour le menu déroulant des salles
    specificRoomSelect.innerHTML = rooms
        ? `<option value="">--Choose a Room--</option>` + // Ajoute l'option par défaut
          Object.keys(rooms)
              .map(room => `<option value="${room}">${room}</option>`)
              .join("")
        : "";
});



specificRoomSelect.addEventListener("change", () => {
    const category = roomCategorySelect.value;
    const room = specificRoomSelect.value;
    const irFiles = roomData[category]?.[room];
    irSelectDiv.style.display = irFiles ? "block" : "none";
    irSelect.innerHTML = irFiles
        ? irFiles.map((ir, i) => `<option value="${ir}">IR ${i + 1}</option>`).join("")
        : "";
});

applyReverbButton.addEventListener("click", async () => {
    const audioUrl = localAudioRadio.checked && audioFileInput.files.length
        ? URL.createObjectURL(audioFileInput.files[0])
        : siteAudioSelect.value;
    const irUrl = irSelect.value;

    if (!audioUrl || !irUrl) {
        alert("Please select audio source and impulse response.");
        return;
    }
    await applyReverbAndPlay(audioUrl, irUrl);
});

stopReverbButton.addEventListener("click", stopAudio);

const volumeControl = document.getElementById("volume-control");

volumeControl.addEventListener("input", () => {
    if (gainNode) {
        gainNode.gain.value = parseFloat(volumeControl.value);
    }
});


window.addEventListener("DOMContentLoaded", () => {
    handleAudioSourceChange(); // Pour gérer la sélection de l'audio
    setupRoomBackgroundChange(); // Pour gérer le changement de fond d'écran
});