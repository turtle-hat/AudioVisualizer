/**
 * @author Owen Gebhardt <org7993@rit.edu>
 * @description Initializes the hamburger menu and title of the about page
 */

import * as main from "./main";
import * as burger from "../hamburger"

console.log("window.onload called");

// 1 - start the app
main.init();

// 2 - setup the hamburger menu
burger.setup();
