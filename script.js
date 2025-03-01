//////////////////////////////////////////////////////////////////////////
// ########################## HTML ELEMENTS ########################### //
//////////////////////////////////////////////////////////////////////////


const localAudioRadio = document.getElementById("local-audio");
const siteAudioRadio = document.getElementById("site-audio");
const audioFileInput = document.getElementById("audio-file-input");
const siteAudioSelect = document.getElementById("site-audio-select");
const applyReverbButton = document.getElementById("apply-reverb");
const stopReverbButton = document.getElementById("stop-reverb");
const roomCategorySelect = document.getElementById("room-category-select");
const roomSelectDiv = document.getElementById("room-selection");
const specificRoomSelect = document.getElementById("specific-room-select");
const irSelectDiv = document.getElementById("ir-selection");
const irSelect = document.getElementById("ir-select");
const downloadButton = document.getElementById("download-audio");
const volumeControl = document.getElementById("volume-control");
const map = L.map("minimap").setView([0, 0], 2); 


//////////////////////////////////////////////////////////////////////////
// ############################# PATHS TO ASSETS #####################  //
//////////////////////////////////////////////////////////////////////////

// Room background images
const roomMaps = {
   "Taormina Amphitheatre (Italy)": "assets/img/maps/taormina_map.jpg",
   "Sydney Opera House Concert Hall (Australia)": "assets/img/maps/soh_map.png",
   "Classroom (Italy)": "assets/img/maps/classroom_map.png",
   "Parma Auditorium (Italy)": "assets/img/maps/parma_map.png",
   "Knights Refectorium (Israel)": "assets/img/maps/knights_map.png",
   "Luzit Caves (Israel)": "assets/img/maps/luzit_map.jpeg",
   "Dinkelspiel Auditorium (Ca. USA)": "assets/img/maps/dinkelspiel_map.png",
   "London Arena (UK)": "assets/img/maps/londonarena_map.png",
   "Wembley Arena (UK)": "assets/img/maps/wembley_map.jpg",
   "Siracusa Amphitheatre(Italy)": "assets/img/maps/siracusa_map.png",
   "Disney Concert Hall (Ca. USA)" : "assets/img/maps/disney_map.jpg",
   "Living Room (Italy)" : "assets/img/maps/living_map.png",
   "Kitchen (Italy)" : "assets/img/maps/kitchen_map.png",
   "Trinity Church (NY USA)" : "assets/img/maps/trinity_map.jpg",
   "Belle Meade Church (USA)" : "assets/img/maps/bellemeade_map.png"
};

const roomBackgrounds = {
    "Taormina Amphitheatre (Italy)": "assets/img/taormina.jpg",
   "Sydney Opera House Concert Hall (Australia)": "assets/img/sydney.jpg",
   "Classroom (Italy)": "assets/img/classroom.jpg",
   "Parma Auditorium (Italy)": "assets/img/parma.jpg",
   "Knights Refectorium (Israel)": "assets/img/knightshall.jpg",
   "Luzit Caves (Israel)": "assets/img/luzit.jpg",
   "Dinkelspiel Auditorium (Ca. USA)": "assets/img/dinkelspiel.jpeg",
   "London Arena (UK)": "assets/img/londonarena.jpg",
   "Wembley Arena (UK)": "assets/img/wembley.jpg",
   "Siracusa Amphitheatre(Italy)": "assets/img/siracusa.jpg",
   "Disney Concert Hall (Ca. USA)" : "assets/img/disney.jpg",
   "Living Room (Italy)" : "assets/img/living.png",
   "Kitchen (Italy)" : "assets/img/kitchen.png",
   "Trinity Church (NY USA)" : "assets/img/trinity.jpg",
   "Belle Meade Church (USA)" : "assets/img/bellemeade.png"
}


