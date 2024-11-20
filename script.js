// Références DOM
const audioSourceRadios = document.querySelectorAll('input[name="audio-source"]');
const audioFileInput = document.getElementById("audio-file-input");
const siteAudioSelect = document.getElementById("site-audio-select");
const roomSelect = document.getElementById("room-select");
const applyReverbButton = document.getElementById("apply-reverb");
const resultAudio = document.getElementById("result-audio");

// État global
let selectedAudioUrl = null;
let localAudioFile = null;
let selectedRoomIR = null;

// Gestion des boutons radio pour la source audio
audioSourceRadios.forEach((radio) => {
    radio.addEventListener("change", (event) => {
        const source = event.target.value;

        if (source === "local") {
            // Activer l'import local et désactiver le menu de sélection
            audioFileInput.disabled = false;
            siteAudioSelect.disabled = true;
            siteAudioSelect.value = "";
            selectedAudioUrl = null; // Réinitialiser l'URL de l'échantillon
        } else if (source === "site") {
            // Activer le menu de sélection et désactiver l'import local
            audioFileInput.disabled = true;
            siteAudioSelect.disabled = false;
            audioFileInput.value = "";
            localAudioFile = null; // Réinitialiser le fichier local
        }
    });
});

// Gestion du fichier audio local
audioFileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
        localAudioFile = file;
    }
});

// Gestion de la sélection de l'audio du site
siteAudioSelect.addEventListener("change", (event) => {
    selectedAudioUrl = event.target.value;
});

// Gestion de la sélection de la salle
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

    // Créer un Blob pour permettre le téléchargement ou la lecture
    const blob = new Blob([resultBuffer], { type: "audio/wav" });
    resultAudio.src = URL.createObjectURL(blob);
    resultAudio.play();
});
