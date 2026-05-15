/**
 * Finds and sets up the burger menu on the page
 */
const setup = (): void => {
    // mobile menu
    const burgerIcon = document.querySelector("#burger") as HTMLButtonElement;
    const navbarMenu = document.querySelector("#nav-links") as HTMLButtonElement;
    
    burgerIcon.onclick = () => {
        navbarMenu.classList.toggle('is-active');
    };
}

export {setup};