// IR files (impulse responses) //
const roomData = {
   "Arenas": {
       "Wembley Arena (UK)": ["assets/ir_files/Wembley Arena_scg1v2.wav"],
       "London Arena (UK)": ["assets/ir_files/London Arena_scg1v2.wav"]
   },
   "Concert Halls": {
       "Sydney Opera House Concert Hall (Australia)": ["assets/ir_files/SOH Concert Hall_sWg1v2.wav", "assets/ir_files/SOH Concert Hall_sWg2v2.wav", "assets/ir_files/SOH Concert Hall_sWg3v2.wav"],
       "Disney Concert Hall (Ca. USA)": ["assets/ir_files/Disney_scg1v2.wav", "assets/ir_files/Disney_scg2v2.wav", "assets/ir_files/Disney_scg3v2.wav"]
   },
   "Churches": {
       "Trinity Church (NY USA)": ["assets/ir_files/Trinity Church_sWg1v2.wav"],
       "Belle Meade Church (USA)": ["assets/ir_files/Belle Meade_sWg1v2.wav"]
   },
   "Auditoriums": {
       "Dinkelspiel Auditorium (Ca. USA)": ["assets/ir_files/Dinkelspiel Aud_sWg1v2.wav"],
       "Parma Auditorium (Italy)": ["assets/ir_files/Parma Auditorium_mcd1.wav", "assets/ir_files/Parma Auditorium_mcd2.wav", "assets/ir_files/Parma Auditorium_mcd3.wav"]
   },
   "Amphitheatres": {
       "Taormina Amphitheatre (Italy)": ["assets/ir_files/Taormina_scd1.wav"],
       "Siracusa Amphitheatre(Italy)": ["assets/ir_files/Siracusa_mcd1.wav"]
   },
   "Others": {
       "Knights Refectorium (Israel)": ["assets/ir_files/Knights Refectorium_sWg1v2.wav"],
       "Luzit Caves (Israel)": ["assets/ir_files/Luzit Cave - Medium_sWg1v2.wav"],
       "Classroom (Italy)": ["assets/ir_files/classroom_30x25y.wav"]
   },
   "Home": {
       "Living Room (Italy)": ["assets/ir_files/Living Room_scg1v2.wav"],
       "Kitchen (Italy)": ["assets/ir_files/Kitchen_mcg1v2.wav"]
   }
};

// GPS COORDINATES FOR EACH ROOM //

const roomCoordinates = {
    // Amphitheatres
    "Taormina Amphitheatre (Italy)": [37.8522, 15.2877],
    "Siracusa Amphitheatre(Italy)": [37.0682, 15.2836],

    // Concert Halls
    "Sydney Opera House Concert Hall (Australia)": [-33.8568, 151.2153],
    "Disney Concert Hall (Ca. USA)": [34.0554, -118.2498],

    // Classrooms and Homes
    "Classroom (Italy)": [41.9028, 12.4964], // RANDOM PLACE IN MILAN BECAUSE PRECISE ADDRESS NOT MENTIONNED
    "Living Room (Italy)": [45.4642, 9.1900], // RANDOM PLACE IN MILAN BECAUSE PRECISE ADDRESS NOT MENTIONNED
    "Kitchen (Italy)": [45.4642, 9.1900], // RANDOM PLACE IN MILAN BECAUSE PRECISE ADDRESS NOT MENTIONNED

    // Churches
    "Trinity Church (NY USA)": [40.7056, -74.0139],
    "Belle Meade Church (USA)": [36.11517571698035, -86.86428396863387],

    // Auditoriums
    "Parma Auditorium (Italy)": [44.8015, 10.3279],
    "Dinkelspiel Auditorium (Ca. USA)": [37.4275, -122.1697],

    // Arenas
    "Wembley Arena (UK)": [51.5560, -0.2796],
    "London Arena (UK)": [51.5072, -0.1276],

    // Other Locations
    "Knights Refectorium (Israel)": [32.7940, 34.9896],
    "Luzit Caves (Israel)": [31.6391, 34.8352]
};


//////////////////////////////////////////////////////////////////////////
// ############################# FUNCTIONS ############################ //
//////////////////////////////////////////////////////////////////////////


let audioContext = null;
let currentSourceNode = null;
let gainNode = null;
let mediaRecorder = null;
const recordedChunks = [];
let marker; // MARK MAP

// Initialize a single AudioContext
function initializeAudioContext() { /*################## INIT AUDIO ###########################*/
   if (!audioContext) {
       audioContext = new (window.AudioContext || window.webkitAudioContext)();
   }
   return audioContext;
}

// INITIALIZE MAP
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// REFRESH MAP
specificRoomSelect.addEventListener("change", () => {
    const room = specificRoomSelect.value;
    const coordinates = roomCoordinates[room];

    if (coordinates) {
        if (marker) map.removeLayer(marker);       // UPDATES MARKER //
        marker = L.marker(coordinates).addTo(map); 
        map.setView(coordinates, 10); 
    }
});


