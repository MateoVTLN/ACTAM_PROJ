// Références aux éléments HTML
const localAudioRadio = document.getElementById("local-audio");
const siteAudioRadio = document.getElementById("site-audio");
const audioFileInput = document.getElementById("audio-file-input");
const siteAudioSelect = document.getElementById("site-audio-select");
const roomSelect = document.getElementById("room-select");
const applyReverbButton = document.getElementById("apply-reverb");

// Initialisation : désactiver les champs non sélectionnés
audioFileInput.disabled = true;
siteAudioSelect.disabled = true;

// Gestion du changement des options d'entrée
function handleAudioSourceChange() {
    if (localAudioRadio.checked) {
        audioFileInput.disabled = false;
        siteAudioSelect.disabled = true;
        siteAudioSelect.value = ""; // Réinitialiser la sélection du fichier du site
    } else if (siteAudioRadio.checked) {
        audioFileInput.disabled = true;
        siteAudioSelect.disabled = false;
        audioFileInput.value = ""; // Réinitialiser le champ de fichier local
    }
}

// Ajouter les gestionnaires d'événements pour les boutons radio
localAudioRadio.addEventListener("change", handleAudioSourceChange);
siteAudioRadio.addEventListener("change", handleAudioSourceChange);

// Charger un fichier audio en tant qu'AudioBuffer
async function loadAudioFile(audioUrl, audioContext) {
    const response = await fetch(audioUrl);
    const arrayBuffer = await response.arrayBuffer();
    return audioContext.decodeAudioData(arrayBuffer);
}

// Convolution par FFT (partitionnée pour l'efficacité)
function partitionedConvolution(inputBuffer, irBuffer, fftSize) {
    const inputData = inputBuffer.getChannelData(0); // Mono
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

// Créer un AudioBuffer à partir des données calculées
function createAudioBufferFromData(data, sampleRate, context) {
    const buffer = context.createBuffer(1, data.length, sampleRate);
    buffer.getChannelData(0).set(data);
    return buffer;
}

// Appliquer la réverbération et lire l'audio traité
async function applyReverbAndPlay(audioUrl, irUrl, fftSize) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    const [audioBuffer, irBuffer] = await Promise.all([
        loadAudioFile(audioUrl, audioContext),
        loadAudioFile(irUrl, audioContext)
    ]);

    const processedData = partitionedConvolution(audioBuffer, irBuffer, fftSize);

    const resultBuffer = createAudioBufferFromData(processedData, audioContext.sampleRate, audioContext);

    // Lire le résultat
    const source = audioContext.createBufferSource();
    source.buffer = resultBuffer;
    source.connect(audioContext.destination);
    source.start();
}

// Gérer le clic sur le bouton "Appliquer"
applyReverbButton.addEventListener("click", async () => {
    let audioUrl;
    const room = roomSelect.value;
    const irFiles = {
        "Taormina": "assets/ir_files/Taormina_scd1_32b_aio.wav",
        "Wembley": "assets/ir_files/Wembley Arena_mcg1v2.wav",
        "Sydney": "assets/ir_files/SOH Concert Hall_SBg2v2_32b_aio.wav"
    };

    const irUrl = irFiles[room];

    if (!room) {
        alert("Veuillez sélectionner une salle pour appliquer la réverbération.");
        return;
    }

    if (localAudioRadio.checked && audioFileInput.files.length > 0) {
        const file = audioFileInput.files[0];
        audioUrl = URL.createObjectURL(file);
    } else if (siteAudioRadio.checked && siteAudioSelect.value) {
        audioUrl = siteAudioSelect.value;
    } else {
        alert("Veuillez sélectionner une source audio avant d'appliquer la réverbération.");
        return;
    }

    try {
        await applyReverbAndPlay(audioUrl, irUrl, 2048); // Taille de FFT fixée à 2048 pour cet exemple
    } catch (error) {
        console.error("Erreur lors de l'application de la réverbération :", error);
        alert("Une erreur est survenue lors de l'application de la réverbération.");
    }
});
