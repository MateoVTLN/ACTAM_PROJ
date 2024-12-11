//////////////////////////////////////////////////////////////////////////
// ########################## HTML ELEMENTS #############################
//////////////////////////////////////////////////////////////////////////

const localAudioRadio = document.getElementById("local-audio");
const siteAudioRadio = document.getElementById("site-audio");
const audioFileInput = document.getElementById("audio-file-input");
const siteAudioSelect = document.getElementById("site-audio-select");
const applyReverbButton = document.getElementById("apply-reverb");
const stopReverbButton = document.getElementById("stop-reverb");
const roomCategorySelect = document.getElementById("room-category-select");
const roomSelectDiv = document.getElementById("room-selection");
const specificRoomSelect = document.getElementById("specific-room-select");
const irSelectDiv = document.getElementById("ir-selection");
const irSelect = document.getElementById("ir-select");
const downloadButton = document.getElementById("download-audio");
const volumeControl = document.getElementById("volume-control");

//////////////////////////////////////////////////////////////////////////
// ############################# PATHS TO ASSETS #########################
//////////////////////////////////////////////////////////////////////////

// Room background images
const roomBackgrounds = {
    "Taormina Amphitheatre (Italy)": "assets/img/taormina.jpg",
    "Sydney Opera House Concert Hall (Australia)": "assets/img/sydney.jpg",
    "Classroom (Italy)": "assets/img/classroom.jpg",
    "Parma Auditorium (Italy)": "assets/img/parma.jpg",
    "Knights Refectorium (Israel)": "assets/img/knightshall.jpg",
    "Luzit Caves (Israel)": "assets/img/luzit.jpg",
    "Dinkelspiel Auditorium (Ca. USA)": "assets/img/dinkelspiel.jpeg",
    "London Arena (UK)": "assets/img/londonarena.jpg",
    "Wembley Arena (UK)": "assets/img/wembley.jpg",
    "Siracusa Amphitheatre(Italy)": "assets/img/siracusa.jpg",
    "Disney Concert Hall (Ca. USA)" : "assets/img/disney.jpg",
    "Living Room (Italy)" : "assets/img/living.png",
    "Kitchen (Italy)" : "assets/img/kitchen.png",
    "Trinity Church (NY USA)" : "assets/img/trinity.jpg",
    "Belle Meade Church (USA)" : "assets/img/bellemeade.png"
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
        "Classroom (Italy)": ["assets/ir_files/classroom_30x25y.wav"]
    },
    "Home": {
        "Living Room (Italy)": ["assets/ir_files/Living Room_mcg1v2.wav", "assets/ir_files/Living Room_scg1v2.wav", "assets/ir_files/Living Room_xcg1v2.wav"],
        "Kitchen (Italy)": ["assets/ir_files/Kitchen_mcg1v2.wav", "assets/ir_files/Kitchen_xcg1v2.wav"]
    }
};
//////////////////////////////////////////////////////////////////////////
// ############################# FUNCTIONS ###############################
//////////////////////////////////////////////////////////////////////////

let audioContext = null;
let currentSourceNode = null;
let gainNode = null;
let mediaRecorder = null;
const recordedChunks = [];

// Initialize a single AudioContext
function initializeAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
}

function handleAudioSourceChange() {
    audioFileInput.disabled = !localAudioRadio.checked;
    siteAudioSelect.disabled = !siteAudioRadio.checked;

    if (localAudioRadio.checked) siteAudioSelect.value = "";
    if (siteAudioRadio.checked) audioFileInput.value = "";
}

function setupRoomBackgroundChange() {
    // Initialiser avec un fond d'écran par défaut
    document.body.style.backgroundImage = "url('assets/img/stage.png')";
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center center";
    document.body.style.backgroundAttachment = "fixed";

    specificRoomSelect.addEventListener("change", () => {
        const room = specificRoomSelect.value;
        const backgroundUrl = roomBackgrounds[room];
        if (backgroundUrl) {
            document.body.style.backgroundImage = `url(${backgroundUrl})`;
        } else {
            document.body.style.backgroundImage = "url('assets/img/default.jpg')";
        }
        document.body.style.backgroundSize = "cover";
        document.body.style.backgroundPosition = "bottom center";
        document.body.style.backgroundAttachment = "fixed";
    });
}