function handleAudioSourceChange() { //  IMPORT IMAGES //
   audioFileInput.disabled = !localAudioRadio.checked;
   siteAudioSelect.disabled = !siteAudioRadio.checked;


   if (localAudioRadio.checked) siteAudioSelect.value = "";
   if (siteAudioRadio.checked) audioFileInput.value = "";
}


function setupRoomBackgroundChange() { //  SETTING UP THE BACKGROUND IMAGE ACCORDING TO THE SELCTED ROOM  //
    // Initialiser avec un fond d'écran par défaut
    document.body.style.backgroundImage = "url('assets/img/stage.png')";
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center center";
    document.body.style.backgroundAttachment = "fixed";
 
    specificRoomSelect.addEventListener("change", () => {
        const room = specificRoomSelect.value;
        const backgroundUrl = roomBackgrounds[room];
        const roomMapUrl = roomMaps[room];
 
        //  CHANGE THE BACKGROUND //
        if (backgroundUrl) {
            document.body.style.backgroundImage = `url(${backgroundUrl})`;
        } else {
            document.body.style.backgroundImage = "url('assets/img/stage.png')";
        }
        document.body.style.backgroundSize = "cover";
        document.body.style.backgroundPosition = "bottom center";
        document.body.style.backgroundAttachment = "fixed";
 
        // UPDATE THE ROOM MAP //
        updateRoomMapImage(roomMapUrl); // CALL FOR THE  ROOM MAP CHANGE FUNCTION //
    });
 }

 // FUNCTION TO CHANGE THE ROOM MAP //
function updateRoomMapImage(imageUrl) {
    const rectangleMap = document.querySelector('.rectangle-map');
    if (rectangleMap && imageUrl) { // VERIFY THE EXISTENCE OF THE IMAGE ( IN CASE THERE IS NO MAP PROVIDED) //

        // CREATE <img> WITH THE IMAGE URLS //
        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = "Room Map";
        img.style.width = "100%"; // ADAPT THE SIZE OF THE IMAGE //
        img.style.height = "100%";
        img.style.objectFit = "cover"; // FETCH ON ALL THE ZONE WITHOUT DISTORTORTING THE SHAPE //
        img.style.position = "absolute";
        //img.style.backgroundColor = "black"; # Minor adjustment : line ignored
        img.style.border = "2px solid #fff";
        img.style.opacity = "1";
        img.style.borderRadius = "5%";
        img.style.zIndex = "1";

        // EMPTY THE CONTENT OF RECTANGLE MAP AND ADD THE IMAGE //
        rectangleMap.innerHTML = ''; // DELETE PREVIOUS IMAGE FROM THE RECT //
        rectangleMap.appendChild(img); // ADD THE NEW IMAGE //
    } else {
        // IF NO IMAGE FOUND BLACK BACKGROUND
        if (rectangleMap) {
            rectangleMap.innerHTML = ''; // Vider le contenu précédent
            rectangleMap.style.backgroundColor = "black";
        }
    }
}


async function loadAudioFile(url) { // ########################### LOAD AUDIO ########################### //
   try {
       const response = await fetch(url);
       if (!response.ok) throw new Error(`Failed to fetch: ${url}`);
       const arrayBuffer = await response.arrayBuffer();
       return await audioContext.decodeAudioData(arrayBuffer);
   } catch (error) {
       console.error("Error loading audio file:", error);
       throw error;
   }
}

function reduceImpulseResponseAmplitude(buffer, reductionFactor) { // ########################### IR LEVEL CHANGE ########################### //
   for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
       const channelData = buffer.getChannelData(channel);
       for (let i = 0; i < channelData.length; i++) {
           channelData[i] *= reductionFactor;
       }
   }
   return buffer;
}

function normalizeBuffer(buffer) {
   const maxAmplitude = Math.max(...buffer.map(Math.abs));
   return maxAmplitude === 0 ? buffer : buffer.map(sample => sample / maxAmplitude);
}

