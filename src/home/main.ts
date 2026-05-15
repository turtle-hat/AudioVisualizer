/**
 * @overview Homework 2 - Audio Visualizer: Ultimate Version
 * @author Owen Gebhardt <org7993@rit.edu>
 * @description Handles user-facing parts of the app and calls functions to execute app functionality
 */

/*
    main.js is primarily responsible for hooking up the UI to the rest of the application 
    and setting up the main event loop
*/

// We will write the functions in this file in the traditional ES5 way
// In this instance, we feel the code is more readable if written this way
// If you want to re-write these as ES6 arrow functions, to be consistent with the other files, go ahead!

import * as utils from '../utils';
import * as audio from '../audio';
import * as canvas from '../canvas';

// Filepath to JSON data file
const jsonUrl: string = "data/av-data.json";

// Object containing all user parameters set from the UI
const drawParams: canvas.DrawParams = {
    showGradient: true,
    showBars: true,
    showNoise: false,
    showInvert: false,
    showStars: true,
};

let defaults: utils.JsonDataDefaultsFormat;
let defaultTrackPath: string;

// Whether or not the app is playing
let isPlaying = false;

/**
 * Initializes the page
 */
const init = (): void =>
{
    console.log("init called");
    console.log(`Testing utils.getRandomColor() import: ${utils.getRandomColor()}`);

    // Load JSON
    utils.loadJson(jsonUrl)
        // Once loaded, parse it
        .then((json: utils.JsonDataFormat) => { parseJson(json); })
        // Once parsed, continue with setting up the audio and the rest of the UI
        .then(() =>
        {
            audio.setupWebaudio(defaultTrackPath);

            let canvasElement = document.querySelector("canvas"); // hookup <canvas> element
            canvas.setupCanvas(canvasElement, audio.analyserNode);
            setupUI(canvasElement);

            loop();
        })
        .catch((error: Error) =>
        {
            console.error(error);
        });
}

/**
 * Parses JSON file based on expected format of data file.
 * @param {utils.JsonDataFormat} json - The JSON object read from a data file.
 */
const parseJson = async (json: utils.JsonDataFormat): Promise<void> =>
{
    try
    {
        // Update page title
        (document.querySelector("#page-title") as HTMLTitleElement).innerText = json["title"];
        (document.querySelector("#page-header") as HTMLHeadingElement).innerText = json["title"];

        defaults = json["defaults"];

        // Update track selector
        const trackSelect = document.querySelector("#track-select");
        const trackRoot = json["tracks-root"];
        // Add tracks
        for (let i = 0; i < json["tracks"].length; i++)
        {
            const trackData = json["tracks"][i];

            // Create new track with filename and title
            let newTrack: HTMLOptionElement = document.createElement("option");
            let filepath: string = `${trackRoot}/${trackData["filename"]}`
            newTrack.value = filepath;
            newTrack.text = trackData["title"];
            // Select it by default if this track was marked as the default
            if (i == defaults["track"])
            {
                newTrack.selected = true;
                defaultTrackPath = filepath;
            }

            // Add to list in DOM
            trackSelect.appendChild(newTrack);
        }

        // Freeze list of defaults
        Object.freeze(defaults);
    } catch (error)
    {
        throw error;
    }
}

/**
 * Sets event handlers for all UI elements and initializes their values
 * @param {Object} canvasElement - The canvas element to draw the visualizer to
 */
