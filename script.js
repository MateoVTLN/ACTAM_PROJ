// References to HTML elements
const localAudioRadio = document.getElementById("local-audio");
const siteAudioRadio = document.getElementById("site-audio");
const audioFileInput = document.getElementById("audio-file-input");
const siteAudioSelect = document.getElementById("site-audio-select");
const roomSelect = document.getElementById("room-select");
const applyReverbButton = document.getElementById("apply-reverb");

// Audio files and IR files (impulse responses)
const irFiles = {
    "Taormina": "assets/ir_files/Taormina_scd1_32b_aio.wav",
    "Wembley": "assets/ir_files/Wembley Arena_mcg1v2.wav",
    "Sydney": "assets/ir_files/SOH Concert Hall_SBg2v2_32b_aio.wav"
};

const audioFiles = {
    "Classical": "assets/audio_samples/onclassical_demo_demicheli_geminiani_pieces_allegro-in-f-major_small-version_32b_aio.wav"
};

// Initialize UI elements
window.addEventListener("DOMContentLoaded", () => {
    handleAudioSourceChange();
});
console.log("IR size:", irData.length);
console.log("Input size:", inputData.length);
console.log("Padded IR size:", irPadded.length);

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

// Event listeners for the radio buttons
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

// Convolution function for applying reverb
function partitionedConvolution(inputBuffer, irBuffer, fftSize) {
    const inputData = inputBuffer.getChannelData(0); // Mono
    const irData = irBuffer.getChannelData(0);

    // Ensure IR data is padded to match fftSize
    const irPadded = new Float32Array(fftSize); // Create an array of size fftSize
    irPadded.set(irData.slice(0, fftSize)); // Copy the IR data into the padded array, slicing if necessary

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


// Function to create an AudioBuffer from data
function createAudioBufferFromData(data, sampleRate, context) {
    const buffer = context.createBuffer(1, data.length, sampleRate);
    buffer.getChannelData(0).set(data);
    return buffer;
}

// Function to apply reverb and play the audio
async function applyReverbAndPlay(audioUrl, irUrl, fftSize) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    try {
        const [audioBuffer, irBuffer] = await Promise.all([
            loadAudioFile(audioUrl, audioContext),
            loadAudioFile(irUrl, audioContext)
        ]);

        // Apply convolution to the audio
        const processedData = partitionedConvolution(audioBuffer, irBuffer, fftSize);

        // Create an audio buffer from the processed data
        const resultBuffer = createAudioBufferFromData(processedData, audioContext.sampleRate, audioContext);

        // Play the processed audio
        const source = audioContext.createBufferSource();
        source.buffer = resultBuffer;
        source.connect(audioContext.destination);
        source.start();
    } catch (error) {
        console.error("Error applying reverb:", error);
        alert("An error occurred while applying the reverb. Please check the console for details.");
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
