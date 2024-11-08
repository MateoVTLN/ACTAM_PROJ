

const audioContext = new (window.AudioContext || window.AudioContext)();
let audioBuffer, convolverNode, sourceNode;

// Liste des URLs pour les fichiers IR
const irFiles = {
    "Taormina": "assets/ir_files/Taormina_scd1.wir",
    "Wembley": "assets/ir_files/Wembley Arena_scg1v2.wir"
};

// Remplir le menu de sélection des IR

const irSelect = document.getElementById('irSelect');
Object.keys(irFiles).forEach(room => {
    const option = document.createElement('option');
    option.value = irFiles[room];
    option.text = room;
    irSelect.appendChild(option);
});

// Charger un fichier audio choisi par l'utilisateur
document.getElementById('audioFile').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (file) {
        const arrayBuffer = await file.arrayBuffer();
        audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    }
});

// Charger le fichier IR choisi
async function loadImpulseResponse(url) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return await audioContext.decodeAudioData(arrayBuffer);
}

// Appliquer la réverbération et jouer l'audio
document.getElementById('playButton').addEventListener('click', async () => {
    if (!audioBuffer) {
        alert("Please select an audio file.");
        return;
    }

    // Arrêter la lecture précédente si nécessaire
    if (sourceNode) sourceNode.stop();

    // Charger la réponse impulsionnelle choisie
    const irUrl = irSelect.value;
    const irBuffer = await loadImpulseResponse(irUrl);

    // Créer un ConvolverNode avec le buffer IR
    convolverNode = audioContext.createConvolver();
    convolverNode.buffer = irBuffer;

    // Créer un BufferSourceNode pour l'audio de l'utilisateur
    sourceNode = audioContext.createBufferSource();
    sourceNode.buffer = audioBuffer;

    // Connecter les nœuds
    sourceNode.connect(convolverNode);
    convolverNode.connect(audioContext.destination);

    // Jouer l'audio
    sourceNode.start();
});
