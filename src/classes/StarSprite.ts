// Stores information about an individual star to be rendered in the audio visualizer
class StarSprite {

    radius : number;
    angle : number;
    size : number;
    x : number;
    y : number;

    /**
     * Constructs a new StarSprite
     * @param {number} radius - The relative radius this StarSprite is at on the screen, from 0 to canvasHeight
     * @param {number} angle - The current angle this StarSprite is at, in radians (from 5/4π to 7/4π)
     * @param {number} size - The star's radius multiplier
     * @returns {Object} - The final StarSprite object
     */
    constructor(radius, angle, size) {
        this.radius = radius;
        this.angle = angle;
        this.size = size;
    }

    update = (rotationSpeed) => {
        this.angle += rotationSpeed;

        // If rotated too far, move back
        if (this.angle > Math.PI * 1.75) {
            this.angle -= Math.PI * 0.5;
        }
    }

    /**
     * Draws the star to the canvas (does not save and restore drawing context)
     * @param {Object} ctx - The canvas's 2D drawing context
     * @param {number} soundLevel - How loud the sound is for this star
     * @param {number} horizonDist - How high the horizon is, for lowering stars' alpha the closer they are to it
     * @param {Object} rotationCenter - The point in canvas space the star rotates around (Object with an X and Y component)
     * @param {number} addedRadius - The radius added to this star's relative radius; the radius a point at canvasHeight would have relative to rotationCenter
     */
    draw = (ctx, soundLevel, horizonDist, rotationCenter, addedRadius) => {
        // Solve for x and y
        this.calculateXY(rotationCenter, addedRadius);

        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max((horizonDist - this.y) / horizonDist, 0)})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * soundLevel, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }

    /**
     * Calculates the X and Y of the star on the screen from its polar coordinates
     * @param {Object} rotationCenter - The point in canvas space the star rotates around (Object with an X and Y component)
     * @param {number} addedRadius - The radius added to this star's relative radius; the radius a point at canvasHeight would have relative to rotationCenter
     */
    calculateXY = (rotationCenter, addedRadius) => {
        this.x = (this.radius + addedRadius) * Math.cos(this.angle) + rotationCenter.x;
        this.y = (this.radius + addedRadius) * Math.sin(this.angle) + rotationCenter.y;
    }
}

export { StarSprite };
