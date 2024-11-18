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
        scene.add.existing(this);
    }

    update()
    {

    }
}

class BuildableGhost extends BaseObject
{
    constructor(scene, texture, xPos, yPos)
    {
        super(scene, texture, xPos, yPos);
        scene.add.existing(this);
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

class Buildable extends BaseObject
{
    static cost = 0;
    constructor(scene, texture, xPos, yPos)
    {
        super(scene, texture, xPos, yPos);
    }
}

class SolarPanel extends Buildable
{
    static cost = 25;
    constructor(scene, texture, xPos, yPos)
    {
        super(scene, texture, xPos, yPos)
        {
            // create solar panel
            // find the tile at current position
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