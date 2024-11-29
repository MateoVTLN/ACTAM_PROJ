
// References to HTML elements

module.exports = {
    fft: require('./src/fft').fft,
    ifft: require('./src/ifft').ifft,
    fftInPlace: require('./src/fft').fftInPlace,
    util: require('./src/fftutil'),
    dft: require('./src/dft'),
    idft: require('./src/idft')
};

const localAudioRadio = document.getElementById("local-audio");
const siteAudioRadio = document.getElementById("site-audio");
const audioFileInput = document.getElementById("audio-file-input");
const siteAudioSelect = document.getElementById("site-audio-select");
const roomSelect = document.getElementById("room-select");
const applyReverbButton = document.getElementById("apply-reverb");

// Room background images
const roomBackgrounds = {
    "Taormina": "/img/taormina.jpg",
    "Sydney": "/img/sydney.jpg",
    "Classroom": "/img/classroom.jpg"
};

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

function zeroPad(array, length) {
    const padded = new Float32Array(length);
    padded.set(array); //
    return padded;
}

function fftConvolution(inputBuffer, irBuffer) {
    const inputData = inputBuffer.getChannelData(0);
    const irData = irBuffer.getChannelData(0);

    // Alignement des longueurs par zero-padding
    const maxLength = Math.max(inputData.length, irData.length);
    const paddedInput = zeroPad(inputData, maxLength);
    const paddedIR = zeroPad(irData, maxLength);

    // Creation of FFT & IFFT objects
    const fft = new FFT(maxLength);
    const ifft = new IFFT(maxLength);

    // FFT of x(n) and y(n)
    const inputSpectrum = fft.forward(paddedInput);
    const irSpectrum = fft.forward(paddedIR);

    // Multiplication in Fourrier domain
    const outputSpectrum = new Float32Array(inputSpectrum.length);
    for (let i = 0; i < inputSpectrum.length; i += 2) {
        const real = inputSpectrum[i] * irSpectrum[i] - inputSpectrum[i + 1] * irSpectrum[i + 1];
        const imag = inputSpectrum[i] * irSpectrum[i + 1] + inputSpectrum[i + 1] * irSpectrum[i];
        outputSpectrum[i] = real;
        outputSpectrum[i + 1] = imag;
    }

    // IFFT
    const outputTimeDomain = ifft.inverse(outputSpectrum);

    // Normalisation
    const maxAmplitude = Math.max(...outputTimeDomain.map(Math.abs));
    if (maxAmplitude > 1) {
        for (let i = 0; i < outputTimeDomain.length; i++) {
            outputTimeDomain[i] /= maxAmplitude;
        }
    }

    return outputTimeDomain;
}


function createAudioBufferFromData(data, sampleRate, context) {
    const buffer = context.createBuffer(1, data.length, sampleRate);
    buffer.getChannelData(0).set(data); // Fill the Mono channel
    return buffer;
}


// Apply reverb and play the audio
async function applyReverbAndPlay(audioUrl, irUrl) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    try {
        // Loading of audio and IR files
        const [audioBuffer, irBuffer] = await Promise.all([
            loadAudioFile(audioUrl, audioContext),
            loadAudioFile(irUrl, audioContext)
        ]);

        // Convolution by FFT
        const processedData = fftConvolution(audioBuffer, irBuffer);

        // Création of AudioBuffer for the treated signal
        const resultBuffer = createAudioBufferFromData(processedData, audioContext.sampleRate, audioContext);

        // Read AudioBuffer
        const source = audioContext.createBufferSource();
        source.buffer = resultBuffer;
        source.connect(audioContext.destination);
        source.start();
    } catch (error) {
        console.error("Error applying reverb:", error);
        alert("An error occurred while applying the reverb.");
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
        await applyReverbAndPlay(audioUrl, irUrl, 2048); // FFT size set to 2048
    } catch (error) {
        console.error("Error applying reverb:", error);
        alert("An error occurred while applying the reverb.");
    }
});

// Function to chnage the bckground of the page according to the room
function setupRoomBackgroundChange() {
    roomSelect.addEventListener("change", function() {
        const room = roomSelect.value;
        const backgroundUrl = roomBackgrounds[room];

        // If bckground already present change it 
        if (backgroundUrl) {
            document.body.style.backgroundImage = `url(${backgroundUrl})`;
            document.body.style.backgroundSize = "cover"; // to stretch the image on the whole screen
            document.body.style.backgroundPosition = "center"; // center the bckground
        }
    });
