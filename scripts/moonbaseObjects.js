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

function wrapi(min, max, val)
{
    // wraps a value around to fit within the specified range
    // 
    let res = min + val % mmax;
    return res;
}

function wrapf(min, max, val)
{

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

function compareHorizontalAndVerticalDistanceToThreshold(objA, objB, threshold)
{
    /**
     * @param {Phaser.GameObjects.GameObject} objA
     * @param {Phaser.GameObjects.GameObject} objB
     * @returns {boolean}
     */
    // checks that the x and y distances between two provided game objects are below or equal to a given threshold

    let xDist = Math.abs(objB - objA);
    let yDist = Math.abs(objB - objA);

    return xDist <= threshold && yDist <= threshold;
}

class BaseObject extends Phaser.Physics.Arcade.Sprite
{
    static orientable = false;

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
    #buildableName = "";
    constructor(scene, texture, xPos, yPos)
    {
        super(scene, texture, xPos, yPos);
        // set transparency to 50%
        this.setAlpha(0.5);
        this.setScale(0.5, 0.5);
        this.setActive(false);
        this.setVisible(false);
        this.orientation = 0;
        //this.on(Phaser.Input.Events.POINTER_DOWN, this.createBuildable);
        // set up keyboard listening
        this.scene.input.keyboard.on("keyDown", this.rotateGhost); // https://phaser.io/examples/v3.85.0/input/keyboard/view/global-keydown-event)
    }

    enable(name)
    {
        this.setActive(true);
        this.setVisible(true);
        this.setTexture(name);
        console.log("Ghost enabled with name", name);
        if (name === SPRITE_HOLOFENCE_KEY)
        {
            // larger than tile
            this.setOrigin(0.25, 0.5);
        }
        else
        {
            this.setOrigin(0.5, 0.5);
        }
        this.x = 32;
        this.y = 32;
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
            
            // if current buildable is orientable (like the holofence), update rotation
            // else rotation = 0
            if (BuildablesFactory.getOrientable(this.texture.key))
            {
                this.angle = this.orientation * 90;
            }

            // check for input
            if (MoonbaseInput.mouse.leftButtonDown() && !gameData.mouseOverUI)
            {
                // create the buildable
                this.createBuildable();
            }
        }
    }

    rotateGhost(event)
    {
        if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.R && this.active && this.visible && BuildablesFactory.getOrientable(this.#buildableName))
        {
            // rotate the ghost
            this.orientation++;
            if (this.orientation === 4)
                this.orientation = 0;
        }
    }

    createBuildable()
    {
        console.log("TESTING");
        if (this.active && this.visible)
        {
            console.log("Buildable requested");
            // determine row / col
            console.log("Mouse x:", MoonbaseInput.mouse.worldX, "Mouse y:", MoonbaseInput.mouse.worldY);

            let row = (this.y - 32) / 64;
            let col = (this.x - 32) / 64;

            console.log("Buildable row:", row, "Buildable column:", col);

            //console.log("Rows available:", gameObjectsCollection.board.length);
            //console.log("Columns available:", gameObjectsCollection.board[0].length);

            if (gameObjectsCollection.board.length > row)
            {
                if (gameObjectsCollection.board[0].length > col)
                {
                    if (gameObjectsCollection.board[row][col].isEmpty && gameObjectsCollection.board[row][col].isTurretSpace)
                    {
                        let newStructure = null;
                        console.log("Placing builable");
                        if (BuildablesFactory.getOrientable(this.#buildableName))
                            newStructure = BuildablesFactory.createNewBuildable(this.scene, this.#buildableName, this.x, this.y, this.orientation);
                        else
                            newStructure = BuildablesFactory.createNewBuildable(this.scene, this.#buildableName, this.x, this.y);
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
    #spawnTime = 0;
    #aliveTime = 5000;

    constructor(scene, texture, xPos, yPos)
    {
        super(scene, texture, xPos, yPos);
        this.#spawnTime = gameData.applicationTime;
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
            
            if (checkDistBetweenGameObjects(this, gameObjectsCollection.energyReadout) <= 64)
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
        else
        {
            // check we have been alive for five seconds
            if (gameData.applicationTime > this.#spawnTime + this.#aliveTime)
            {
                this.purge();
                return;
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
    static penalty = 0; // points are lost for destroyed buildables

    constructor(scene, texture, xPos, yPos)
    {
        super(scene, texture, xPos, yPos);
    }

    purge()
    {
        // determine row / col on board
        let row = (this.y - 32) / 64;
        let col = (this.x - 32) / 64;

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
                gameObjectsCollection.turrets.splice(i, 1);
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
    static penalty = 40;

    constructor(scene, texture, xPos, yPos)
    {
        super(scene, texture, xPos, yPos);
        this.scene.physics.add.existing(this);
        // create solar panel
        // find the tile at current position
        this.damage = 0;
        this.cooldown = 5;
        this.setActive(true);
        this.setVisible(true);
        this.__cooldownStartTime = gameData.applicationTime;
        this.on("animationcomplete", this.#onAnimationEnd);
    }

    updateObj()
    {
        //console.log("Being updated");
        if (this.health <= 0)
        {
            // explosion.png
            this.scene.events.emit(EVENTS_BUILDABLE_DEATH, SolarPanel.penalty);
            this.purge();
        }

        if ((gameData.applicationTime - this.__cooldownStartTime) / 1000 >= this.cooldown && this.#animCooldownStarted)
        {
            console.log("Producing energy");
            this.play(ANIMATION_ENERGY_PRODUCE_KEY);
            this.__cooldownStartTime = gameData.applicationTime;
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
    static penalty = 30;

    constructor(scene, texture, xPos, yPos)
    {
        super(scene, texture, xPos, yPos);
        scene.physics.add.existing(this);
        this.body.onOverlap = true;
        this.__range = 128;
        this.__targetEnemy = null;
        this.cooldown = 2;

        this.nextBulletFireTime = 0;
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
                this.attemptFire();
            }
        }
        else
        {
            // death
            this.scene.events.emit(EVENTS_BUILDABLE_DEATH, BasicTurret.penalty);
            this.purge();
        }
    }

    __findTarget()
    {
        let nearest = null;

        if (this.__targetEnemy !== null)
        {
            // check enemy is still in range
            if (checkDistBetweenGameObjects(this, this.__targetEnemy) <= this.__range)
                return;
            else
                this.__targetEnemy = null;
        }
        else
        {
            for (let enemyIndex = 0; enemyIndex < gameObjectsCollection.enemies.length; enemyIndex++)
            {
                if (nearest === null)
                {
                    // check if current enemy is in range
                    if (checkDistBetweenGameObjects(this, gameObjectsCollection.enemies[enemyIndex]) <= this.__range)
                    {
                        nearest = gameObjectsCollection.enemies[enemyIndex];
                        console.log("Found a target");
                    }
                        
                }
                else if (checkDistBetweenGameObjects(this, gameObjectsCollection.enemies[enemyIndex]) < checkDistBetweenGameObjects(this, nearest))
                {
                    nearest = gameObjectsCollection.enemies[enemyIndex];
                    console.log("Found a target");
                }
            }

            this.__targetEnemy = nearest;
        }
    }

    __getTileOccupants()
    {
        let occupants = []
        // determine array index of current tile
        let myRow = (this.y - 32) / 64;
        let myCol = (this.x - 32) / 64;

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

    attemptFire()
    {
        if (this.__targetEnemy === null)
            return;

        if (this.__targetEnemy.health <= 0)
        {
            this.__targetEnemy = null;
            return;
        }

        if (gameData.applicationTime >= this.nextBulletFireTime)
        {
            this.play(ANIMATION_TURRET_FIRE_KEY);
            // calculate vector from here to target
            let dir = new Vec2(this.__targetEnemy.x - this.x, this.__targetEnemy.y - this.y);
            dir = dir.normalised();
            console.log("Firing bullet");
            // fire bullet
            let bX = Math.sin(this.rotation);
            let bY = Math.cos(this.rotation);
            this.nextBulletFireTime = gameData.applicationTime + this.cooldown * 1000;
            gameObjectsCollection.projectiles.push(new BasicProjectile(this.scene, SPRITE_BULLET_KEY, this.x + (bX * 16), this.y + (bY * 16), 150, this.__targetEnemy));
        }
    }

    resetAnimation(anim, frame, gameobject, frameKey)
    {
        anim.setFrame(0);
    }

    rotateToEnemy()
    {
        if (this.__targetEnemy === null)
        {
            this.setAngle(0);
            return;
        }
            
        // spiiiiiiiiiiiiiiiinnnnnnnnnnnnnnn
        let angle = Phaser.Math.Angle.Between(this.x, this.y, this.__targetEnemy.x, this.__targetEnemy.y);
        this.setRotation(angle);
        // it's offset by 90 for some reason, idk why
        this.setAngle(this.angle + 90);
    }

    clearTarget()
    {
        this.__closestEnemy = null;
    }
}

class ShieldGenerator extends Buildable
{
    static cost = 50;
    static penalty = 15;

    constructor(scene, texture, xPos, yPos)
    {
        super(scene, texture, xPos, yPos);
        this.scene.physics.add.existing(this);
        this.health = 200;
        this.shield = new Shield(this.scene, this.x, this.y, this);
        gameObjectsCollection.shields.push(this.shield);
    }

    updateObj()
    {
        if (this.health <= 0)
        {
            // find shield in shields array
            for (let i = 0; i < gameObjectsCollection.shields.length; i++)
            {
                if (gameObjectsCollection.shields[i] === this.shield)
                {
                    gameObjectsCollection.shields.splice(i, 1);
                    break;
                }
            }
            
            // raise score penalty event
            this.scene.events.emit(EVENTS_BUILDABLE_DEATH, ShieldGenerator.penalty);

            this.purge();
            return;
        }
    }

    purge()
    {
        super.purge();
        this.shield.clearParent();
        this.shield.purge();
        this.shield = null; // set reference to null so it can be released from memory
    }
}

class Shield extends BaseObject
{
    #parent = null
    constructor(scene, xPos, yPos, parent)
    {
        super(scene, SPRITE_AREA_KEY, xPos, yPos);
        this.scene.add.existing(this);
        // fix scale
        this.setScale(1, 1);
        this.setAlpha(0.5);
        this.scene.physics.add.existing(this);
        this.body.onOverlap = true;
        this.#parent = parent;
    }

    getParent()
    {
        return this.#parent;
    }

    clearParent()
    {
        this.#parent = null;
    }
}

class EffectArea extends BaseObject
{
    #callback = () => {console.log("Hit");};
    #targetingPlayer = false;
    #duration = -1;
    #areaStartTime = 0;

    constructor(scene, xPos, yPos, targetPlayer = false, collisionFunc, duration = -1)
    {
        super(scene, SPRITE_AREA_KEY, xPos, yPos);
        scene.physics.add.existing(this);
        this.setAlpha(0);
        this.#callback = collisionFunc;
        this.#targetingPlayer = targetPlayer;
        this.#duration = duration;
        this.#areaStartTime = gameData.applicationTime;
    }

    updateObj()
    {
        if (this.#duration > 0)
        {
            // area is non-permanent
            if (gameData.applicationTime > this.#areaStartTime + this.#duration)
            {
                this.purge();
                return;
            }
        }

        let len = 0;
        let arr = [];

        // check between buildables or enemies
        if (!this.#targetingPlayer)
        {
            len = gameObjectsCollection.enemies.length;
            arr = gameObjectsCollection.enemies;
        }
        else
        {
            len = gameObjectsCollection.turrets.length;
            arr = gameObjectsCollection.turrets;
        }

        for (let i = 0; i < len; i++)
        {
            if (this.scene.physics.overlap(this, arr[i]))
            {
                this.#callback();
            }
        }
    }

    purge()
    {
        for (let i = 0; i < gameObjectsCollection.effectAreas.length; i++)
        {
            if (gameObjectsCollection.effectAreas[i] === this)
            {
                gameObjectsCollection.effectAreas.splice(i, 1);
                break;
            }
        }

        this.destroy();
    }
}

class HoloFence extends Buildable
{
    // damages enemies as they pass through it
    static cost = 50;
    static penalty = 20;
    static orientable = true;

    constructor(scene, texture, xPos, yPos, direction)
    {
        super(scene, texture, xPos, yPos);
        this.scene.physics.add.existing(this);
        this.body.onOverlap = true;
        this.setOrigin(0.25, 0.5);
        this.body.setSize(128, 64); // https://phaser.discourse.group/t/solved-overlap-between-2-sprites-not-detecting/3153/5
        //this.body.setOffset()
        this.x = xPos;
        this.y = yPos;
        this.damage = 20;

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

    updateObj()
    {
        // check alive
        if (this.health <= 0)
        {
            // THE HOLOFENCE IS DEAD
            this.scene.events.emit(EVENTS_BUILDABLE_DEATH, HoloFence.penalty);
            this.purge();
            return;
        }

        for (let enemyIndex = 0; enemyIndex < gameObjectsCollection.enemies.length; enemyIndex++)
        {
            // check for overlap
            if (this.scene.physics.overlap(this, gameObjectsCollection.enemies[enemyIndex]))
            {
                console.log("Overlap");
                if (gameObjectsCollection.enemies[enemyIndex].getLastFencePassed() !== this)
                {
                    console.log("DAMAGE");
                    gameObjectsCollection.enemies[enemyIndex].changeHealth(-this.damage);
                    gameObjectsCollection.enemies[enemyIndex].setLastFencePassed(this);
                }
            }
        }
    }
}

class BasicEnemy extends BaseObject
{
    // timer to control enemy state
    #healthChanged = false;
    #lastFencePassed = null;
    #target = null;

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

        this.__shieldTarget = null;
        this.__playerDMG = 10;
        // fix the physics
        this.body.setSize(64, 64);

        this.__isMoving = true;
        this.__range = 64 * 4;

        this.__nextShotTime = 0;
        this.__cooldown = 5;

        // set next tile
        this.__nextTile = gameObjectsCollection.board[this.__row + this.__currentTile.nextTileTranslation.y][this.__col + this.__currentTile.nextTileTranslation.x];

        this.speed = 100; // should be public, can be slowed down
        this.__reachedTrackEnd = false;
        this.__birthday = gameData.applicationTime;
        this.__tier = 1;
        this.on("animationcomplete", this.resetAnimation);
    }

    updateState()
    {
        this.__shieldTarget = null;
        if (this.#lastFencePassed !== null)
        {
            // check if it's protected
            if (this.__checkIfBuildableIsProtected(this.#lastFencePassed))
            {
                this.__launchProjectile(this.__shieldTarget.getParent());
            }
            else
            {
                this.__launchProjectile(this.#lastFencePassed);
            }
        }
        else
        {
            // search for a nearby turret
            let turret = this.__findNearestTurret();
            if (turret !== null)
            {
                if (!this.__checkIfBuildableIsProtected(turret))
                {
                    this.__launchProjectile(turret);
                }
                else
                {
                    this.__launchProjectile(this.__shieldTarget.getParent());
                }
            }
        }
    }

    __findNearestTurret()
    {
        let nearest = null;

        for (let i = 0; i < gameObjectsCollection.turrets.length; i++)
        {
            if (nearest === null)
            {
                if (checkDistBetweenGameObjects(this, gameObjectsCollection.turrets[i]) <= this.__range)
                {
                    nearest = gameObjectsCollection.turrets[i];
                }
            }
            else
            {
                if (checkDistBetweenGameObjects(this, nearest) > checkDistBetweenGameObjects(this, gameObjectsCollection.turrets[i]))
                {
                    nearest = gameObjectsCollection.turrets[i];
                }
            }
        }

        return nearest;
    }

    __checkIfBuildableIsProtected(buildable)
    {
        let isProtected = false;
        for (let i = 0; i < gameObjectsCollection.shields.length; i++)
        {
            if (this.scene.physics.overlap(buildable, gameObjectsCollection.shields[i]))
            {
                isProtected = true;
                this.__shieldTarget = gameObjectsCollection.shields[i];
                break;
            }
        }
        return isProtected;
    }

    updateObj()
    {
        this.updateState();
        // handle movement
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
                    // damage player by assigned amount
                    gameData.playerHealth -= this.__playerDMG;
                    this.purge();
                }
            }
        }
        else
        {
            // check enemy is alive
            if (this.health <= 0)
            {
                // determine time of death
                let duration = gameData.applicationTime - this.__birthday;
                this.scene.events.emit(EVENTS_ENEMY_DEATH, duration, this.__tier);
                this.purge();
                return;
            }
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

    __launchProjectile(target)
    {
        if (gameData.applicationTime >= this.__nextShotTime)
        {
            let dirX = target.x - this.x;
            let dirY = target.y - this.y;

            let dirVec = new Vec2(dirX, dirY);
            dirVec = dirVec.normalised();
            this.__nextShotTime = gameData.applicationTime + this.__cooldown * 1000;
            let bullet = new BasicProjectile(this.scene, SPRITE_BULLET_KEY, this.x, this.y, 100, target, 10);
            gameObjectsCollection.projectiles.push(bullet);
        }
    }

    changeHealth(amt)
    {
        this.health += amt;
        this.#healthChanged = true;
        this.play(ANIMATION_BASIC_ENEMY_DAMAGE);
    }

    setLastFencePassed(fence)
    {
        this.#lastFencePassed = fence;
    }

    getLastFencePassed()
    {
        return this.#lastFencePassed;
    }

    resetAnimation(anim, frame, gameObject, frameKey)
    {
        this.setFrame(0);
        console.log("Resetting frame");
    }
}

class BasicProjectile extends BaseObject
{
    constructor(scene, texture, originX, originY, speed, target, damage = 40)
    {
        super(scene, texture, originX, originY);
        this.setScale(1, 1);
        scene.physics.add.existing(this);
        this.body.onOverlap = true;
        this.body.setSize(8, 8);
        this.speed = speed;
        let dirX = target.x - this.x;
        let dirY = target.y - this.y;

        let dirVec = new Vec2(dirX, dirY);
        dirVec = dirVec.normalised();

        this.setVelocityX(dirVec.x * speed);
        this.setVelocityY(dirVec.y * speed);
        this.target = target;
        this.dmg = damage;
    }

    updateObj()
    {
        // check target is not null and alive
        if (this.target !== null)
        {
            if (this.target.health <= 0)
            {
                this.target = null;
                this.purge();
                return;
            }
        }
        else
        {
            this.purge();
            this.return;
        }

        // check if outside game world
        if (this.x > this.scene.game.config.width || this.x < 0 || this.y > this.scene.game.config.height || this.y < 0)
        {
            this.purge();
            return;
        }

        // update velocity. we need to home in on the target
        let dirX = this.target.x - this.x;
        let dirY = this.target.y - this.y;

        let dirVec = new Vec2(dirX, dirY);
        dirVec = dirVec.normalised();
        
        // set velocity
        this.setVelocityX(dirVec.x * this.speed);
        this.setVelocityY(dirVec.y * this.speed);

        // check for a collision
        if (this.scene.physics.overlap(this, this.target))
        {
            // damage target and destroy self
            console.log("Kablooey");
            console.log(this.target);
            this.target.changeHealth(-this.dmg);
            this.purge();
        }
    }

    purge()
    {
        for (let i = 0; i < gameObjectsCollection.projectiles.length; i++)
        {
            if (gameObjectsCollection.projectiles[i] === this)
            {
                gameObjectsCollection.projectiles.splice(i, 1);
                console.log("Removing");
                break;
            }
        }

        this.destroy();
    }
}

class BuildablesFactory
{
    static #__BuildablesObj = 
    {
        solarPanel: function(scene, name, xPos, yPos) { return new SolarPanel(scene, name, xPos, yPos); },
        basicTurret: function(scene, name, xPos, yPos) { return new BasicTurret(scene, name, xPos, yPos); },
        shieldGenerator: function(scene, name, xPos, yPos) { return new ShieldGenerator(scene, name, xPos, yPos); },
        holoFence: function(scene, name, xPos, yPos, orientation) { return new HoloFence(scene, name, xPos, yPos, orientation); }
    };

    static COST_MAP = {};
    static ROTATION_MAP = {};

    static initBuildableFactory()
    {
        BuildablesFactory.COST_MAP[SPRITE_BASIC_TURRET_KEY] = BasicTurret.cost;
        BuildablesFactory.COST_MAP[SPRITE_SOLAR_PANEL_KEY] = SolarPanel.cost;
        BuildablesFactory.COST_MAP[SPRITE_SHIELD_GENERATOR_KEY] = ShieldGenerator.cost;
        BuildablesFactory.COST_MAP[SPRITE_HOLOFENCE_KEY] = HoloFence.cost;
        
        // rotation
        BuildablesFactory.ROTATION_MAP[SPRITE_HOLOFENCE_KEY] = HoloFence.orientable;
        BuildablesFactory.ROTATION_MAP[SPRITE_BASIC_TURRET_KEY] = BasicTurret.orientable;
        BuildablesFactory.ROTATION_MAP[SPRITE_SOLAR_PANEL_KEY] = SolarPanel.orientable;
        BuildablesFactory.ROTATION_MAP[SPRITE_SHIELD_GENERATOR_KEY] = ShieldGenerator.orientable;
    }

    static createNewBuildable(scene, name, xPos, yPos, orientation = -1)
    {
        // create a buildable object specified by name
        let obj = null;
        console.log("Name:", name);
        if (orientation === -1)
            obj = BuildablesFactory.#__BuildablesObj[name](scene, name, xPos, yPos);
        else
            obj = BuildablesFactory.#__BuildablesObj[name](scene, name, xPos, yPos, orientation);
        return obj;
    }

    static getOrientable(key)
    {
        return this.ROTATION_MAP[key];
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