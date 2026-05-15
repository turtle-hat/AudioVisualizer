/**
 * @author Owen Gebhardt <org7993@rit.edu>
 * @description Initializes the app
 */

import * as main from "./main";
import * as burger from "../hamburger"

console.log("window.onload called");
// 1 - do preload here - load fonts, images, additional sounds, etc...

// 2 - start up app
main.init();

// 3 - setup the hamburger menu
burger.setup();
