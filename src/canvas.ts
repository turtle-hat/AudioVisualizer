/**
 * @author Owen Gebhardt <org7993@rit.edu>
 * @description Handles drawing to the canvas
 */

/*
    The purpose of this file is to take in the analyser node and a <canvas> element: 
      - the module will create a drawing context that points at the <canvas> 
      - it will store the reference to the analyser node
      - in draw(), it will loop through the data in the analyser node
      - and then draw something representative on the canvas
      - maybe a better name for this file/module would be *visualizer.js* ?
*/

import * as utils from './utils';
import { StarSprite } from './classes/StarSprite';

interface DrawParams
{
    showGradient: boolean,
    showBars: boolean,
    showNoise: boolean,
    showInvert: boolean,
    showStars: boolean
}

interface Vector2
{
    x: number,
    y: number
}

let ctx: CanvasRenderingContext2D | null,
    canvasWidth: number,
    canvasHeight: number,
    gradient: CanvasGradient,
    analyserNode: AnalyserNode,
    audioData: Uint8Array;

// Toggles frequency vs. wave mode
let isWave: boolean = false;

// Percentage down the screen the horizon should be
let horizon: number = 0.7;
let horizonDist: number;

let starRotSpeed: number = 0.005;
let starRotCenter: Vector2 = { x: 0, y: 0 };
let starRadius: number;

// Stores all sprites
let sprites: StarSprite[] = [];

/**
 * Sets up the canvas and initializes variables
 * @param {HTMLCanvasElement} canvasElement - The canvas DOM element
 * @param {AnalyserNode} analyserNodeRef - The AnalyserNode to stream audio data from
 */
const setupCanvas = (canvasElement: HTMLCanvasElement, analyserNodeRef: AnalyserNode): void =>
{
    // create drawing context
    ctx = canvasElement.getContext("2d");

    if (!ctx) return;

    canvasWidth = canvasElement.width;
    canvasHeight = canvasElement.height;

    starRotCenter.x = canvasWidth / 2;
    starRadius = canvasHeight;

    setHorizon(horizon);

    // keep a reference to the analyser node
    analyserNode = analyserNodeRef;
    // this is the array where the analyser data will be stored
    audioData = new Uint8Array(analyserNode.fftSize / 2);

    // Create stars
    for (let i = 0; i < analyserNode.fftSize; i++)
    {
        sprites.push(new StarSprite(
            // Radius is from the initial rotation center
            utils.getRandom(0, canvasHeight),
            utils.getRandom(Math.PI * 1.25, Math.PI * 1.75),
            utils.getRandom(0.1, 1)
        ));
    }
}

/**
 * Draws visualizer elements based on audio data and user parameters
 * @param {DrawParams} params - The user parameters for drawing different elements
 * @param {boolean} isPlaying - Whether the song/sound is playing
 */