async function loadAudioFile(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch: ${url}`);
        const arrayBuffer = await response.arrayBuffer();
        return await audioContext.decodeAudioData(arrayBuffer);
    } catch (error) {
        console.error("Error loading audio file:", error);
        throw error;
    }
}


function reduceImpulseResponseAmplitude(buffer, reductionFactor) {
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < channelData.length; i++) {
            channelData[i] *= reductionFactor;
        }
    }
    return buffer;
}

function normalizeBuffer(buffer) {
    const maxAmplitude = Math.max(...buffer.map(Math.abs));
    return maxAmplitude === 0 ? buffer : buffer.map(sample => sample / maxAmplitude);
}

async function applyReverbAndPlay(audioUrl, irUrl) {
    const context = initializeAudioContext();
    try {
        const [audioBuffer, irBuffer] = await Promise.all([
            loadAudioFile(audioUrl),
            loadAudioFile(irUrl)
        ]);

        const audioSource = context.createBufferSource();
        const convolver = context.createConvolver();
        irGainNode = context.createGain(); // IR Gain Node
        gainNode = context.createGain(); // Audio GainNode

        // Load IR and Audio
        audioSource.buffer = audioBuffer;
        convolver.buffer = irBuffer;

        // Reduce IR amp with cursor
        const initialIrGain = parseFloat(irAmplitudeSlider.value);
        irGainNode.gain.value = initialIrGain; // Initialiser avec la valeur du curseur

        // Connect the nodes
        audioSource.connect(convolver);
        convolver.connect(irGainNode); // Connect IR to IR Node
        irGainNode.connect(gainNode); // Connect IR Gain Node to Global Gain Node
        gainNode.connect(context.destination); // Connect to audio output

        // Connexion of audio source to global gain node
        audioSource.connect(gainNode);

        gainNode.gain.value = 0.5; // default setting

        currentSourceNode = audioSource;
        audioSource.start();
        audioSource.onended = () => (currentSourceNode = null);
    } catch (error) {
        console.error("Error applying reverb:", error);
    }
}


function startRecording() {
    const context = initializeAudioContext();
    const destination = context.createMediaStreamDestination();
    gainNode.connect(destination);

    mediaRecorder = new MediaRecorder(destination.stream);
    recordedChunks.length = 0;

    mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) recordedChunks.push(event.data);
    };

    mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: "audio/wav" });
        const url = URL.createObjectURL(blob);
        downloadButton.href = url;
        downloadButton.download = "processed_audio.wav";
        downloadButton.style.display = "block";
    };

    mediaRecorder.start();
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
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
    roomSelectDiv.style.display = rooms ? "block" : "none";
    specificRoomSelect.innerHTML = rooms
        ? `<option value="">--Choose a Room--</option>` + Object.keys(rooms)
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
    startRecording();
});

stopReverbButton.addEventListener("click", () => {
    stopAudio();
    stopRecording();
});

volumeControl.addEventListener("input", () => {
    if (gainNode) {
        const linearValue = parseFloat(volumeControl.value);
        const logarithmicValue = Math.pow(10, (linearValue - 1) * 2);
        gainNode.gain.value = logarithmicValue;
    }
});

const irAmplitudeSlider = document.getElementById("ir-amplitude");
const irAmplitudeValue = document.getElementById("ir-amplitude-value");


irAmplitudeSlider.addEventListener("input", () => {
    const irAmplitude = parseFloat(irAmplitudeSlider.value); // Get cursor value
    irAmplitudeValue.textContent = irAmplitude.toFixed(2); // Update display of cursor value
    
    if (irGainNode) {
        irGainNode.gain.value = irAmplitude; // Update IR Gain values
    }
});

// TUTORIAL Page //

document.getElementById("tutorial-button").addEventListener("click", () => {
    window.location.href = "tutorial.html";
});


// AnalyserNode y Canvas para la visualización
let analyser, bufferLength, dataArray, canvas, canvasCtx;

async function applyReverbAndPlay(audioUrl, irUrl) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    try {
        const [audioBuffer, irBuffer] = await Promise.all([
            loadAudioFile(audioUrl, audioContext),
            loadAudioFile(irUrl, audioContext)
        ]);

        const audioSource = audioContext.createBufferSource();
        const convolver = audioContext.createConvolver();
        gainNode = audioContext.createGain();

        audioSource.buffer = audioBuffer;
        convolver.buffer = irBuffer;

        // Configuración del analyser para la visualización
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048; // Resolución de la FFT
        bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);

        // Conectar los nodos
        audioSource.connect(convolver);
        convolver.connect(gainNode);
        gainNode.connect(analyser); // Conectar el analyser
        analyser.connect(audioContext.destination);

        // Configurar el canvas
        canvas = document.getElementById("audio-visualizer");
        canvasCtx = canvas.getContext("2d");

        // Dibujar la visualización
        drawSpectrum();

        // Iniciar el audio
        currentSourceNode = audioSource;
        audioSource.start();
        audioSource.onended = () => (currentSourceNode = null);
    } catch (error) {
        console.error("Error applying reverb:", error);
    }
}

// Función para dibujar el espectro
function drawSpectrum() {
    requestAnimationFrame(drawSpectrum);

    // Limpiar el canvas
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

    // Obtener los datos de frecuencia
    analyser.getByteFrequencyData(dataArray);

    // Dibujar las barras
    const barWidth = (canvas.width / bufferLength) * 2.5;
    let barHeight;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i];

        // Configurar el color dinámico
        canvasCtx.fillStyle = `rgb(${barHeight + 100}, 50, 50)`;
        canvasCtx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);

        x += barWidth + 1;
    }
}

// Coordenadas geográficas para cada sala
const roomCoordinates = {
    "Sydney Opera House Concert Hall (Australia)": [-33.8568, 151.2153],
    "Taormina Amphitheatre (Italy)": [37.8522, 15.2877],
    "Knights Refectorium (Israel)": [32.7940, 34.9896],
    "London Arena (UK)": [51.5072, -0.1276],
    "Wembley Arena (UK)": [51.5560, -0.2796],
    "Disney Concert Hall (Ca. USA)": [34.0554, -118.2498],
    "Trinity Church (NY USA)": [40.7056, -74.0139],
    "Luzit Caves (Israel)": [31.6391, 34.8352]
};

// Inicializar el mapa
const map = L.map("minimap").setView([0, 0], 2); // Vista inicial del mapa

// Añadir el mapa base
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

let marker; // Variable para el marcador

// Actualizar la ubicación en el mapa
specificRoomSelect.addEventListener("change", () => {
    const room = specificRoomSelect.value;
    const coordinates = roomCoordinates[room];

    if (coordinates) {
        if (marker) map.removeLayer(marker); // Remover marcador previo
        marker = L.marker(coordinates).addTo(map); // Añadir marcador
        map.setView(coordinates, 10); // Centrar el mapa en las coordenadas
    }
});
