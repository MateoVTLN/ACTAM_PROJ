# -*- coding: utf-8 -*-
"""
Created on Wed Nov 20 19:07:15 2024

@author: Matéo
"""

import wave
import numpy as np
#from scipy.signal import resample
from scipy.fft import fft, ifft
from scipy.io.wavfile import write


#INFO EXTRACTOR
def extract_wav_info(file_path):
    try:
        with wave.open(file_path, 'rb') as wav_file:
            channels = wav_file.getnchannels()
            sample_rate = wav_file.getframerate()
            sample_width = wav_file.getsampwidth()
            n_frames = wav_file.getnframes()
            duration = n_frames / sample_rate

            print(f"File: {file_path}")
            print(f"Number of Channels: {channels}")
            print(f"Sample Rate: {sample_rate} Hz")
            print(f"Sample Width: {sample_width * 8} bits")
            print(f"Total Frames: {n_frames}")
            print(f"Duration: {duration:.2f} seconds")
    except wave.Error as e:
        print(f"Error reading WAV file: {e}")
    except FileNotFoundError:
        print("File not found!")

extract_wav_info("thechainsolo.wav")

"""
#DOWNSAMPLER TO 44100

# USE online  at : https://onlineaudioconverter.com/#
# USE SETTINGS : WAV / Default / Mono / 44.1 kHz
"""

#CONVOLVER

def load_wav(file_path):
    #Load a WAV file and return the sample rate and audio data.#
    with wave.open(file_path, 'rb') as wav_file:
        sample_rate = wav_file.getframerate()
        n_frames = wav_file.getnframes()
        n_channels = wav_file.getnchannels()
        audio_data = np.frombuffer(wav_file.readframes(n_frames), dtype=np.int32)  # Loading 32-bit PCM
        if n_channels > 1:
            audio_data = audio_data.reshape(-1, n_channels)[:, 0]  # Use only the first channel
        return sample_rate, audio_data

def save_wav(file_path, sample_rate, audio_data):
    #Save audio data to a WAV file#
    # Normalize to int32 PCM
    audio_data = np.int32(audio_data / np.max(np.abs(audio_data)) * 2147483647)  # Normalize to int32
    write(file_path, sample_rate, audio_data)

def process_wavs(file_x, file_y, output_file):
    #Perform FFT, multiply spectra, IFFT, and save the result#
    # Load the WAV files
    sr_x, x = load_wav(file_x)
    sr_y, y = load_wav(file_y)
    
    # Ensure both files have the same sample rate
    if sr_x != sr_y:
        raise ValueError("Sample rates of the two WAV files must match.")
    
    # Align lengths by zero-padding the shorter signal
    max_length = max(len(x), len(y))
    x = np.pad(x, (0, max_length - len(x)), mode='constant')
    y = np.pad(y, (0, max_length - len(y)), mode='constant')
    
    # Perform FFT
    X_f = fft(x)
    Y_f = fft(y)
    
    # Multiply the spectra
    Z_f = X_f * Y_f
    
    # Perform IFFT
    z_t = ifft(Z_f).real  # Take the real part to get time-domain signal
    
    # Ensure that the result matches the original length
    z_t = z_t[:len(x)]  # Truncate to the original length of x or y
    
    # Save the result to a new WAV file
    save_wav(output_file, sr_x, z_t)
    print(f"Processed WAV file saved to: {output_file}")

#"SOH Concert Hall_SBg2v2_32b_aio.wav"
classi =  "classical.wav"

process_wavs(classi ,"SOH_441_16b.wav" , "out_classi_SOH.wav")