const draw = (params: DrawParams, isPlaying: boolean = false) =>
{
    if (!ctx) return;

    // 1 - populate the audioData array with the frequency data from the analyserNode
    // notice these arrays are passed "by reference" 
    if (isWave)
    {
        analyserNode.getByteTimeDomainData(audioData);  // waveform data
    } else
    {
        analyserNode.getByteFrequencyData(audioData);   // frequency data
    }

    // 2 - draw background
    ctx.save();
    ctx.fillStyle = "black";
    ctx.globalAlpha = 1.0;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.restore();

    // 3 - draw gradient
    if (params.showGradient)
    {
        ctx.save();
        ctx.fillStyle = gradient;
        ctx.globalAlpha = 0.3;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        ctx.restore();
    }

    // Draw stars
    if (params.showStars)
    {
        ctx.save();

        for (let i = 0; i < sprites.length; i++)
        {
            if (isPlaying)
            {
                sprites[i].update(starRotSpeed);
                sprites[i].draw(ctx, audioData[i] / 32, horizonDist, starRotCenter, starRotCenter.y - canvasHeight);
            }
            else
            {
                sprites[i].draw(ctx, 1, horizonDist, starRotCenter, starRotCenter.y - canvasHeight);
            }
        }

        ctx.restore();
    }

    // 4 - draw bars
    if (params.showBars)
    {
        let barSpacing = 4;
        let margin = 5;
        let screenWidthForBars = canvasWidth - (audioData.length * barSpacing) - margin * 2;
        let barWidth = screenWidthForBars / audioData.length;
        let barHeight = 300;
        let topSpacing = 100;

        ctx.save();
        ctx.fillStyle = "rgba(255, 255, 255, 0.50)";
        ctx.strokeStyle = "rgba(0, 0, 0, 0.50)";
        for (let i = 0; i < audioData.length; i++)
        {
            ctx.fillRect(
                margin + i * (barWidth + barSpacing),
                topSpacing + 256 - audioData[i],
                barWidth,
                barHeight
            );
            ctx.strokeRect(
                margin + i * (barWidth + barSpacing),
                topSpacing + 256 - audioData[i],
                barWidth,
                barHeight
            );
        }
        ctx.restore();
    }

    // 6 - bitmap manipulation
    // TODO: right now. we are looping though every pixel of the canvas (320,000 of them!), 
    // regardless of whether or not we are applying a pixel effect
    // At some point, refactor this code so that we are looping though the image data only if
    // it is necessary

    // A) grab all of the pixels on the canvas and put them in the `data` array
    // `imageData.data` is a `Uint8ClampedArray()` typed array that has 1.28 million elements!
    // the variable `data` below is a reference to that array 
    let imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
    let data = imageData.data;
    let length = data.length;
    let width = imageData.width;    // not using here

    // B) Iterate through each pixel, stepping 4 elements at a time (which is the RGBA for 1 pixel)
    for (let i = 0; i < length; i += 4)
    {
        // C) randomly change every 20th pixel to red
        if (params.showNoise && Math.random() < 0.05)
        {
            // data[i] is the red channel
            // data[i+1] is the green channel
            // data[i+2] is the blue channel
            // data[i+3] is the alpha channel
            data[i] = data[i + 1] = data[i + 2] = 0; // zero out the red and green and blue channels
            data[i] = 50; // make the red channel 100% red
            data[i + 1] = 50; // make the red channel 100% red
            data[i + 2] = 50; // make the red channel 100% red
        } // end if
        if (params.showInvert)
        {
            let red = data[i], green = data[i + 1], blue = data[i + 2];
            data[i] = 255 - red;        // set red
            data[i + 1] = 255 - green;  // set green
            data[i + 2] = 255 - blue;   // set blue
            // data[i+3] is the alpha, but we're leaving that alone
        }
    } // end for

    // D) copy image data back to canvas
    ctx.putImageData(imageData, 0, 0);
    // end draw()
}

/**
 * Toggles whether the visualizer displays frequency bands or the waveform
 */
const toggleMode = () =>
{
    isWave = !isWave;
}

/**
 * Sets how far down the screen the horizon is
 * @param {number} percentage - The percentage of the screen taken up by sky (0 to 1)
 */
const setHorizon = (percentage: number) =>
{
    if (!ctx) return;

    horizon = percentage;

    horizonDist = canvasHeight * horizon;
    starRotCenter.y = horizonDist + starRadius;

    // create a gradient that runs top to bottom
    gradient = utils.getLinearGradient(ctx, 0, 0, 0, canvasHeight, [
        { percent: 0, color: "rgb(0, 0, 0)" },
        { percent: horizon / 2, color: "rgb(0, 0, 65)" },
        { percent: horizon - 0.02, color: "rgb(54, 0, 107)" },
        { percent: horizon, color: "rgb(0, 0, 0)" },
        { percent: 1, color: "rgb(60, 100, 60)" },
    ]);
}

/**
 * Sets the distance added to the stars' radius
 * @param {number} distance - The distance in pixels from the center of the stars' orbits
 */
const setRadius = (distance: number) =>
{
    starRadius = distance
    starRotCenter.y = horizonDist + starRadius;
}

export { setupCanvas, draw, toggleMode, setHorizon, setRadius, DrawParams };