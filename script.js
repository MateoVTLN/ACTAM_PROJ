const audioContext = new (window.AudioContext || window.AudioContext)();
let audioBuffer, convolverNode, sourceNode;

// List of URLs for IR files
const irFiles = {
    "Taormina": "assets/ir_files/Taormina_scd1_32b_aio.wav",
    "Wembley": "assets/ir_files/Wembley Arena_mcg1v2.wav",
    "Sydney": "assets/ir_files/SOH Concert Hall_SBg2v2_32b_aio.wav"
};

// Fill the IR selection dropdown
const irSelect = document.getElementById('irSelect');
Object.keys(irFiles).forEach(room => {
    const option = document.createElement('option');
    option.value = irFiles[room];
    option.text = room;
    irSelect.appendChild(option);
});

// Load an audio file chosen by the user or from the website
document.getElementById('audioFile').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (file) {
        // If the user selects a file from their device
        const arrayBuffer = await file.arrayBuffer();
        audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    } else {
        // If no file is selected, load the default audio from the site
        const selectedAudio = document.getElementById('audioSelect').value;
        const audioPath = `assets/audio_samples/${selectedAudio}`;
        const response = await fetch(audioPath);
        const arrayBuffer = await response.arrayBuffer();
        audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    }
});

// List of audio files available on the site
const audioFiles = [
    "assets/audio_samples/onclassical_demo_demicheli_geminiani_pieces_allegro-in-f-major_small-version.wav"
];

// Populate the audio selection dropdown
const audioSelect = document.getElementById('audioSelect');
audioFiles.forEach(file => {
    const option = document.createElement('option');
    option.value = file;
    option.text = file;
    audioSelect.appendChild(option);
});

// Load the chosen IR file
async function loadImpulseResponse(url) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return await audioContext.decodeAudioData(arrayBuffer);
}

// Function to apply RT60 Reverb effect
function applyRT60Reverb(audioBuffer, rt60Values) {
    rt60Values.forEach(({ band, rt60 }) => {
        console.log(`Band: ${band}, RT60: ${rt60.toFixed(2)} seconds`);
    });

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

// Example RT60 Calculation
function calculateRT60(audioSamples, sampleRate, bands) {
    const rt60Values = [];

    bands.forEach(([lowcut, highcut]) => {
        // Filter and calculate energy decay, etc.
        // (Full RT60 calculation here...)
    });

    return rt60Values;
}

// Event listener to play the audio when the button is clicked
document.getElementById('playButton').addEventListener('click', async () => {
    if (!audioBuffer) {
        alert('Veuillez charger un fichier audio d\'abord!');
        return;
    }

    const sampleRate = audioBuffer.sampleRate;
    const bands = [
        [50, 63], [63, 79], [79, 100], [100, 126], [126, 159]
        // Other bands can be added here
    ];

    const rt60Results = calculateRT60(audioBuffer, sampleRate, bands);
    await applyRT60Reverb(audioBuffer, rt60Results);
});