async function applyReverbAndPlay(audioUrl, irUrl) { // ########################### APPLY RVB AND PLAY ###########################
   const context = initializeAudioContext();
   try {
       const [audioBuffer, irBuffer] = await Promise.all([
           loadAudioFile(audioUrl),
           loadAudioFile(irUrl)
       ]);

       const audioSource = context.createBufferSource();
       const convolver = context.createConvolver();
       irGainNode = context.createGain(); // IR Gain Node
       gainNode = context.createGain(); // Audio GainNode

       // ######################## CREATE AN ANALYSER NODE FOR THE VISUALIZER
       const analyser = context.createAnalyser();
       analyser.fftSize = 256; // AJUST THE RESOLUTION OF THE SPECTER 
       const bufferLength = analyser.frequencyBinCount; // NB OF FREQUENCY BANDS
       const dataArray = new Uint8Array(bufferLength); // ARRAY FOR THOSE FREQUENCIES

       // Load IR and Audio
       audioSource.buffer = audioBuffer;
       convolver.buffer = irBuffer;

       // Reduce IR amp with cursor
       const initialIrGain = parseFloat(irAmplitudeSlider.value);
       irGainNode.gain.value = initialIrGain; // Initialiser avec la valeur du curseur

       // Connect the nodes
       audioSource.connect(convolver);
       convolver.connect(irGainNode); // Connect IR to IR Node
       irGainNode.connect(gainNode); // Connect IR Gain Node to Global Gain Node
       gainNode.connect(analyser); //  Connect the Gain node (final one) to the analyser
       analyser.connect(context.destination); //  Final connexion

       // Connexion of audio source to global gain node
       audioSource.connect(gainNode);

       gainNode.gain.value = 0.5; // default setting setat 50 %

       currentSourceNode = audioSource;
       audioSource.start();
       audioSource.onended = () => (currentSourceNode = null);

       // DRAW the visualization after all the setup
       drawVisualizer(analyser, bufferLength, dataArray);

   } catch (error) {
       console.error("Error applying reverb:", error);
   }
}

function drawVisualizer(analyser, bufferLength, dataArray) { /*################## VISUALIZER DRAW ###########################*/
   const canvas = document.getElementById("visualizer");
   if (!canvas) {
       console.error("Canvas element not found!");
       return;
   }
   const canvasCtx = canvas.getContext("2d");


   function draw() { /*################## VISUALIZER DRAW ###########################*/
       requestAnimationFrame(draw);

       analyser.getByteFrequencyData(dataArray); //
       // 
       canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
       // 
       const barWidth = (canvas.width / bufferLength) * 2.5;
       let barHeight;
       let x = 0;
       // 
       const volumeScale = gainNode ? gainNode.gain.value : 1; // 

       for (let i = 0; i < bufferLength; i++) {
           // 
           barHeight = (dataArray[i] / 256) * canvas.height * volumeScale; // 


           // 
           canvasCtx.fillStyle = `rgb(${barHeight + 100}, ${150}, ${0})`;
           canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

           x += barWidth + 1;
       }
   }

   draw(); 
}

function startRecording() { /*################## RECORDING STARTS ###########################*/
   const context = initializeAudioContext();
   const destination = context.createMediaStreamDestination();
   gainNode.connect(destination);


   mediaRecorder = new MediaRecorder(destination.stream);
   recordedChunks.length = 0;


   mediaRecorder.ondataavailable = (event) => {
       if (event.data.size > 0) recordedChunks.push(event.data);
   };


   mediaRecorder.onstop = () => { 
       const blob = new Blob(recordedChunks, { type: "audio/wav" });
       const url = URL.createObjectURL(blob);
       downloadButton.href = url;
       downloadButton.download = "processed_audio.wav";
       downloadButton.style.display = "block";
   };


   mediaRecorder.start();
}


function stopRecording() { /*################## RECORDING STOPS ###########################*/
   if (mediaRecorder && mediaRecorder.state !== "inactive") {
       mediaRecorder.stop();
   }
}


function stopAudio() { /*################## STOP AUDIO BUTTON ###########################*/
   if (currentSourceNode) {
       currentSourceNode.stop();
       currentSourceNode = null;
   }
}


//////////////////////////////////////////////////////////////////////////
// ###################### EVENTS LISTENERS ###############################
//////////////////////////////////////////////////////////////////////////


window.addEventListener("DOMContentLoaded", () => {
   handleAudioSourceChange();
   setupRoomBackgroundChange();
});


localAudioRadio.addEventListener("change", handleAudioSourceChange);
siteAudioRadio.addEventListener("change", handleAudioSourceChange);


