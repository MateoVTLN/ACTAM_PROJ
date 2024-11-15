document.addEventListener("DOMContentLoaded", function () {
    // Initialisation du contexte audio
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    let audioBuffer, convolverNode, sourceNode;

    // Liste des fichiers IR (Réponse Impulsionnelle) pour les différentes salles
    const irFiles = {
        "Taormina": "assets/ir_files/Taormina_scd1_32b_aio.wav",  // Assurez-vous que ces fichiers sont au format WAV
        "Wembley": "assets/ir_files/Wembley Arena_mcg1v2.wav",
        "Sydney": "assets/ir_files/SOH Concert Hall_SBg2v2_32b_aio.wav"
    };

    // Remplir le menu de sélection des IR
    const irSelect = document.getElementById('irSelect');
    Object.keys(irFiles).forEach(room => {
        const option = document.createElement('option');
        option.value = irFiles[room];
        option.text = room;
        irSelect.appendChild(option);
    });

    // Liste des fichiers audio prédéfinis sur le site
    const audioFiles = [
        "assets/audio_samples/onclassical_demo_demicheli_geminiani_pieces_allegro-in-f-major_small-version.wav"  // Exemple
    ];

    // Remplir le menu de sélection des fichiers audio
    const audioSelect = document.getElementById('audioSelect');
    audioFiles.forEach(file => {
        const option = document.createElement('option');
        option.value = file;
        option.text = file;
        audioSelect.appendChild(option);
    });

    // Charger un fichier audio choisi par l'utilisateur ou depuis le site
    document.getElementById('audioFile').addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (file) {
            try {
                // Si l'utilisateur choisit un fichier depuis son appareil
                const arrayBuffer = await file.arrayBuffer();
                audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            } catch (error) {
                console.error("Erreur de chargement du fichier audio :", error);
            }
        } else {
            // Si l'utilisateur n'a pas sélectionné de fichier, charge un fichier par défaut du site
            const selectedAudio = document.getElementById('audioSelect').value;
            const audioPath = `assets/audio_samples/${selectedAudio}`;
            try {
                const response = await fetch(audioPath);
                if (!response.ok) throw new Error("Échec du chargement de l'audio.");
                const arrayBuffer = await response.arrayBuffer();
                audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            } catch (error) {
                console.error("Erreur de chargement de l'audio depuis le site :", error);
            }
        }
    });

    // Charger un fichier IR choisi
    async function loadImpulseResponse(url) {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        return await audioContext.decodeAudioData(arrayBuffer);
    }

    // Fonction de filtrage bandpass (passage de fréquence)
    function bandpassFilter(signal, sampleRate, lowcut, highcut, order = 4) {
        const nyquist = 0.5 * sampleRate;
        const low = lowcut / nyquist;
        const high = highcut / nyquist;

        // Utilisez une bibliothèque tierce comme DSP.js ou implémentez un filtre de Butterworth
        const butter = new Butterworth(order);
        const bpf = butter.bandpass(low, high);

        return bpf.apply(signal);
    }

    // Fonction de calcul RT60
    function calculateRT60(audioSamples, sampleRate, bands) {
        const rt60Values = [];

        bands.forEach(([lowcut, highcut]) => {
            // Filtrer le signal pour la bande donnée
            const filteredSignal = bandpassFilter(audioSamples, sampleRate, lowcut, highcut);

            // Calculer la courbe de décroissance de l'énergie
            const energy = filteredSignal.map(x => x ** 2);
            const energyDecayCurve = cumulativeSumReverse(energy);
            const maxEnergy = Math.max(...energyDecayCurve);
            const decayDb = energyDecayCurve.map(e => 10 * Math.log10(e / maxEnergy));

            // Vérifier si des données de décroissance suffisantes sont disponibles
            const idxStart = decayDb.findIndex(db => db <= -5);
            const idxEnd = decayDb.findIndex(db => db <= -35);

            if (idxStart === -1 || idxEnd === -1 || idxEnd <= idxStart) {
                return; // Sauter cette bande si les données de décroissance sont insuffisantes
            }

            // Calcul de la régression linéaire pour calculer la pente
            const times = Array.from({ length: idxEnd - idxStart + 1 }, (_, i) => (i + idxStart) / sampleRate);
            const decayDbSlice = decayDb.slice(idxStart, idxEnd + 1);
            const { slope } = linearRegression(times, decayDbSlice);

            // Calcul du RT60
            const rt60 = -60 / slope;
            rt60Values.push({ band: `${lowcut}-${highcut} Hz`, rt60 });
        });

        return rt60Values;
    }

    // Fonction de somme cumulée inverse
    function cumulativeSumReverse(array) {
        const result = [];
        let sum = 0;
        for (let i = array.length - 1; i >= 0; i--) {
            sum += array[i];
            result[i] = sum;
        }
        return result;
    }

    // Fonction d'aide pour la régression linéaire
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

    // Fonction pour appliquer la réverbération RT60
    async function applyRT60Reverb(audioBuffer, rt60Values) {
        // Ajuster la réverbération en fonction des valeurs RT60
        rt60Values.forEach(({ band, rt60 }) => {
            console.log(`Bande : ${band}, RT60 : ${rt60.toFixed(2)} secondes`);
        });

        // Créer le ConvolverNode et appliquer l'IR avec les propriétés ajustées de RT60
        const irUrl = irSelect.value;
        const irBuffer = await loadImpulseResponse(irUrl);

        convolverNode = audioContext.createConvolver();
        convolverNode.buffer = irBuffer;

        sourceNode = audioContext.createBufferSource();
        sourceNode.buffer = audioBuffer;

        sourceNode.connect(convolverNode);
        convolverNode.connect(audioContext.destination);
        sourceNode.start();
    }

    // Exemple de calcul RT60 et application de la réverbération
    document.getElementById('playButton').addEventListener('click', async () => {
        if (!audioBuffer) {
            alert("Aucun fichier audio chargé !");
            return;
        }

        const sampleRate = 44100; // Exemple de fréquence d'échantillonnage
        const bands = [
            [50, 63], [63, 79], [79, 100], [100, 126], [126, 159], [159, 200],
            [200, 252],
