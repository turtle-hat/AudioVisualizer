/**
 * @overview Homework 2 - Audio Visualizer: Ultimate Version
 * @author Owen Gebhardt <org7993@rit.edu>
 * @description Handles JSON loading for the About page
 */

import * as utils from '../utils';

// Filepath to JSON data file
const jsonUrl: string = "data/av-data.json";

/**
 * Initializes the page
 */
const init = (): void =>
{
    // Load JSON
    utils.loadJson(jsonUrl)
        // Once loaded, parse it
        .then((json: utils.JsonDataFormat) => { parseJson(json); })
        .catch((error: Error) =>
        {
            console.error(error);
        });
}

/**
 * Parses JSON file based on expected format of data file.
 * @param {JsonDataFormat} json - The JSON object read from a data file.
 */
const parseJson = async (json: utils.JsonDataFormat): Promise<void> =>
{
    // Update page title
    (document.querySelector("#page-title") as HTMLTitleElement).innerText = `About ${json["title"]}`;
    (document.querySelector("#page-header") as HTMLHeadingElement).innerText = json["title"];
}

export { init };