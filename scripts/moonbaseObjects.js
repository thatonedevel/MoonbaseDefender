/*
MoonbaseDefender - An open source Tower-Defence game made using Phaser 3 (https://www.phaser.io/)
Copyright (C) 2025 Nora Dwelly

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>
*/

function checkDistBetweenGameObjects(objA, objB)
{
    /**
     * @param {Phaser.GameObjects.GameObject} objA
     * @param {Phaser.GameObjects.GameObject} objB
     * @returns {number}
     */
    // checks the distance between two phaser gameobjects
    let xDist = objA.x - objB.x;
    let yDist = objA.y - objB.y;

    return Math.sqrt(xDist**2 + yDist**2);
}

class BaseObject extends Phaser.GameObjects.Sprite
{
    constructor(scene, texture, xPos, yPos)
    {
        super(scene, xPos, yPos, texture)
        this.boardX = -1;
        this.boardY = -1;
        this.health = 100;
        this.defense = 0;
        this.damage = 5;
        this.cooldown = 5;
        this.__cooldownStartTime = 0; // using __ prefix as ES6 does not have protected properties
        scene.add.existing(this);
    }

    update()
    {

    }

    changeHealth(amt) 
    {
        this.health += amt;        
    }
}

class BuildableGhost extends BaseObject
{
    constructor(scene, texture, xPos, yPos)
    {
        super(scene, texture, xPos, yPos);
        // set transparency to 50%
        this.setAlpha(0.5);
        this.setScale(0.5, 0.5);
        this.setActive(false);
        this.setVisible(false);
    }

    enable(name)
    {
        this.setActive(true);
        this.setVisible(true);
        this.setTexture(name);
        console.log("Ghost enabled with name", name);
    }

    update()
    {
        //let nearestTile = null;
        // set position to nearest grid tile
        if (this.active && this.visible)
        {
            // get closest position to mouse that is multiple of 32
            // use modulo (remainder) to determine offset
            let offsetX = MoonbaseInput.mouse.worldX % 64;
            let offsetY = MoonbaseInput.mouse.worldY % 64;
            this.x = Phaser.Math.Clamp((MoonbaseInput.mouse.worldX - offsetX) + 32, 32, 64*16);
            this.y = Phaser.Math.Clamp((MoonbaseInput.mouse.worldY - offsetY) + 32, 32, 64*16);
        }
    }

    createBuildable()
    {
        if (this.active && this.visible)
        {
            newStructure = BuildablesFactory.createNewBuildable(this.texture);
            
        }
    }
}

class EnergyUnit extends BaseObject
{
    #movingToBank = false;
    #speed = 5;
    constructor(scene, texture, xPos, yPos)
    {
        super(scene, texture, xPos, yPos);
        this.on("pointerdown", this.#moveToBank);
    }

    update()
    {
        if (this.#movingToBank && this.active)
        {
            // calculate vector from here to "bank" (top right of game area)
            if (gameObjectsCollection.energyReadout === null) return;
            
            let distVector = Phaser.Math.Vector2(gameObjectsCollection.energyReadout.x - this.x, 
                gameObjectsCollection.energyReadout.y - this.y);

            // determine movement as 5 * unit vec
            let mov =  distVector/distVector.length() * this.#speed * gameData.deltaTime;
            
            if (mov.length() < 20)
            {
                // close to bank, count it
                this.setVisible(false);
                this.setActive(false);
                gameData.energyStored += 50;
            }
            else
            {
                this.x += mov.x;
                this.y += mov.y;
            }
        }
    }

    #moveToBank()
    {
        this.#movingToBank = true;
    }
}

class Buildable extends BaseObject
{
    static cost = 0;
    constructor(scene, texture, xPos, yPos)
    {
        super(scene, texture, xPos, yPos);
        // tile row
        gameObjectsCollection.board[yPos / 32][xPos / 32].occupant = this;
    }
}

class SolarPanel extends Buildable
{
    static cost = 25;
    constructor(scene, texture, xPos, yPos)
    {
        super(scene, texture, xPos, yPos)
        // create solar panel
        // find the tile at current position
        this.damage = 0;
        this.cooldown = 10;
        this.setActive(true);
        this.setVisible(true);
    }

    update()
    {
        if (Date.now() - this.__cooldownStartTime >= this.cooldown)
        {
            // create energy unit
        }
    }
}

class BasicTurret extends Buildable
{
    static cost = 75;
}

class ShieldGenerator extends Buildable
{
    static cost = 50;
}

class HoloFence extends Buildable
{
    static cost = 50;
    constructor(scene, texture, xPos, yPos, direction)
    {
        super(scene, texture, xPos, yPos);
        this.setOrigin(0.25, 0.5);

        switch (direction)
        {
            case COMPASS_HEADINGS.NORTH:
                this.setAngle(270);
                break;
            case COMPASS_HEADINGS.SOUTH:
                this.setAngle(90);
                break;
            case COMPASS_HEADINGS.EAST:
                this.setAngle(0);
                break;
            case COMPASS_HEADINGS.WEST:
                this.setAngle(180);
                break;
        }
    }

    checkCollisions(enemy)
    {
        // checks for enemies passing through the fence
    }
}

class BasicEnemy extends BaseObject
{
    constructor()
    {
        
    }
}

class BasicProjectile extends BaseObject
{
    constructor(originX, originY)
    {

    }
}

class BuildablesFactory
{
    static __BuildablesObj = 
    {
        solarPanel: SolarPanel,
        basicTurret: BasicTurret,
        shieldGenerator: ShieldGenerator
    };

    static createNewBuildable(scene, name, xPos, yPos)
    {
        // create a buildable object specified by name
        return this.__BuildablesObj[name](scene, name, xPos, yPos);
    }

    static getBuildableCost(name)
    {
        return this.__BuildablesObj[name].cost;
    }
}