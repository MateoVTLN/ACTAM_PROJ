const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let audioBuffer;

// RT60 values for different rooms
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
   // Add corresponding RT60 values
};

// Function to load an audio file
async function loadAudioFile(file) {
    const arrayBuffer = await file.arrayBuffer();
    return await audioContext.decodeAudioData(arrayBuffer);
}

// Function to apply bandpass filter with specified reverb
function applyBandReverb(audioBuffer, lowcut, highcut, decayTime) {
    const gainNode = audioContext.createGain();
    const convolver = audioContext.createConvolver();
    const filter = audioContext.createBiquadFilter();

    // Configure bandpass filter
    filter.type = "bandpass";
    filter.frequency.value = (lowcut + highcut) / 2;
    filter.Q.value = highcut / lowcut;

    // Generate synthetic impulse response
    const irBuffer = audioContext.createBuffer(2, decayTime * audioContext.sampleRate, audioContext.sampleRate);
    const channelData = irBuffer.getChannelData(0);
    for (let i = 0; i < channelData.length; i++) {
        channelData[i] = Math.random() * Math.exp(-3 * (i / irBuffer.sampleRate) / decayTime);
    }
    convolver.buffer = irBuffer;

    // Set up audio graph
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(filter);
    filter.connect(convolver);
    convolver.connect(gainNode);
    gainNode.connect(audioContext.destination);

    source.start();
}

// Event listener for the "Apply Reverb" button
document.getElementById("applyReverbBtn").addEventListener("click", async () => {
    try {
        const audioFileInput = document.getElementById("audioFile");
        const irSelect = document.getElementById("irSelect");

        // Validate inputs
        if (audioFileInput.files.length === 0) {
            alert("Please upload an audio file.");
            return;
        }
        const selectedRoom = irSelect.value;
        const rt60Bands = rt60Values[selectedRoom];
        if (!rt60Bands || rt60Bands.length === 0) {
            alert("RT60 values for the selected room are not defined.");
            return;
        }

        // Load and decode the audio file
        const file = audioFileInput.files[0];
        audioBuffer = await loadAudioFile(file);

        // Apply reverb for each band
        for (const [band, decayTime] of rt60Bands) {
            const [lowcut, highcut] = band.split("-").map(Number);
            applyBandReverb(audioBuffer, lowcut, highcut, decayTime);
        }

        console.log("Reverb applied successfully.");
    } catch (error) {
        console.error("Error applying reverb:", error);
        alert("An error occurred while applying the reverb. Check the console for details.");
    }
});
