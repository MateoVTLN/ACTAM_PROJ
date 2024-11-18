const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let audioBuffer, sourceNode;

// RT60 Values for Different Rooms (rounded to 3 decimals)
const rt60Values = {
    "Wembley": [
        ['50-63 Hz', 4.643], ['63-79 Hz', 3.989], ['79-100 Hz', 3.868], 
        ['100-126 Hz', 3.658], ['126-159 Hz', 3.504], ['159-200 Hz', 3.489],
        ['200-252 Hz', 3.805], ['252-317 Hz', 3.646], ['317-400 Hz', 3.251],
        ['400-504 Hz', 3.575], ['504-635 Hz', 3.712], ['635-800 Hz', 3.625],
        ['800-1008 Hz', 3.570], ['1008-1270 Hz', 3.473], ['1270-1600 Hz', 3.294],
        ['1600-2016 Hz', 3.392], ['2016-2540 Hz', 3.757], ['2540-3200 Hz', 4.356],
        ['3200-4032 Hz', 4.402], ['4032-5080 Hz', 4.059], ['5080-6400 Hz', 3.252],
        ['6400-8063 Hz', 2.671], ['8063-10159 Hz', 2.769], ['10159-12800 Hz', 4.958],
        ['12800-16127 Hz', 9.487] ],
    "Taormina": [
        ['50-63 Hz', 1.266],['63-79 Hz', 1.434],['79-100 Hz', 1.264],
        ['100-126 Hz', 1.211],['126-159 Hz', 1.236],['159-200 Hz', 1.176],
        ['200-252 Hz', 1.034], ['252-317 Hz', 1.164],['317-400 Hz', 1.223], 
        ['400-504 Hz', 1.102], ['504-635 Hz', 1.185],['635-800 Hz', 1.084], 
        ['800-1008 Hz', 1.085], ['1008-1270 Hz', 1.051],['1270-1600 Hz', 1.056],
        ['1600-2016 Hz', 1.011], ['2016-2540 Hz', 0.981], ['2540-3200 Hz', 0.937],
        ['3200-4032 Hz', 0.931], ['4032-5080 Hz', 0.896],['5080-6400 Hz', 0.963],
        ['6400-8063 Hz', 0.830], ['8063-10159 Hz', 1.241], ['10159-12800 Hz', 1.542],
        ['12800-16127 Hz', 1.740] ],
    
    "Sydney": [ ['50-63 Hz', 3.493],  ['63-79 Hz', 3.320],['79-100 Hz', 2.976],
        ['100-126 Hz', 3.004],  ['126-159 Hz', 2.526],  ['159-200 Hz', 2.425],
        ['200-252 Hz', 2.440],   ['252-317 Hz', 2.528],  ['317-400 Hz', 2.479],
        ['400-504 Hz', 2.578],   ['504-635 Hz', 2.684],   ['635-800 Hz', 2.510],
        ['800-1008 Hz', 2.494],  ['1008-1270 Hz', 2.389],  ['1270-1600 Hz', 2.351],
        ['1600-2016 Hz', 2.175],  ['2016-2540 Hz', 2.147],  ['2540-3200 Hz', 2.195],  
        ['3200-4032 Hz', 2.277],  ['4032-5080 Hz', 2.277], ['5080-6400 Hz', 2.226],
        ['6400-8063 Hz', 2.495],  ['8063-10159 Hz', 3.017],  ['10159-12800 Hz', 3.729], 
        ['12800-16127 Hz', 4.162] ]
};

// Function to load audio from file or selection
async function loadAudio(file, url) {
    const arrayBuffer = file ? await file.arrayBuffer() : await fetch(url).then(res => res.arrayBuffer());
    return await audioContext.decodeAudioData(arrayBuffer);
}

// Function to apply reverb based on RT60 values
async function applyReverb(room) {
    if (!audioBuffer) {
        logDebug("No audio loaded! Please upload or select an audio file.");
        return;
    }

    const rt60 = rt60Values[room];
    if (!rt60) {
        logDebug(`RT60 values for room "${room}" not found.`);
        return;
    }

    const convolverNode = audioContext.createConvolver();

    // Dummy impulse response for simplicity
    const irBuffer = await generateImpulseResponse(rt60);
    convolverNode.buffer = irBuffer;

    // Play audio
    sourceNode = audioContext.createBufferSource();
    sourceNode.buffer = audioBuffer;
    sourceNode.connect(convolverNode);
    convolverNode.connect(audioContext.destination);

    sourceNode.start();
    logDebug(`Reverb applied for room: ${room}`);
}

