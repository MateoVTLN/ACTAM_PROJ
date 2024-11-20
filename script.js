// References to HTML elements
const localAudioRadio = document.getElementById("local-audio");
const siteAudioRadio = document.getElementById("site-audio");
const audioFileInput = document.getElementById("audio-file-input");
const siteAudioSelect = document.getElementById("site-audio-select");
const roomSelect = document.getElementById("room-select");
const applyReverbButton = document.getElementById("apply-reverb");

// List of audio files available on the site
const siteAudioFiles = {
    "Classical": "assets/audio_samples/onclassical_demo_demicheli_geminiani_pieces_allegro-in-f-major_small-version_32b_aio.wav",
    "Jazz": "assets/audio_samples/jazz_sample.wav",
    "Pop": "assets/audio_samples/pop_sample.wav"
};

// List of impulse responses for different rooms
const irFiles = {
    "Taormina": "assets/ir_files/Taormina_scd1_32b_aio.wav",
    "Wembley": "assets/ir_files/Wembley Arena_mcg1v2.wav",
    "Sydney": "assets/ir_files/SOH Concert Hall_SBg2v2_32b_aio.wav"
};

// Initialize elements on page load
window.addEventListener("DOMContentLoaded", () => {
    populateSiteAudioSelect();
    handleAudioSourceChange(); // Ensure correct initial state
});

// Function to populate the site audio select dropdown
function populateSiteAudioSelect() {
    for (const [name, path] of Object.entries(siteAudioFiles)) {
        const option = document.createElement("option");
        option.value = path;
        option.textContent = name;
        siteAudioSelect.appendChild(option);
    }
}

// Handle changes in audio source selection
function handleAudioSourceChange() {
    if (localAudioRadio.checked) {
        // Enable local file input and disable site audio selection
        audioFileInput.disabled = false;
        siteAudioSelect.disabled = true;
        siteAudioSelect.value = ""; // Reset site audio selection
    } else if (siteAudioRadio.checked) {
        // Enable site audio selection and disable local file input
        audioFileInput.disabled = true;
        siteAudioSelect.disabled = false;
        audioFileInput.value = ""; // Reset local file input
    }
}

// Add event listeners for radio buttons
localAudioRadio.addEventListener("change", handleAudioSourceChange);
siteAudioRadio.addEventListener("change", handleAudioSourceChange);

// Function to load an audio file and decode it into an AudioBuffer
async function loadAudioFile(audioUrl, audioContext) {
    const response = await fetch(audioUrl);
    const arrayBuffer = await response.arrayBuffer();
    return audioContext.decodeAudioData(arrayBuffer);
}

// Perform partitioned convolution using FFT
function partitionedConvolution(inputBuffer, irBuffer, fftSize) {
    const inputData = inputBuffer.getChannelData(0); // Mono input
    const irData = irBuffer.getChannelData(0);

    const irPadded = new Float32Array(fftSize);
    irPadded.set(irData);
    const irFFT = fft(irPadded);

    const output = new Float32Array(inputData.length + irData.length - 1);

    for (let start = 0; start < inputData.length; start += fftSize / 2) {
        const segment = new Float32Array(fftSize);
        segment.set(inputData.slice(start, start + fftSize));

        const segmentFFT = fft(segment);

        const convolvedFFT = segmentFFT.map((value, index) => value * irFFT[index]);

        const convolvedSegment = ifft(convolvedFFT);

        for (let i = 0; i < convolvedSegment.length; i++) {
            output[start + i] += convolvedSegment[i];
        }
    }

    return output;
}

// Create an AudioBuffer from processed data
function createAudioBufferFromData(data, sampleRate, context) {
    const buffer = context.createBuffer(1, data.length, sampleRate);
    buffer.getChannelData(0).set(data);
    return buffer;
}

// Apply reverb and play the processed audio
async function applyReverbAndPlay(audioUrl, irUrl, fftSize) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    const [audioBuffer, irBuffer] = await Promise.all([
        loadAudioFile(audioUrl, audioContext),
        loadAudioFile(irUrl, audioContext)
    ]);

    const processedData = partitionedConvolution(audioBuffer, irBuffer, fftSize);

    const resultBuffer = createAudioBufferFromData(processedData, audioContext.sampleRate, audioContext);

    // Play the result
    const source = audioContext.createBufferSource();
    source.buffer = resultBuffer;
    source.connect(audioContext.destination);
    source.start();
}

// Handle the "Apply Reverb" button click
applyReverbButton.addEventListener("click", async () => {
    let audioUrl;
    const room = roomSelect.value;

    if (!room) {
        alert("Please select a room to apply reverb.");
        return;
    }

    const irUrl = irFiles[room];

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
        await applyReverbAndPlay(audioUrl, irUrl, 2048); // Use an FFT size of 2048
    } catch (error) {
        console.error("Error applying reverb:", error);
        alert("An error occurred while applying the reverb.");
    }
});