const setupUI = (canvasElement: HTMLCanvasElement): void =>
{
    // A - hookup fullscreen button
    const fsButton = document.querySelector("#btn-fs") as HTMLButtonElement;
    const playButton = document.querySelector("#btn-play") as HTMLButtonElement;

    // add .onclick event to button
    fsButton.onclick = (e: Event) =>
    {
        console.log("goFullscreen() called");
        utils.goFullscreen(canvasElement);
    };

    playButton.onclick = (e: Event) =>
    {
        const target = e.target as HTMLButtonElement;

        console.log(`audio.state before = ${audio.audioCtx.state}`);

        if (audio.audioCtx.state == "suspended")
        {
            audio.audioCtx.resume();
        }
        console.log(`audio.state after = ${audio.audioCtx.state}`);
        if (target.dataset.playing == "no")
        {
            // if track is currently paused, play it
            audio.playCurrentSound();
            target.dataset.playing = "yes";   // our CSS will set the text to "Pause"
            isPlaying = true;
            // If track IS playing, pause it
        } else
        {
            audio.pauseCurrentSound();
            target.dataset.playing = "no";    // our CSS will set the text to "Play"
            isPlaying = false;
        }
    };

    // Attach function that resets play button via event handler 
    audio.setSoundEndBehavior((e: Event) =>
    {
        playButton.dataset.playing = "no";
        isPlaying = false;
    });


    // C - hookup volume slider & label
    let volumeSlider = document.querySelector("#volume-slider") as HTMLInputElement;
    let volumeLabel = document.querySelector("#volume-label") as HTMLSpanElement;

    // add .oninput event to slider
    volumeSlider.oninput = (e: Event) =>
    {
        const target = e.target as HTMLInputElement;
        // set the gain
        audio.setVolume(Number(target.value));
        // update value of label to match value of slider
        volumeLabel.innerHTML = String(Math.round((Number(target.value) / 2 * 100)));
    };

    // set value of label to match initial value of slider
    volumeSlider.dispatchEvent(new Event("input"));

    // D - hookup track <select>
    let trackSelect = document.querySelector("#track-select") as HTMLSelectElement;
    // add .onchange event to <select>
    trackSelect.onchange = (e: Event) =>
    {
        const target = e.target as HTMLSelectElement;

        audio.loadSoundFile(target.value);
        // pause the current track if it is playing
        if (playButton.dataset.playing == "yes")
        {
            playButton.dispatchEvent(new MouseEvent("click"));
        }
    };

    // set track to match current value of <select>
    trackSelect.dispatchEvent(new Event("change"));

    // Setup checkboxes
    let gradientCB = document.querySelector("#cb-gradient") as HTMLInputElement;
    let barsCB = document.querySelector("#cb-bars") as HTMLInputElement;
    let starsCB = document.querySelector("#cb-stars") as HTMLInputElement;
    let noiseCB = document.querySelector("#cb-noise") as HTMLInputElement;
    let invertCB = document.querySelector("#cb-invert") as HTMLInputElement;

    gradientCB.onchange = (e: Event) =>
    {
        drawParams.showGradient = (e.target as HTMLInputElement).checked;
    }

    barsCB.onchange = (e: Event) =>
    {
        drawParams.showBars = (e.target as HTMLInputElement).checked;
    }

    starsCB.onchange = (e: Event) =>
    {
        drawParams.showStars = (e.target as HTMLInputElement).checked;
    }

    noiseCB.onchange = (e: Event) =>
    {
        drawParams.showNoise = (e.target as HTMLInputElement).checked;
    }

    invertCB.onchange = (e: Event) =>
    {
        drawParams.showInvert = (e.target as HTMLInputElement).checked;
    }

    gradientCB.checked = defaults["checkboxes"]["show-gradient"];
    barsCB.checked = defaults["checkboxes"]["show-bars"];
    starsCB.checked = defaults["checkboxes"]["show-stars"];
    noiseCB.checked = defaults["checkboxes"]["show-noise"];
    invertCB.checked = defaults["checkboxes"]["show-invert"];

    gradientCB.dispatchEvent(new Event("change"));
    barsCB.dispatchEvent(new Event("change"));
    starsCB.dispatchEvent(new Event("change"));
    noiseCB.dispatchEvent(new Event("change"));
    invertCB.dispatchEvent(new Event("change"));

    // Hookup mode selector
    const modeFrequency = document.querySelector("#radio-mode-freq") as HTMLInputElement;
    const modeWaveform = document.querySelector("#radio-mode-wave") as HTMLInputElement;

    modeFrequency.onchange = canvas.toggleMode;
    modeWaveform.onchange = canvas.toggleMode;

    if (defaults["start-in-wave-mode"])
    {
        modeFrequency.checked = false;
        modeWaveform.checked = true;
        canvas.toggleMode();
    }
    else
    {
        modeWaveform.checked = false;
        modeFrequency.checked = true;
    }

    // Hookup visualization sliders
    const horizonSlider = document.querySelector("#horizon-slider") as HTMLInputElement;
    const horizonLabel = document.querySelector("#horizon-label") as HTMLLabelElement;

    horizonSlider.oninput = (e: Event) =>
    {
        const target = e.target as HTMLInputElement;

        let finalVal = (100 - Number(target.value)) / 100;
        canvas.setHorizon(finalVal);
        horizonLabel.innerHTML = `${target.value}%`;
    }

    horizonSlider.dispatchEvent(new Event("input"));

    const radiusSlider = document.querySelector("#radius-slider") as HTMLInputElement;
    const radiusLabel = document.querySelector("#radius-label") as HTMLLabelElement;

    radiusSlider.oninput = (e: Event) =>
    {
        const target = e.target as HTMLInputElement;

        let finalVal = Number(target.value);
        canvas.setRadius(finalVal);
        radiusLabel.innerHTML = `${target.value}`;
    }

    radiusSlider.dispatchEvent(new Event("input"));

    // Hookup EQ sliders
    const lowPassSlider = document.querySelector("#lowpass-slider") as HTMLInputElement;
    const lowPassLabel = document.querySelector("#lowpass-label") as HTMLLabelElement;

    lowPassSlider.oninput = (e: Event) =>
    {
        const target = e.target as HTMLInputElement;

        // Set to 20Hz (human hearing threshhold) if the slider is 0
        let finalVal = Number(target.value) || 20;
        // set the frequency
        audio.setLowPass(finalVal);
        // update value of label to match value of slider
        lowPassLabel.innerHTML = utils.appendUnit(finalVal, "Hz");
    };

    // set value of label to match initial value of slider
    lowPassSlider.dispatchEvent(new Event("input"));

    const highPassSlider = document.querySelector("#highpass-slider") as HTMLInputElement;
    const highPassLabel = document.querySelector("#highpass-label") as HTMLLabelElement;

    highPassSlider.oninput = (e: Event) =>
    {
        const target = e.target as HTMLInputElement;

        let finalVal = Number(target.max) - Number(target.value);
        // set the Q value
        audio.setHighPass(finalVal);
        // update value of label to match value of slider
        highPassLabel.innerHTML = utils.appendUnit(finalVal, "Hz");
    };

    highPassSlider.dispatchEvent(new Event("input"));

} // end setupUI

/**
 * Runs the visualizer's draw loop
 */
const loop = (): void =>
{
    setTimeout(loop, 1000 / defaults["fps"]);

    canvas.draw(drawParams, isPlaying);
}

export { init };