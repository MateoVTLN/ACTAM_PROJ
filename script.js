// Variables pour suivre l'état
let selectedAudioUrl = null;
let selectedRoomIR = null;
let localAudioFile = null;

// Références DOM
const audioFileInput = document.getElementById("audio-file-input");
const siteAudioSelect = document.getElementById("site-audio-select");
const roomSelect = document.getElementById("room-select");
const applyReverbButton = document.getElementById("apply-reverb");
const resultAudio = document.getElementById("result-audio");

// Gestion de la sélection de source audio
document.querySelectorAll('input[name="audio-source"]').forEach((radio) => {
    radio.addEventListener("change", (event) => {
        const source = event.target.value;

        if (source === "local") {
            audioFileInput.disabled = false;
            siteAudioSelect.disabled = true;
            siteAudioSelect.value = "";
        } else if (source === "site") {
            audioFileInput.disabled = true;
            siteAudioSelect.disabled = false;
            audioFileInput.value = "";
        }

        selectedAudioUrl = null;
        localAudioFile = null;
    });
});

// Gestion du fichier audio local
audioFileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
        localAudioFile = file;
    }
});

// Gestion des fichiers audio du site
siteAudioSelect.addEventListener("change", (event) => {
    selectedAudioUrl = event.target.value;
});

// Gestion de la sélection de salle
roomSelect.addEventListener("change", (event) => {
    selectedRoomIR = event.target.value;
});

// Fonction pour charger un fichier local
function loadLocalAudioFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

// Gestion du bouton d'application
applyReverbButton.addEventListener("click", async () => {
    if (!selectedRoomIR || (!localAudioFile && !selectedAudioUrl)) {
        alert("Veuillez sélectionner un fichier audio et une salle.");
        return;
    }

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    let audioBuffer;

    if (localAudioFile) {
        const localFileBuffer = await loadLocalAudioFile(localAudioFile);
        audioBuffer = await audioContext.decodeAudioData(localFileBuffer);
    } else {
        audioBuffer = await loadAudioFile(selectedAudioUrl, audioContext);
    }

    const irBuffer = await loadAudioFile(selectedRoomIR, audioContext);

    // Appliquer la convolution
    const processedData = partitionedConvolution(audioBuffer, irBuffer, 4096);
    const resultBuffer = createAudioBufferFromData(processedData, audioContext.sampleRate, audioContext);

    // Créer un Blob pour permettre le téléchargement
    const blob = new Blob([resultBuffer], { type: "audio/wav" });
    resultAudio.src = URL.createObjectURL(blob);
    resultAudio.play();
});
