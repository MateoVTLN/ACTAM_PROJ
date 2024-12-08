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
    "taormina": "img/taormina.jpg",
    "sydney": "img/sydney.jpg",
    "classroom": "img/classroom.jpg",
    "parma": "img/parma.jpg",
    "knightshall": "img/knightshall.jpg",
    "luzit": "img/luzit.jpg",
    "dinkelspiel": "img/dinkelspiel.jpeg",
    "londonarena": "img/londonarena.jpg",
    "wembley": "img/wembley.jpg",
    "siracusa": "img/siracusa.jpg",
    "disney" : "img/disney.jpg",
    "living" : "img/living.png",
    "kitchen" : "img/kitchen.png",
    "trinity" : "img/trinity.jpg",
    "bellemeade" : "img/bellemeade.png"
};

// IR files (impulse responses)
const roomData = {
    "Arenas": {
        "wembley": ["assets/ir_files/Wembley Arena_mcg1v2.wav", "assets/ir_files/Wembley Arena_scg1v2.wav", "assets/ir_files/Wembley Arena_xcg1v2.wav"],
        "londonarena": ["assets/ir_files/London Arena_mcg1v2.wav", "assets/ir_files/London Arena_scg1v2.wav", "assets/ir_files/London Arena_xcg1v2.wav"]
    },

    "Concert Halls": {
        "SOH": ["assets/ir_files/SOH Concert Hall_mWg2v2.wav", "assets/ir_files/SOH Concert Hall_sWg2v2.wav", "assets/ir_files/SOH Concert Hall_xWg2v2.wav"],
        "disney": ["assets/ir_files/Disney_mcg2v2.wav", "assets/ir_files/Disney_scg2v2.wav", "assets/ir_files/Disney_xcg2v2.wav"]
    },
    "Churches": {
        "trinity": ["assets/ir_files/Trinity Church_mWg1v2.wav", "assets/ir_files/Trinity Church_sWg1v2.wav", "assets/ir_files/Trinity Church_xWg1v2.wav"],
        "bellemeade": ["assets/ir_files/Belle Meade_mWg1v2.wav", "assets/ir_files/Belle Meade_sWg1v2.wav", "assets/ir_files/Belle Meade_xWg1v2.wav"]
    },
    "Auditoriums": {
        "dinkelspiel": ["assets/ir_files/Dinkelspiel Aud_mWg1v2.wav", "assets/ir_files/Dinkelspiel Aud_sWg1v2.wav", "assets/ir_files/Dinkelspiel Aud_xWg1v2.wav"],
        "parma": ["assets/ir_files/Parma Auditorium_mcd2.wav", "assets/ir_files/Parma Auditorium_scd2.wav", "assets/ir_files/Parma Auditorium_xcd2.wav"]
    },
    "Amphitheatres": {
        "taormina": ["assets/ir_files/Taormina_mcd1.wav", "assets/ir_files/Taormina_scd1.wav", "assets/ir_files/Taormina_xcd1.wav"],
        "siracusa": ["assets/ir_files/Siracusa_mcd1.wav", "assets/ir_files/Siracusa_xcd1.wav"]
    },
    "Others": {
        "knightshall": ["assets/ir_files/Knights Refectorium_mWg1v2.wav", "assets/ir_files/Knights Refectorium_sWg1v2.wav", "assets/ir_files/Knights Refectorium_xWg1v2.wav"],
        "luzit": ["assets/ir_files/Luzit Cave - Medium_mWg1v2.wav", "assets/ir_files/Luzit Cave - Medium_sWg1v2.wav", "assets/ir_files/Luzit Cave - Medium_xWg1v2.wav"],
        "classroom": ["assets/ir_files/IRclassroom_441.wav"]
    },
    "Home": {
        "living": ["assets/ir_files/Living Room_mcg1v2.wav", "assets/ir_files/Living Room_scg1v2.wav", "assets/ir_files/Living Room_xcg1v2.wav"],
        "kitchen": ["assets/ir_files/Kitchen_mcg1v2.wav", "assets/ir_files/Kitchen_xcg1v2.wav"]
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
        const backgroundUrl = roomBackgrounds[room]; // Cherche l'image de fond correspondante
        if (backgroundUrl) {
            document.body.style.backgroundImage = `url(${backgroundUrl})`;
            document.body.style.backgroundSize = "cover";
            document.body.style.backgroundPosition = "top center";
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

async function applyReverbAndPlay(audioUrl, irUrl) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    try {
        const [audioBuffer, irBuffer] = await Promise.all([
            loadAudioFile(audioUrl, audioContext),
            loadAudioFile(irUrl, audioContext)
        ]);

        const audioSource = audioContext.createBufferSource();
        const convolver = audioContext.createConvolver();

        audioSource.buffer = audioBuffer;
        convolver.buffer = irBuffer;

        audioSource.connect(convolver);
        convolver.connect(audioContext.destination);

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
    const category = roomCategorySelect.value;
    const rooms = roomData[category];

    // Affiche ou masque la section de sélection de salle
    roomSelectDiv.style.display = rooms ? "block" : "none";

    // Ajoute les options dynamiques dans le menu déroulant
    specificRoomSelect.innerHTML = rooms
        ? Object.keys(rooms)
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

window.addEventListener("DOMContentLoaded", () => {
    handleAudioSourceChange(); // Pour gérer la sélection de l'audio
    setupRoomBackgroundChange(); // Pour gérer le changement de fond d'écran
});