roomCategorySelect.addEventListener("change", () => {
   const category = roomCategorySelect.value;
   const rooms = roomData[category];
   roomSelectDiv.style.display = rooms ? "block" : "none";
   specificRoomSelect.innerHTML = rooms
       ? `<option value="">--Choose a Room--</option>` + Object.keys(rooms)
             .map(room => `<option value="${room}">${room}</option>`)
             .join("")
       : "";
});


specificRoomSelect.addEventListener("change", () => {
   const category = roomCategorySelect.value;
   const room = specificRoomSelect.value;
   const irFiles = roomData[category]?.[room];
   irSelectDiv.style.display = irFiles ? "block" : "none";
   irSelect.innerHTML = irFiles
       ? irFiles.map((ir, i) => `<option value="${ir}">IR ${i + 1}</option>`).join("")
       : "";
});


applyReverbButton.addEventListener("click", async () => {
   const audioUrl = localAudioRadio.checked && audioFileInput.files.length
       ? URL.createObjectURL(audioFileInput.files[0])
       : siteAudioSelect.value;
   const irUrl = irSelect.value;

   if (!audioUrl || !irUrl) {
       alert("Please select audio source and impulse response.");
       return;
   }

   await applyReverbAndPlay(audioUrl, irUrl);
   startRecording();
});


stopReverbButton.addEventListener("click", () => {
   stopAudio();
   stopRecording();
});


volumeControl.addEventListener("input", () => {  // ############### use of an logarithmic scale for the volume  -> Acoustic fields properties Wave Amp decreasing (see Course of Fundamentals of Acoustics)
   if (gainNode) {
       const linearValue = parseFloat(volumeControl.value);
       const logarithmicValue = Math.pow(10, (linearValue - 1) * 2);
       gainNode.gain.value = logarithmicValue;
   }
});


const irAmplitudeSlider = document.getElementById("ir-amplitude");
const irAmplitudeValue = document.getElementById("ir-amplitude-value");


irAmplitudeSlider.addEventListener("input", () => {
   const irAmplitude = parseFloat(irAmplitudeSlider.value); // Get cursor value
   irAmplitudeValue.textContent = irAmplitude.toFixed(2); // Update display of cursor value
  
   if (irGainNode) {
       irGainNode.gain.value = irAmplitude; // Update IR Gain values
   }
});


document.addEventListener("DOMContentLoaded", () => { /* ################# HIDE OR MAKE APPEAR ELEMENTS (location map, room map and visualizer#############*/

    const rectangleMap = document.querySelector(".rectangle-map");
    const visualizer = document.getElementById("visualizer");
    const toggleRectangleMapButton = document.getElementById("toggle-rectangle-map");
    const toggleVisualizerButton = document.getElementById("toggle-visualizer");

    const miniMap = document.getElementById("minimap");
    const toggleMiniMapButton = document.getElementById("toggle-location-map");

    // ########################## FUNCTION TO HIDE OR DISPLAY ELEMNTS (location map, room map and visualizer #############
    function toggleElementVisibility(element) {
        if (element.style.display === "none" || !element.style.display) {
            element.style.display = "block"; // Display the elemnt
            if (element.id === "minimap") {
                setTimeout(() => map.invalidateSize(), 200); // Ajust the map after a certain choosen delay
            }
        } else {
            element.style.display = "none"; // Hide the element
        }
    }

    toggleRectangleMapButton.addEventListener("click", () => toggleElementVisibility(rectangleMap)); // ############# TOGGLE BUTTONS TO SWITCH ON OR OFF THOSE ELEMENTS
    toggleVisualizerButton.addEventListener("click", () => toggleElementVisibility(visualizer));
    toggleMiniMapButton.addEventListener("click", () => toggleElementVisibility(miniMap));
});

// TUTORIAL Page //
document.getElementById("tutorial-button").addEventListener("click", () => {
   window.location.href = "tutorial.html";
});


/* ##################### QUICK HELP IMAGE POP-UP #############################*/
// Quick Help Button and Overlay Elements
const quickHelpButton = document.getElementById('quick-help-button');
const quickHelpOverlay = document.getElementById('quick-help-overlay');
const closeQuickHelpButton = document.getElementById('close-quick-help');

// Show the overlay when the button is clicked
quickHelpButton.addEventListener('click', () => {
    quickHelpOverlay.style.display = 'flex';
});

// Hide the overlay when the close button is clicked
closeQuickHelpButton.addEventListener('click', () => {
    quickHelpOverlay.style.display = 'none';
});
