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

function clamp(min, max, num)
{
    res = num;
    if (res > max)
        res = max;
    else if (res < min)
        res = min;

    return res;
}

class Vec2
{
    constructor(x, y)
    {
        this.x = x;
        this.y = y;
    }

    magnitude()
    {
        return Math.sqrt(this.x**2 + this.y**2);
    }

    normalised()
    {
        let newX = x / this.magnitude();
        let newY = y / this.magnitude();

        return new Vec2(newX, newY);
    }

    // arithmetic
    add(op)
    {
        this.x += op.x;
        this.y += op.y;
    }

    sub(op)
    {
        this.x -= op.x;
        this.y -= op.y;
    }

    scalarMult(scalarVal)
    {
        this.x *= scalarVal;
        this.y *= scalarVal;
    }

    scalarDiv(scalarVal)
    {
        this.x /= scalarVal;
        this.y /= scalarVal;
    }

    static lerp(a, b, t)
    {
        let trans = b.sub(a);
        let transUnit = trans.scalarMult(t);
        let res = new Vec2(a.x, a.y);
        res.add(transUnit);
        return res;
    }


}

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

class BaseObject extends Sprite
{
    constructor(scene, texture, xPos, yPos)
    {
        super(scene, xPos, yPos, texture);
        this.boardX = -1;
        this.boardY = -1;
        this.health = 100;
        this.defense = 0;
        this.damage = 5;
        this.cooldown = 5;
        this.__cooldownStartTime = 0; // using __ prefix as ES6 does not have protected properties
        this.setScale(0.5, 0.5);
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
    #mouseDownOnPreviousFrame = false;
    #buildableName = "";
    constructor(scene, texture, xPos, yPos)
    {
        super(scene, texture, xPos, yPos);
        // set transparency to 50%
        this.setAlpha(0.5);
        this.setScale(0.5, 0.5);
        this.setActive(false);
        this.setVisible(false);
        //this.on(Phaser.Input.Events.POINTER_DOWN, this.createBuildable);
    }

    enable(name)
    {
        this.setActive(true);
        this.setVisible(true);
        this.setTexture(name);
        console.log("Ghost enabled with name", name);
        this.#buildableName = name;
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
            this.y = Phaser.Math.Clamp((MoonbaseInput.mouse.worldY - offsetY) + 32, 32, 64*9);

            // check for input
            if (this.#mouseDownOnPreviousFrame)
            {
                // create the buildable
                this.#mouseDownOnPreviousFrame = false;
                this.createBuildable();
            }
            if (MoonbaseInput.mouse.leftButtonDown())
            {
                this.#mouseDownOnPreviousFrame = true;
            }
        }
    }

    createBuildable()
    {
        console.log("TESTING");
        if (this.active && this.visible)
        {
            console.log("Buildable requested");
            let row = Math.floor((this.y / 32) - 1);
            let col = Math.floor((this.x / 32) - 1);

            console.log("Buildable row:", row, "Buildable column:", col);
            console.log("Rows available:", gameObjectsCollection.board.length);
            console.log("Columns available:", gameObjectsCollection.board[0].length);

            if (gameObjectsCollection.board.length > row)
            {
                if (gameObjectsCollection.board[row].length > col)
                {
                    if (gameObjectsCollection.board[row][col].occupant === null)
                    {
                        console.log("Placing builable");
                        let newStructure = BuildablesFactory.createNewBuildable(this.scene, this.#buildableName, this.x, this.y);
                        gameObjectsCollection.turrets.push(newStructure);
                        // set the occupant of the tile to the new turret
                        gameObjectsCollection.board[row][col].occupant = newStructure;

                        // disable self
                        this.setVisible(false);
                        this.setActive(false);

                        // deduct cost from energy bank
                        gameData.energyStored -= BuildablesFactory.getBuildableCost(this.#buildableName);
                    }
                }
            }
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
        this.setInteractive();
        this.on("pointerdown", this.#moveToBank);
    }

    update()
    {
        if (this.#movingToBank && this.active)
        {
            // calculate vector from here to "bank" (top right of game area)
            console.log("Moving");
            let distX = gameObjectsCollection.energyReadout.x - this.x;
            let distY = gameObjectsCollection.energyReadout.y - this.y
            
            console.log("Distance vector: x:", distX, "y:", distY);

            // determine movement as 5 * unit vec
            let movX =  distX/Math.sqrt(distX**2 + distY**2) * this.#speed * gameData.deltaTime;
            let movY = distY/Math.sqrt(distX**2 + distY**2) * this.#speed * gameData.deltaTime;
            
            if (Math.sqrt(movX**2 + movY**2) < 20)
            {
                // close to bank, count it
                this.setVisible(false);
                this.setActive(false);
                let ind = gameObjectsCollection.energyObjects.indexOf(this);
                if (ind !== -1) gameObjectsCollection.energyObjects.splice(ind, 1); // https://stackoverflow.com/a/5767357
                gameData.energyStored += 50;
            }
            else
            {
                this.x += movX;
                this.y += movY;
            }
        }
    }

    #moveToBank()
    {
        console.log("Moving to energy bank");
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
    #animCooldownStarted = true;

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
        this.__cooldownStartTime = Date.now();
        this.on("animationcomplete", this.#onAnimationEnd)
    }

    update()
    {
        //console.log("Being updated");
        if ((Date.now() - this.__cooldownStartTime) / 1000 >= this.cooldown && this.#animCooldownStarted)
        {
            console.log("Producing energy");
            this.play(ANIMATION_ENERGY_PRODUCE_KEY);
            this.__cooldownStartTime = Date.now();
            this.#animCooldownStarted = false;
        }
    }

    #onAnimationEnd(anim, frame, context, frameKey)
    {
        console.log("Spawning energy");
        this.setFrame(0);
        gameObjectsCollection.energyObjects.push(new EnergyUnit(this.scene, SPRITE_ENERGY_KEY, this.x, this.y));
        this.#animCooldownStarted = true;
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
    // timer to control enemy state
    #lastShotTime = -1;

    #currentState = 0;
    #enemyStates = 
    {
        IDLE: 0,
        MOVING: 1,
        ATTACKING: 2
    };

    // movement info
    #nextTileX = 0;
    #nextTileY = 0;

    #nextTileRow = 0;
    #nextTileCol = 0;

    #currentTilePos;
    #currentTile = null;

    constructor(scene, texture, tileX, tileY)
    {
        // determine x and y pos
        this.#currentTile = gameObjectsCollection.board[tileY][tileX];
        let xPos = this.#currentTile.x;
        let yPos = this.#currentTile.y;

        // set next row / col
        this.#nextTileCol = tileX + this.#currentTile.nextTileTranslation.y;
        this.#nextTileRow = tileY + this.#currentTile.nextTileTranslation.y;

        let nextTile_ = gameObjectsCollection.board[this.#nextTileRow][this.#nextTileRow];

        super(scene, texture, nextTile_, xPos, yPos);
        this.health = 10;
        this.nextTile = nextTile_;
        this.speed = 5;
        this.#currentTilePos = new Vec2(xPos, yPos);
    }

    update()
    {
        switch (this.#currentState)
        {
            case 1:
                // move to next tile
                let movPer = this.#calculateMovementPercent(new Vec2(this.#nextTileX, this.#nextTileY));
                if (movPer === 1)
                {
                    // we have reached the next tile
                    this.x = this.#nextTileX;
                    this.y = this.#nextTileY;
                    // get the next tile
                    let t = this.nextTile.nextTileTranslation;
                    this.#nextTileRow += t.y;
                    this.#nextTileCol += t.x;

                    this.#currentTile = this.nextTile;
                    // set the next tile
                    this.nextTile = gameObjectsCollection.board[this.#nextTileRow][this.#nextTileCol];
                }
                else
                {

                }
                break;
        }
    }

    #calculateMovementPercent(endPos)
    {
        let totalMove = new Vec2(endPos.x, endPos.y);
        totalMove.sub(this.#currentTilePos);
        let totalDist = totalMove.magnitude();
        let percent = this.speed / totalDist;
        percent = clamp(0, 1, percent);

        return percent;
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

    static #__BuildablesObj = 
    {
        solarPanel: function(scene, name, xPos, yPos) { return new SolarPanel(scene, name, xPos, yPos); },
        basicTurret: function(scene, name, xPos, yPos) { return new BasicTurret(scene, name, xPos, yPos); },
        shieldGenerator: function(scene, name, xPos, yPos) { return new ShieldGenerator(scene, name, xPos, yPos); }
    };

    static COST_MAP = {};

    static initBuildableFactory()
    {
        this.COST_MAP[SPRITE_BASIC_TURRET_KEY] = BasicTurret.cost;
        this.COST_MAP[SPRITE_SOLAR_PANEL_KEY] = SolarPanel.cost;
        this.COST_MAP[SPRIRE_SHIELD_GENERATOR_KEY] = ShieldGenerator.cost;
    }

    static createNewBuildable(scene, name, xPos, yPos)
    {
        // create a buildable object specified by name
        console.log("Name:", name);
        let obj = this.#__BuildablesObj[name](scene, name, xPos, yPos);
        return obj;
    }

    static getBuildableCost(name)
    {
        return this.COST_MAP[name];
    }
}