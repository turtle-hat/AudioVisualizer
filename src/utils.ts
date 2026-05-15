/**
 * @author Owen Gebhardt <org7993@rit.edu>
 * @description Helper functions for common small tasks
 */

interface ColorStops
{
    percent: number,
    color: string
}

interface JsonDataDefaultsFormat
{
    "checkboxes": {
        "show-gradient": boolean,
        "show-bars": boolean,
        "show-stars": boolean,
        "show-noise": boolean,
        "show-invert": boolean
    },
    "fps": number,
    "start-in-wave-mode": boolean,
    "track": number
}
interface JsonDataFormat
{
    "title": string,
    "tracks-root": string,
    "tracks": {
        "title": string,
        "filename": string
    }[],
    "defaults": JsonDataDefaultsFormat
}

/**
 * Builds an rgba color string from the given values for each channel
 * @param {number} red - The red channel
 * @param {number} green - The green channel
 * @param {number} blue - The blue channel
 * @param {number} alpha=1 - The alpha channel
 * @returns {string} - The string "rgba(red,green,blue,alpha)"
 */
const makeColor = (red: number, green: number, blue: number, alpha: number = 1): string =>
{
    return `rgba(${red},${green},${blue},${alpha})`;
};

/**
 * Gets a random value between the defined minimum and maximum
 * @param {number} min - The minimum value
 * @param {number} max - The maximum value
 * @returns {number} - A random value within [min, max)
 */
const getRandom = (min: number, max: number): number =>
{
    return Math.random() * (max - min) + min;
};

/**
 * Builds a random rgba color string with each rgb channel from 35 to 220
 * @returns {string} - The string "rgba(35-220,35-220,35-220,1);"
 */
const getRandomColor = (): string =>
{
    const floor = 35; // so that colors are not too bright or too dark 
    const getByte = () => getRandom(floor, 255 - floor);
    return makeColor(getByte(), getByte(), getByte());
};

/**
 * Builds a linear gradient to be used as a style for a shape on the given canvas
 * @param {CanvasRenderingContext2D} ctx - The canvas's 2D drawing context
 * @param {number} startX - The X position of the point the gradient starts at
 * @param {number} startY - The Y position of the point the gradient starts at
 * @param {number} endX - The X position of the point the gradient ends at
 * @param {number} endY - The Y position of the point the gradient ends at
 * @param {ColorStops[]} colorStops - An array of Objects, each with a percent and a color. Stops must be ordered with increasing percent
 * @returns {CanvasGradient} - The final gradient object
 */
const getLinearGradient = (ctx: CanvasRenderingContext2D, startX: number, startY: number, endX: number, endY: number, colorStops: ColorStops[]): CanvasGradient =>
{
    let lg = ctx.createLinearGradient(startX, startY, endX, endY);
    for (let stop of colorStops)
    {
        lg.addColorStop(stop.percent, stop.color);
    }
    return lg;
};

/**
 * Sends an XHR to fetch data from a JSON file using the Fetch API.
 * Code taken from my "Scratch Account Backup Tool."
 * @param {string} jsonUrl - The URL to fetch data
 * @returns {Promise<JsonDataFormat>} - A Promise for the requested JSON file
 */
const loadJson = async (jsonUrl: string): Promise<JsonDataFormat> =>
{
    try
    {
        const request = new Request(
            jsonUrl, { method: "GET" }
        );

        return await (await fetch(request)).json();
    }
    catch (error)
    {
        throw error;
    }
}

// https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API
/**
 * Gives a DOM element fullscreen focus with the appropriate API call
 * @param {Element} element - The DOM element to fullscreen
 */
const goFullscreen = (element: Element) =>
{
    if (element.requestFullscreen)
    {
        element.requestFullscreen();
    }
    // .. and do nothing if the method is not supported
};

/**
 * Returns a string with a value and a unit, converted to kilounits where appropriate
 * @param {number} value - The value, in desired base units
 * @param {string} unit - The base unit (e.g. Hz)
 * @returns {string} - The value with unit appended, converted to kilounits if value > 1000
 */
const appendUnit = (value: number, unit: string): string =>
{
    return value >= 1000 ? `${value / 1000}k${unit}` : `${value}${unit}`;
}

export { JsonDataFormat, JsonDataDefaultsFormat, makeColor, getRandomColor, getLinearGradient, loadJson, goFullscreen, appendUnit, getRandom };