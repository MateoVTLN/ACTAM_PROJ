      ::::::::  ::::    :::          :::::::: ::::::::::: :::      ::::::::  :::::::::: ::: ::::::::: 
    :+:    :+: :+:+:   :+:         :+:    :+:    :+:   :+: :+:   :+:    :+: :+:        :+  :+:    :+: 
   +:+    +:+ :+:+:+  +:+         +:+           +:+  +:+   +:+  +:+        +:+            +:+    +:+  
  +#+    +:+ +#+ +:+ +#+         +#++:++#++    +#+ +#++:++#++: :#:        +#++:++#       +#+    +:+   
 +#+    +#+ +#+  +#+#+#                +#+    +#+ +#+     +#+ +#+   +#+# +#+            +#+    +#+    
#+#    #+# #+#   #+#+#         #+#    #+#    #+# #+#     #+# #+#    #+# #+#            #+#    #+#     
########  ###    ####          ########     ### ###     ###  ########  ##########     #########       

WEB PAGE : https://mateovtln.github.io/ACTAM_PROJ/

    Welcome on the Github Repository of the ON Stage'd Web Audio App made for the A.C.T.A.M class project of Politecnico di Milano.
This project was made by Sebastian GOMEZ and Matéo VITALONE and under the supervision of Mr F.Bruschi, Mr V.Rana and Mr M.Esposito.

_______________________________________________
This README File will be structured as follows:
    - Context of the project
    - Operating instructions.
    - Repository Structure
    - Copyrights
    - Contact information
_______________________________________________

----CONTEXT : 
"Convolution is a mathematical operation that combines two functions to describe the overlap between them. Convolution takes two functions and “slides” one of them over the other, multiplying the function values at each point where they overlap, and adding up the products to create a new function." [from : https://www.mathworks.com/discovery/convolution.html#:~:text=Convolution%20is%20a%20mathematical%20operation,to%20create%20a%20new%20function.]
In audio softwares, convolution is weel known to be used in reverb simultors. Taking in argument the audio on which we want to apply the reverb and an impulse response, the convolution enables to add the ambient of any room or medium on the audio sample selected.
No online Web Audio App can be found on the internet to do such operations, so both of us authors had the idea to create one.
For that we used a very well detailed study made by Ms FARINA from the Parma's University in which we used the library of Impulse Responses (\Waves_Complete_IR_Library.zip\Sampled Acoustics V2). Then, with the help of some Java Scripts Audio API, we tried to use some of the many given Impulse Responses to create an Web Audio App that allows the user to choose a local or available audio and a room to convolve and get a final downloadable audio in which the ambient of the room has been added. With that, we also tried to add some Audio and graphical features such as an "Effect" potentiometer , a map of the room drawn with the indications given in the PDF of the sudy and a world map in which we can locate where is the room used to recreate the ambient.

----OPERATING INSTRUCTIONS:

#Get more help using the "TUTORIAL PAGE" and "QUICK HELP" buttons.

-Select an audio source: Use one of the two first buttons to choose between an available audio or your own audio.
-Choose a room: Select a room category from Auditoriums, Amphitheatres, Arenas, Churches, Home Rooms and others.
-Select a specific room Select one of the rooms available inside that category.
-Select an Impulse Response Location For certain rooms, multiple locations of Impulse response recordings are available, you can choose of of them or just let the default one. To get a representation of the location open the Room Map (see Toggles point 1).
-Apply reverb and hear : Click the "PLAY" button to hear the effect and start the recording.
-Stop audio: Use the "STOP / SAVE" button to stop playback at any time. Make sure to stop the audio before launching another process.
-Adjust the settings: Use the sliders and controls to set the reverb intensity and the volume.
-Download the processed audio: After clicking on "STOP / SAVE" the recording should be available at download throught a pop-pup "DOWNLOAD" button.
Toggles For Options ( VISUALIZER / ROOM MAP / LOCATION MAP):
-Room Map : Reveal the map of the room and Impulse response measure points by clicking on the Room Map toggle button. Click on it again to switch it off.
-Visualizer : To view the band visualizer click on the Visualizer toggle button. Click on it again to switch it off.
-Location Map : To view the location of the room click on the Location Map toggle button. You can interact with the map (zoom, unzoom, drag) to wonder around the space. Click on the toggle button again to switch it off.

----REPOSITORY STRUCTURE:

-assets
    -audio_samples
        - (...)
    -img
        - (...)
    -ir_files
        - (...)

-lib
    -fft.js

-python
    -info_extractor.py # was used locally to extract the size, format and other meta datas about audio files "
    - WIR2WAV.py # USED LOCALLY TO CONVERT .WIR Files into .WAV (Impulse Responses) #

-index.html

-Links ACTAM PROJECT.txt (Copyrights Links)

-README.md # (You are here) #

-script.js

-styles.css

tutorial.html # (tutorial page html) #


----COPYRIGHTS :

All material sources used to create this project can be consulted in the Links ACTAM PROJECT.txt  file.

---- BUGS / REMARKS :

Even compressed, some pictures or audio files don't load up quickly. If after 10 seconds the background is still white (after selecting a room) or if not a sound is played (after pressing apply reverb and play), reload the page and retry.

----CONTACTS :

    - Matéo VITALONE : mateovtln@gmail.com //
    - Sebastian GOMEZ : //