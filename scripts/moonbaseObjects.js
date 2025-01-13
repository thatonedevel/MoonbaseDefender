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
        let newX = this.x / this.magnitude();
        let newY = this.y / this.magnitude();

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

class BaseObject extends Phaser.Physics.Arcade.Sprite
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

    updateObj()
    {

    }

    changeHealth(amt) 
    {
        this.health += amt;        
    }

    purge()
    {
        this.destroy();
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

    updateObj()
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
                    if (gameObjectsCollection.board[row][col].isEmpty)
                    {
                        console.log("Placing builable");
                        let newStructure = BuildablesFactory.createNewBuildable(this.scene, this.#buildableName, this.x, this.y);
                        gameObjectsCollection.turrets.push(newStructure);
                        // set the occupant of the tile to the new turret
                        gameObjectsCollection.board[row][col].addOccupant(newStructure);

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

    updateObj()
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
                gameData.energyStored += 50;
                this.purge();
            }
            else
            {
                this.x += movX;
                this.y += movY;
            }
        }
    }

    purge()
    {
        for (let i = 0; i < gameObjectsCollection.energyObjects.length; i++)
        {
            if (gameObjectsCollection.energyObjects[i] === this)
            {
                gameObjectsCollection.energyObjects.splice(i, 1); // https://stackoverflow.com/a/5767357
                break;
            }
        }

        this.destroy();
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
    }

    purge()
    {
        // determine row / col on board
        let row = (this.x / 32) - 1;
        let col = (this.y / 32) - 1;

        if (row < gameObjectsCollection.board.length && col < gameObjectsCollection.board[0].length)
        {
            // found tile
            let tile = gameObjectsCollection.board[row][col];
            tile.removeOccupant(this);
        }

        // find self in buildables array

        for (let i = 0; i < gameObjectsCollection.turrets.length; i++)
        {
            if (gameObjectsCollection.turrets[i] === this)
            {
                gameObjectsCollectionb.turrets.splice(i, 1);
                break;
            }
        }        

        this.destroy();
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

    updateObj()
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

    constructor(scene, texture, xPos, yPos)
    {
        super(scene, texture, xPos, yPos);
        scene.physics.add.existing(this);
        this.__range = 1;
        this.__closestEnemy = null;
    }

    updateObj()
    {
        if (this.health > 0)
        {
            if (gameObjectsCollection.enemies.length > 0)
            {
                console.log("Searching");
                this.__findTarget();
                this.rotateToEnemy();
            }
        }
        else
        {
            // death
            this.purge();
        }
    }

    __findTarget()
    {
        // stops if current target enemy is still in range

        let occ = this.__getTileOccupants();
        if (this.__closestEnemy !== null)
            if (occ.includes(this.__closestEnemy))
                return;

        for (let occupantIndex = 0; occupantIndex < occ.length; occupantIndex++)
        {
            if (occ[occupantIndex] !== null)
            {
                // we have an enemy
                this.__closestEnemy = occ[occupantIndex];
                break;
            }
        }
    }

    __getTileOccupants()
    {
        let occupants = []
        // determine array index of current tile
        let myRow = this.y / 32 - 1;
        let myCol = this.x / 32 - 1;

        for (let row = 0; row < myRow + this.__range + 1; row++)
        {
            for (let col = 0; col < myCol + this.__range + 1; col++)
            {
                if (row === myRow && col === myCol)
                    continue;

                // if we are outside arr bounds, continue
                if (row >= gameObjectsCollection.board.length || col >= gameObjectsCollection.board[0].length)
                    continue;

                if (gameObjectsCollection.board[row][col].forPlayer)
                    continue;

                occupants.push(...gameObjectsCollection.board[row][col].getOccupantsList());
            }
        }

        return occupants;
    }

    rotateToEnemy()
    {
        if (this.__closestEnemy === null)
        {
            console.log("no target");
            return;
        }

        // rotate towards nearest enemy
        let xDist = this.__closestEnemy.x - this.x; 
        let yDist = this.__closestEnemy.y - this.y;

        let opposite = 1;
        let adjacent = 1;

        if (this.__closestEnemy.y > this.y) // enemy is below turret
        {
            opposite = xDist;
            adjacent = yDist;
        }
        else
        {
            opposite = yDist;
            adjacent = xDist;
        }

        let angle = Math.atan(opposite/adjacent);

        console.log("Rotating");
        this.rotation = angle;

        // SOH CAH TOA
    }

    #resetAnim()
    {

    }

    clearTarget()
    {
        this.__closestEnemy = null;
    }
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

    #enemyStates = 
    {
        IDLE: 0,
        MOVING: 1,
        ATTACKING: 2
    };

    constructor(scene, texture, tileX, tileY)
    {
        super(scene, texture, gameObjectsCollection.board[tileY][tileX].x, gameObjectsCollection.board[tileY][tileX].y);
        // add the object to the scene physics group
        scene.physics.add.existing(this);
        // takes the scene, texture and tile col / row
        this.__currentState = this.#enemyStates.MOVING;
        this.__currentTile = gameObjectsCollection.board[tileY][tileX];
        this.__row = tileY;
        this.__col = tileX;

        this.__isMoving = true;

        // set next tile
        this.__nextTile = gameObjectsCollection.board[this.__row + this.__currentTile.nextTileTranslation.y][this.__col + this.__currentTile.nextTileTranslation.x];

        this.speed = 100; // should be public, can be slowed down
        this.__reachedTrackEnd = false;
    }

    updateObj()
    {
        if (this.__isMoving)
        {
            if (!this.__reachedTrackEnd)
            {
                if (checkDistBetweenGameObjects(this, this.__nextTile) > 2)
                {
                    // move towards next tile
                    // get direction to next tile
                    let dirX = this.__nextTile.x - this.x;
                    let dirY = this.__nextTile.y - this.y;
                    
                    let movementVec = new Vec2(dirX, dirY);
                    let dirAbs = movementVec.normalised();
                    // convert to mag of 1

                    this.body.setVelocityX(dirAbs.x * this.speed);
                    this.body.setVelocityY(dirAbs.y * this.speed);
                }
                else
                {
                    this.x = this.__nextTile.x;
                    this.y = this.__nextTile.y;
                    this.__isMoving = false;
                    console.log("Moved");
                }
            }
            else
            {
                // check distance from x or y boundaries
                if (this.x >= this.scene.game.config.width + 32 || this.x <= -32 || this.y > 32 || this.y < (-1 * this.scene.game.config.height) - 32)
                {
                    console.log("purging");
                    this.purge();
                }
            }
        }
        else
        {
            // check enemy is alive
            if (this.health <= 0)
            {
                this.purge();
                return;
            }
            switch(this.__currentState)
            {
                case this.#enemyStates.MOVING:
                    // update tile status
                    this.__currentTile.removeOccupant(this);
                    // update row / col
                    this.__row += this.__currentTile.nextTileTranslation.y;
                    this.__col += this.__currentTile.nextTileTranslation.x;

                    this.__currentTile = this.__nextTile;
                    this.__currentTile.addOccupant(this);

                    // check if next tile exists
                    if (this.__row < gameObjectsCollection.board.length - 1 && this.__col < gameObjectsCollection.board[0].length - 1)
                    {
                        // get next tile
                        this.__nextTile = gameObjectsCollection.board[this.__row + this.__currentTile.nextTileTranslation.y][this.__col + this.__currentTile.nextTileTranslation.x];
                        // reset movement flag
                        this.__isMoving = true;
                    }
                    else
                    {
                        // moving outside the game world
                        this.__reachedTrackEnd = true;
                        this.__isMoving = true;
                    } 
                    break;
            }
        }
    }

    purge()
    {
        // removes all references to object for it to be removed from memory when destory is called
        if (this.__currentTile !== null)
        {
            this.__currentTile.removeOccupant(this);
        }

        if (this.__nextTile !== null)
        {
            // call remove just in case it exists in both
            this.__nextTile.removeOccupant(this);
        }

        // remove self from game objects collection
        for (let i = 0; i < gameObjectsCollection.enemies.length; i++)
        {
            if (gameObjectsCollection.enemies[i] === this)
            {
                gameObjectsCollection.enemies.splice(i, 1);
                break;
            }
        }

        // call GameObject.Destroy
        this.destroy();
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

class EnemiesFactory
{
    static #enemies = {basicEnemy: function(scene, texture, spawnRow, spawnCol) {return new BasicEnemy(scene, texture, spawnCol, spawnRow);}};

    static createEnemy(enemyType, scene, spawnRow, spawnCol)
    {
        console.log("Enemy type", enemyType);
        let newEnemy = this.#enemies[enemyType](scene, enemyType, spawnRow, spawnCol);
        return newEnemy;
    }
}