// Dummy IR generator based on RT60 values (to be replaced with real IR generation logic)
async function generateImpulseResponse(rt60) {
    const irLength = audioContext.sampleRate; // 1 second IR
    const irBuffer = audioContext.createBuffer(2, irLength, audioContext.sampleRate);
    for (let channel = 0; channel < 2; channel++) {
        const data = irBuffer.getChannelData(channel);
        for (let i = 0; i < irLength; i++) {
            data[i] = Math.random() * Math.exp(-i / (rt60[channel % rt60.length][1] * audioContext.sampleRate));
        }
    }
    return irBuffer;
}

// Utility function to log messages
function logDebug(message) {
    const debugElement = document.getElementById("debug");
    debugElement.innerHTML += `<p>${message}</p>`;
}

// Event listeners
document.getElementById("applyReverbBtn").addEventListener("click", async () => {
    const room = document.getElementById("roomSelect").value;
    await applyReverb(room);
});

document.getElementById("audioFile").addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (file) {
        audioBuffer = await loadAudio(file, null);
        logDebug(`Audio file "${file.name}" loaded.`);
    }
});

document.getElementById("audioSelect").addEventListener("change", async (event) => {
    const url = event.target.value;
    if (url) {
        audioBuffer = await loadAudio(null, url);
        logDebug(`Sample audio from "${url}" loaded.`);
    }
});

    "Wembley": [
        ['50-63 Hz', 4.643], ['63-79 Hz', 3.989], ['79-100 Hz', 3.868], 
        ['100-126 Hz', 3.658], ['126-159 Hz', 3.504], ['159-200 Hz', 3.489],
        ['200-252 Hz', 3.805], ['252-317 Hz', 3.646], ['317-400 Hz', 3.251],
        ['400-504 Hz', 3.575], ['504-635 Hz', 3.712], ['635-800 Hz', 3.625],
        ['800-1008 Hz', 3.570], ['1008-1270 Hz', 3.473], ['1270-1600 Hz', 3.294],
        ['1600-2016 Hz', 3.392], ['2016-2540 Hz', 3.757], ['2540-3200 Hz', 4.356],
        ['3200-4032 Hz', 4.402], ['4032-5080 Hz', 4.059], ['5080-6400 Hz', 3.252],
        ['6400-8063 Hz', 2.671], ['8063-10159 Hz', 2.769], ['10159-12800 Hz', 4.958],
        ['12800-16127 Hz', 9.487]
    ],
    "Taormina": [
    ['50-63 Hz', 1.266],['63-79 Hz', 1.434],['79-100 Hz', 1.264],
    ['100-126 Hz', 1.211],['126-159 Hz', 1.236],['159-200 Hz', 1.176],
    ['200-252 Hz', 1.034], ['252-317 Hz', 1.164],['317-400 Hz', 1.223], ['400-504 Hz', 1.102],
    ['504-635 Hz', 1.185],['635-800 Hz', 1.084], ['800-1008 Hz', 1.085],
    ['1008-1270 Hz', 1.051],['1270-1600 Hz', 1.056],['1600-2016 Hz', 1.011],
    ['2016-2540 Hz', 0.981], ['2540-3200 Hz', 0.937],['3200-4032 Hz', 0.931],
    ['4032-5080 Hz', 0.896],['5080-6400 Hz', 0.963],['6400-8063 Hz', 0.830],
    ['8063-10159 Hz', 1.241], ['10159-12800 Hz', 1.542],['12800-16127 Hz', 1.740]
],
    "Sydney": [ ['50-63 Hz', 3.493],  ['63-79 Hz', 3.320],['79-100 Hz', 2.976],
    ['100-126 Hz', 3.004],  ['126-159 Hz', 2.526],  ['159-200 Hz', 2.425],
    ['200-252 Hz', 2.440],   ['252-317 Hz', 2.528],  ['317-400 Hz', 2.479],
    ['400-504 Hz', 2.578],   ['504-635 Hz', 2.684],   ['635-800 Hz', 2.510],
    ['800-1008 Hz', 2.494],  ['1008-1270 Hz', 2.389],  ['1270-1600 Hz', 2.351],
    ['1600-2016 Hz', 2.175],  ['2016-2540 Hz', 2.147],  ['2540-3200 Hz', 2.195],  ['3200-4032 Hz', 2.277],  ['4032-5080 Hz', 2.277],
    ['5080-6400 Hz', 2.226],  ['6400-8063 Hz', 2.495],  ['8063-10159 Hz', 3.017],  ['10159-12800 Hz', 3.729],  ['12800-16127 Hz', 4.162]
]
  
