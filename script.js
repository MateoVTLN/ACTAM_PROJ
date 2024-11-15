const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let audioBuffer, convolverNode, sourceNode;

// List of available IR files (Room Impulse Responses)
const irFiles = {
    "Taormina": "assets/ir_files/Taormina_scd1_32b_aio.wav",
    "Wembley": "assets/ir_files/Wembley Arena_mcg1v2.wav",
    "Sydney": "assets/ir_files/SOH Concert Hall_SBg2v2_32b_aio.wav"
};

// Define 1/3-octave bands for filtering (same bands as in the Python code)
const bands = [
    [50, 63], [63, 79], [79, 100], [100, 126], [126, 159], [159, 200],
    [200, 252], [252, 317], [317, 400], [400, 504], [504, 635], [635, 800],
    [800, 1008], [1008, 1270], [1270, 1600], [1600, 2016], [2016, 2540],
    [2540, 3200], [3200, 4032], [4032, 5080], [5080, 6400], [6400, 8063],
    [8063, 10159], [10159, 12800], [12800, 16127]
];

// Bandpass filter function using Web Audio API
function bandpassFilter(audioBuffer, sampleRate, lowcut, highcut) {
    const filterNode = audioContext.createBiquadFilter();
    filterNode.type = "bandpass";
    filterNode.frequency.value = (lowcut + highcut) / 2;
    filterNode.Q.value = (highcut / lowcut); // Q-factor to define the band width

    const bufferSource = audioContext.createBufferSource();
    bufferSource.buffer = audioBuffer;

    bufferSource.connect(filterNode);
    filterNode.connect(audioContext.destination);
    bufferSource.start();

    return bufferSource;
}

// Function to calculate energy decay and RT60 for each frequency band
async function calculateRT60(audioBuffer) {
    const sampleRate = audioBuffer.sampleRate;
    const rt60Values = [];

    // For each frequency band, we apply bandpass filter and calculate RT60
    for (const [lowcut, highcut] of bands) {
        const filteredSignal = await applyBandpassFilter(audioBuffer, sampleRate, lowcut, highcut);

        // Compute energy decay curve (cumulative energy)
        const energy = filteredSignal.map(sample => Math.pow(sample, 2));
        const energyDecay = energy.reverse().map((e, idx, arr) => arr.slice(0, idx + 1).reduce((sum, val) => sum + val, 0)).reverse();
        const decayDb = energyDecay.map(e => 10 * Math.log10(e / Math.max(...energyDecay)));

        // Try to find -5 dB and -65 dB points for linear regression
        const startIdx = decayDb.findIndex(d => d <= -5);
        const endIdx = decayDb.findIndex(d => d <= -65);

        if (startIdx === -1 || endIdx === -1) continue; // Skip this band if decay curve isn't valid

        // Time array for linear regression
        const times = decayDb.map((_, idx) => idx / sampleRate);

        // Linear regression to estimate RT60
        const slope = linearRegression(times.slice(startIdx, endIdx), decayDb.slice(startIdx, endIdx)).slope;
        const rt60 = -60 / slope; // Calculate RT60 from the slope

        rt60Values.push({ band: `${lowcut}-${highcut} Hz`, rt60 });
    }

    return rt60Values;
}

// Linear regression function (simple linear regression)
function linearRegression(x, y) {
    const n = x.length;
    const sumX = x.reduce((sum, xi) => sum + xi, 0);
    const sumY = y.reduce((sum, yi) => sum + yi, 0);
    const sumXY = x.reduce((sum, xi, idx) => sum + xi * y[idx], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
}

// Function to apply the bandpass filter and get the processed signal
async function applyBandpassFilter(audioBuffer, sampleRate, lowcut, highcut) {
    const filterNode = audioContext.createBiquadFilter();
    filterNode.type = "bandpass";
    filterNode.frequency.value = (lowcut + highcut) / 2;
    filterNode.Q.value = highcut / lowcut;

    const bufferSource = audioContext.createBufferSource();
    bufferSource.buffer = audioBuffer;

    bufferSource.connect(filterNode);
    filterNode.connect(audioContext.destination);
    bufferSource.start();

    const signal = await getFilteredSignal(bufferSource);
    return signal;
}

// Function to fetch the filtered signal from the audio node
function getFilteredSignal(sourceNode) {
    return new Promise((resolve, reject) => {
        const buffer = new Float32Array(sourceNode.buffer.length);
        const scriptProcessor = audioContext.createScriptProcessor(2048, 1, 1);
        
        scriptProcessor.onaudioprocess = (e) => {
            buffer.set(e.inputBuffer.getChannelData(0));
            resolve(buffer);
        };
        
        sourceNode.connect(scriptProcessor);
        scriptProcessor.connect(audioContext.destination);
    });
}

// Load the selected IR file (Impulse Response)
async function loadImpulseResponse(url) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return await audioContext.decodeAudioData(arrayBuffer);
}

// Load the audio file
async function loadAudioFile(file) {
    const arrayBuffer = await file.arrayBuffer();
    return await audioContext.decodeAudioData(arrayBuffer);
}

// Apply reverb and play the audio
async function applyReverbAndPlay() {
    const irUrl = document.getElementById("irSelect").value;
    const audioFile = document.getElementById("audioFile").files[0];
    const audioUrl = audioFile ? URL.createObjectURL(audioFile) : document.getElementById("audioSelect").value;

    // Load audio and impulse response (IR)
    const audioBuffer = await loadAudioFile(audioFile || new File([audioUrl], "audio.wav"));
    const irBuffer = await loadImpulseResponse(irUrl);

    // Apply RT60 calculation and convolve with IR
    const rt60Values = await calculateRT60(audioBuffer);
    console.log("RT60 Values for each band:", rt60Values);

    // Create convolver node and apply IR
    const convolver = audioContext.createConvolver();
    convolver.buffer = irBuffer;

    // Create source node and connect to convolver
    sourceNode = audioContext.createBufferSource();
    sourceNode.buffer = audioBuffer;
    sourceNode.connect(convolver);
    convolver.connect(audioContext.destination);

    // Play audio
    sourceNode.start();
}

// Event listener for the "Apply Reverb" button
document.getElementById("applyReverbBtn").addEventListener("click", applyReverbAndPlay);
