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
    "Classroom": "img/classroom.jpg"
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
    "Classroom": "assets/ir_files/IRclassroom_441.wav" // Remove the extra space
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

// Apply reverb and play the audio using ConvolverNode
let currentSourceNode = null;  // Reference to the current audio source being played

async function applyReverbAndPlay(audioUrl, irUrl) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    try {
        // Loading of audio and IR files
        const [audioBuffer, irBuffer] = await Promise.all([
            loadAudioFile(audioUrl, audioContext),
            loadAudioFile(irUrl, audioContext)
        ]);

        // Create a ConvolverNode
        const convolver = audioContext.createConvolver();

        // Set the IR buffer as the convolution response
        convolver.buffer = irBuffer;

        // Create the audio source from the loaded audio file
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;

        // Connect the source to the convolver and then to the audio context's destination (speakers)
        source.connect(convolver);
        convolver.connect(audioContext.destination);

        // Save reference to the current source
        currentSourceNode = source;

        // Start playing the audio
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

