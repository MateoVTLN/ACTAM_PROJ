const localAudioRadio = document.getElementById("local-audio");
const siteAudioRadio = document.getElementById("site-audio");
const audioFileInput = document.getElementById("audio-file-input");
const siteAudioSelect = document.getElementById("site-audio-select");
const roomSelect = document.getElementById("room-select");
const applyReverbButton = document.getElementById("apply-reverb");
const stopReverbButton = document.getElementById("stop-reverb");  // Bouton stop

// Room background images
const roomBackgrounds = {
    "Taormina": "img/taormina.jpg",
    "Sydney": "img/sydney.jpg",
    "Classroom": "img/classroom.jpg",
    "parma" : "img/parma.png",
    "knights" : "img/knights.png"
};

// Function to change the background of the page according to the room
function setupRoomBackgroundChange() {
    roomSelect.addEventListener("change", function() {
        const room = roomSelect.value;
        const backgroundUrl = roomBackgrounds[room];

        // If background already present change it 
        if (backgroundUrl) {
            document.body.style.backgroundImage = `url(${backgroundUrl})`;
            document.body.style.backgroundSize = "cover";  // Ensure the image covers the entire page
            document.body.style.backgroundPosition = "top center";  // Align the top of the image to the top of the page
            document.body.style.backgroundAttachment = "fixed";  // Optional: To create a parallax effect
        }
    });
}

// Audio files and IR files (impulse responses)
const irFiles = {
    "Taormina": "assets/ir_files/Taormina_441.wav",
    "Sydney": "assets/ir_files/SOH_441.wav",
    "Classroom": "assets/ir_files/IRclassroom_441.wav",
    "parma": "assets/ir_files/parma.wav",
    "knights": "assets/ir_files/knights.wav"

};

const audioFiles = {
    "Classical": "assets/audio_samples/onclassical_demo_demicheli_geminiani_pieces_allegro-in-f-major_small-version_32b_aio.wav",
    "Fleetwood Mac": "assets/audio_samples/chain_solo_32.wav"
};

// Initialize UI elements
window.addEventListener("DOMContentLoaded", () => {
    handleAudioSourceChange();
    setupRoomBackgroundChange();
});

// Function to handle audio source selection
function handleAudioSourceChange() {
    if (localAudioRadio.checked) {
        // Enable the file input and disable the site audio select
        audioFileInput.disabled = false;
        siteAudioSelect.disabled = true;
        siteAudioSelect.value = ""; // Reset the selection
    } else if (siteAudioRadio.checked) {
        // Enable the site audio select and disable the file input
        audioFileInput.disabled = true;
        siteAudioSelect.disabled = false;
        audioFileInput.value = ""; // Reset the file input
    }
}

// Event listeners for the buttons
localAudioRadio.addEventListener("change", handleAudioSourceChange);
siteAudioRadio.addEventListener("change", handleAudioSourceChange);

// Function to load an audio file into an AudioBuffer
async function loadAudioFile(audioUrl, audioContext) {
    try {
        const response = await fetch(audioUrl);
        if (!response.ok) {
            throw new Error("Failed to fetch audio file: " + audioUrl);
        }
        const arrayBuffer = await response.arrayBuffer();
        return audioContext.decodeAudioData(arrayBuffer);
    } catch (error) {
        console.error("Error loading audio file:", error);
        throw error;
    }
}

function normalizeBuffer(buffer) {
    let maxAmplitude = 0;

    // Trouver la valeur absolue maximale en parcourant le tableau
    for (let i = 0; i < buffer.length; i++) {
        const absValue = Math.abs(buffer[i]);
        if (absValue > maxAmplitude) {
            maxAmplitude = absValue;
        }
    }

    // Normaliser le buffer si une amplitude maximale est trouvée
    if (maxAmplitude > 0) {
        const normalizedBuffer = new Float32Array(buffer.length);
        for (let i = 0; i < buffer.length; i++) {
            normalizedBuffer[i] = buffer[i] / maxAmplitude;
        }
        return normalizedBuffer;
    }

    return buffer; // Renvoyer tel quel si aucune normalisation n'est nécessaire
}

// Apply reverb and play the audio using ConvolverNode
let currentSourceNode = null;  // Reference to the current audio source being played

async function applyReverbAndPlay(audioUrl, irUrl) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    try {
        // Chargement des fichiers audio et IR
        const [audioBuffer, irBuffer] = await Promise.all([
            loadAudioFile(audioUrl, audioContext),
            loadAudioFile(irUrl, audioContext)
        ]);

        // Normalisation des buffers
        const normalizedAudioBuffer = normalizeBuffer(audioBuffer.getChannelData(0)); // Normaliser le premier canal
        const normalizedIRBuffer = normalizeBuffer(irBuffer.getChannelData(0)); // Normaliser le premier canal

        // Créer un ConvolverNode
        const convolver = audioContext.createConvolver();

        // Remplir la réponse impulsionnelle normalisée dans le buffer IR
        const irNormalizedBuffer = audioContext.createBuffer(
            1,
            normalizedIRBuffer.length,
            audioContext.sampleRate
        );
        irNormalizedBuffer.copyToChannel(normalizedIRBuffer, 0);
        convolver.buffer = irNormalizedBuffer;

        // Créer une source audio avec l'audio normalisé
        const source = audioContext.createBufferSource();
        const audioNormalizedBuffer = audioContext.createBuffer(
            1,
            normalizedAudioBuffer.length,
            audioContext.sampleRate
        );
        audioNormalizedBuffer.copyToChannel(normalizedAudioBuffer, 0);
        source.buffer = audioNormalizedBuffer;

        // Connecter les nodes au graphe audio
        source.connect(convolver);
        convolver.connect(audioContext.destination);

        // Sauvegarder la référence à la source actuelle
        currentSourceNode = source;

        // Démarrer la lecture
        source.start();
    } catch (error) {
        console.error("Error applying reverb:", error);
        alert("An error occurred while applying the reverb.");
    }
}


// Stop the audio playback
function stopAudio() {
    if (currentSourceNode) {
        currentSourceNode.stop();
        currentSourceNode = null;  // Reset the source node reference
        console.log("Audio stopped");
    }
}

// Event listener for applying reverb
applyReverbButton.addEventListener("click", async () => {
    let audioUrl;
    const room = roomSelect.value;

    const irUrl = irFiles[room];
    if (!room) {
        alert("Please select a room to apply the reverb.");
        return;
    }

    // Determine which audio file to use
    if (localAudioRadio.checked && audioFileInput.files.length > 0) {
        const file = audioFileInput.files[0];
        audioUrl = URL.createObjectURL(file);
    } else if (siteAudioRadio.checked && siteAudioSelect.value) {
        audioUrl = siteAudioSelect.value;
    } else {
        alert("Please select an audio source before applying reverb.");
        return;
    }

    try {
        await applyReverbAndPlay(audioUrl, irUrl); // Directly apply the reverb using ConvolverNode
    } catch (error) {
        console.error("Error applying reverb:", error);
        alert("An error occurred while applying the reverb.");
    }
});

// Event listener for stopping the audio playback
stopReverbButton.addEventListener("click", () => {
    stopAudio();
});
