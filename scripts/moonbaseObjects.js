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
        this.setActive(false);
        this.setVisible(false);
    }

    enable(name)
    {
        this.setActive(true);
        this.setVisible(true);
        this.setTexture(name);
    }

    update()
    {
        let nearestTile = null;
        // set position to nearest grid tile
        if (this.active && this.visible)
        {
            for (let row = 0; row < gameObjectsCollection.board.length; row++)
            {
                for (let col = 0; col < gameObjectsCollection.board[row].length; col++)
                {
                    // check current tile's distance to mouse
                    if (nearestTile != null)
                    {
                        // dist = sqrt(x^2 + y^2)
                        let dist = Math.sqrt((MoonbaseInput.mouse.x - nearestTile.x)**2 + (MoonbaseInput.mouse.y - nearestTile.y)**2);
                        let newTileDist = Math.sqrt((MoonbaseInput.mouse.x - gameObjectsCollection.board[row][col].x)**2 + (MoonbaseInput.mouse.y - gameObjectsCollection.board[row][col].y)**2);
                        if (newTileDist < dist)
                        {
                            nearestTile = gameObjectsCollection.board[row][col];
                            console.log("Found tile");
                        }
                    }
                }
            }
            // set position to nearest tile pos
            if (nearestTile !== null)
            {
                this.x = nearestTile.x;
                this.y = nearestTile.y;
            }
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