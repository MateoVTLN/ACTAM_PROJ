const audioContext = new (window.AudioContext || window.AudioContext)();
let audioBuffer, convolverNode, sourceNode;

// Liste des URLs pour les fichiers IR (wav) convertis
const irFiles = {
    "Taormina": "assets/ir_files/Taormina_scd1_32b_aio.wav",  // Assurez-vous que ces fichiers sont au format WAV
    "Wembley": "assets/ir_files/Wembley_Arena_scg1v2.wav",
    "Sydney": "assets/ir_files/Wembley_SOH_Concert_Hall_SBg2v2_32b_aio.wav"
};

// Remplir le menu de sélection des IR
const irSelect = document.getElementById('irSelect');
Object.keys(irFiles).forEach(room => {
    const option = document.createElement('option');
    option.value = irFiles[room];
    option.text = room;
    irSelect.appendChild(option);
});

// Charger un fichier audio choisi par l'utilisateur ou depuis le site
document.getElementById('audioFile').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (file) {
        // Si l'utilisateur choisit un fichier depuis son appareil
        const arrayBuffer = await file.arrayBuffer();
        audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    } else {
        // Si l'utilisateur n'a pas sélectionné de fichier, charge un fichier par défaut du site
        const selectedAudio = document.getElementById('audioSelect').value; // Récupérer le fichier audio sélectionné dans la liste
        const audioPath = `assets/audio_samples/${selectedAudio}`;  // Chemin du fichier audio
        const response = await fetch(audioPath);
        const arrayBuffer = await response.arrayBuffer();
        audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    }
});

// Liste des fichiers audio pré-stockés sur le site (affichés dans un menu déroulant)
const audioFiles = [
    "sample1.wav",  // Exemple de fichier audio dans le dossier assets/audio_samples/
    "sample2.wav",
    "sample3.wav"
];

// Remplir le menu de sélection des fichiers audio
const audioSelect = document.getElementById('audioSelect');
audioFiles.forEach(file => {
    const option = document.createElement('option');
    option.value = file;
    option.text = file;
    audioSelect.appendChild(option);
});


// Charger le fichier IR choisi
async function loadImpulseResponse(url) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return await audioContext.decodeAudioData(arrayBuffer);
}

// Bandpass filter function using Butterworth filter
function bandpassFilter(signal, sampleRate, lowcut, highcut, order = 4) {
    const nyquist = 0.5 * sampleRate;
    const low = lowcut / nyquist;
    const high = highcut / nyquist;

    // Use a third-party library like dsp.js or implement your own Butterworth filter
    const butter = new Butterworth(order);
    const bpf = butter.bandpass(low, high);

    return bpf.apply(signal);
}

// RT60 Calculation function
function calculateRT60(audioSamples, sampleRate, bands) {
    const rt60Values = [];

    bands.forEach(([lowcut, highcut]) => {
        // Filter the signal for the given band
        const filteredSignal = bandpassFilter(audioSamples, sampleRate, lowcut, highcut);

        // Calculate the energy decay curve
        const energy = filteredSignal.map(x => x ** 2);
        const energyDecayCurve = cumulativeSumReverse(energy);
        const maxEnergy = Math.max(...energyDecayCurve);
        const decayDb = energyDecayCurve.map(e => 10 * Math.log10(e / maxEnergy));

        // Check if sufficient decay data is available
        const idxStart = decayDb.findIndex(db => db <= -5);
        const idxEnd = decayDb.findIndex(db => db <= -35);

        if (idxStart === -1 || idxEnd === -1 || idxEnd <= idxStart) {
            return; // Skip this band if decay data is insufficient
        }

        // Compute linear regression to calculate slope
        const times = Array.from({ length: idxEnd - idxStart + 1 }, (_, i) => (i + idxStart) / sampleRate);
        const decayDbSlice = decayDb.slice(idxStart, idxEnd + 1);
        const { slope } = linearRegression(times, decayDbSlice);

        // Calculate RT60
        const rt60 = -60 / slope;
        rt60Values.push({ band: `${lowcut}-${highcut} Hz`, rt60 });
    });

    return rt60Values;
}

// Cumulative sum in reverse
function cumulativeSumReverse(array) {
    const result = [];
    let sum = 0;
    for (let i = array.length - 1; i >= 0; i--) {
        sum += array[i];
        result[i] = sum;
    }
    return result;
}

// Linear regression helper function
function linearRegression(x, y) {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((acc, val, i) => acc + val * y[i], 0);
    const sumX2 = x.reduce((acc, val) => acc + val ** 2, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX ** 2);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
}

// Apply RT60 reverb effect based on the bands' RT60 values
function applyRT60Reverb(audioBuffer, rt60Values) {
    // Adjust the reverb based on the RT60 values
    rt60Values.forEach(({ band, rt60 }) => {
        console.log(`Band: ${band}, RT60: ${rt60.toFixed(2)} seconds`);
    });

    // Create ConvolverNode and apply IR with adjusted RT60 properties
    return new Promise(async (resolve) => {
        const irUrl = irSelect.value;
        const irBuffer = await loadImpulseResponse(irUrl);

        convolverNode = audioContext.createConvolver();
        convolverNode.buffer = irBuffer;

        sourceNode = audioContext.createBufferSource();
        sourceNode.buffer = audioBuffer;

        sourceNode.connect(convolverNode);
        convolverNode.connect(audioContext.destination);
        sourceNode.start();
        resolve();
    });
}

// Example usage
(async function main() {
    const sampleRate = 44100; // Example sample rate in Hz
    const audioSamples = await loadWavFile("path/to/audio.wav"); // Use a library to load WAV files into an array

    // Define 1/3-octave bands
    const bands = [
        [50, 63], [63, 79], [79, 100], [100, 126], [126, 159], [159, 200],
        [200, 252], [252, 317], [317, 400], [400, 504], [504, 635], [635, 800],
        [800, 1008], [1008, 1270], [1270, 1600], [1600, 2016], [2016, 2540],
        [2540, 3200], [3200, 4032], [4032, 5080], [5080, 6400], [6400, 8063],
        [8063, 10159], [10159, 12800], [12800, 16127]
    ];

    // Calculate RT60 values
    const rt60Results = calculateRT60(audioSamples, sampleRate, bands);

    // Apply reverb with RT60 values
    await applyRT60Reverb(audioBuffer, rt60Results);
})();
