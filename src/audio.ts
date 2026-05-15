/**
 * @author Owen Gebhardt <org7993@rit.edu>
 * @description Handles all WebAudio API code
 */

interface Defaults
{
    gain: number,
    numSamples: number
}

// 1 - our WebAudio context, **we will export and make this public at the bottom of the file**
let audioCtx: AudioContext;

// **These are "private" properties - these will NOT be visible outside of this module (i.e. file)**
// 2 - WebAudio nodes that are part of our WebAudio audio routing graph
let element: HTMLAudioElement,
    sourceNode: MediaElementAudioSourceNode,
    lowPassNode: BiquadFilterNode,
    highPassNode: BiquadFilterNode,
    analyserNode: AnalyserNode,
    gainNode: GainNode;

// 3 - here we are faking an enumeration
const DEFAULTS: Defaults = Object.freeze({
    gain: 0.5,
    numSamples: 128
});

// 4 - create a new array of 8-bit integers (0-255)
// this is a typed array to hold the audio frequency data
let audioData: Uint8Array = new Uint8Array(DEFAULTS.numSamples / 2);

// **Next are "public" methods - we are going to export all of these at the bottom of this file**
/**
 * Sets up WebAudio API with a SourceNode, AnalyserNode, and GainNode
 * @param {string} filePath - The path to the sound file to play
 */
const setupWebaudio = (filePath: string): void =>
{
    // 1 - The || is because WebAudio has not been standardized across browsers yet
    const AudioContext = window.AudioContext;
    audioCtx = new AudioContext();

    // 2 - this creates an <audio> element
    element = new Audio();  // document.querySelector("audio");

    // 3 - have it point at a sound file
    loadSoundFile(filePath);

    // 4 - create an a source node that points at the <audio> element
    sourceNode = audioCtx.createMediaElementSource(element);

    // 5 - create an analyser node
    analyserNode = audioCtx.createAnalyser();   // note the UK spelling of "Analyser"

    /*
    // 6
    We will request DEFAULTS.numSamples number of samples or "bins" spaced equally 
    across the sound spectrum.
    
    If DEFAULTS.numSamples (fftSize) is 256, then the first bin is 0 Hz, the second is 172 Hz, 
    the third is 344Hz, and so on. Each bin contains a number between 0-255 representing 
    the amplitude of that frequency.
    */

    // fft stands for Fast Fourier Transform
    analyserNode.fftSize = DEFAULTS.numSamples;

    // 7 - create a gain (volume) node
    gainNode = audioCtx.createGain();
    gainNode.gain.value = DEFAULTS.gain;

    // EQ node 1 - lowpass
    lowPassNode = audioCtx.createBiquadFilter();
    lowPassNode.type = "lowpass";
    lowPassNode.frequency.setValueAtTime(20000, audioCtx.currentTime);

    // EQ node 2 - highpass
    highPassNode = audioCtx.createBiquadFilter();
    highPassNode.type = "highpass";
    highPassNode.frequency.setValueAtTime(0, audioCtx.currentTime);

    // 8 - connect the nodes - we now have an audio graph
    sourceNode.connect(lowPassNode);
    lowPassNode.connect(highPassNode);
    highPassNode.connect(analyserNode);
    analyserNode.connect(gainNode);
    gainNode.connect(audioCtx.destination);
}

/**
 * Loads a new sound file
 * @param {string} filePath - The path to the sound file to load
 */
const loadSoundFile = (filePath: string): void =>
{
    element.src = filePath;
}

/**
 * Plays the currently set sound file
 */
const playCurrentSound = (): void =>
{
    element.play();
}

/**
 * Pauses the currently set sound file
 */
const pauseCurrentSound = (): void =>
{
    element.pause();
}

/**
 * Sets the volume of sound playback
 * @param {number} value - The volume value, from 0-2
 */
const setVolume = (value: number): void =>
{
    gainNode.gain.value = value;
}

/**
 * Sets the frequency of the low-pass filter
 * @param {number} value - The frequency from 0-20000Hz
 */
const setLowPass = (value: number): void =>
{
    lowPassNode.frequency.setValueAtTime(Number(value), audioCtx.currentTime);
}

/**
 * Sets the frequency of the high-pass filter
 * @param {number} value - The frequency from 0-20000Hz
 */
const setHighPass = (value: number): void =>
{
    highPassNode.frequency.setValueAtTime(Number(value), audioCtx.currentTime);
}

/**
 * Sets a desired callback function to be called when audio ends
 * @param {(e: Event) => void} callback - The function to call when audio ends
 */
const setSoundEndBehavior = (callback: (e: Event) => void): void =>
{
    element.onended = callback;
}

export { audioCtx, setupWebaudio, playCurrentSound, pauseCurrentSound, loadSoundFile, setVolume, setLowPass, setHighPass, analyserNode, setSoundEndBehavior };
