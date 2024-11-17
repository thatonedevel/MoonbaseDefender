const { GameObjects } = require("phaser");

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
        // enable object
        this.setActive(true);
        this.setVisible(true);
        // set transparency to 50%
        this.setAlpha(0.5);
    }

    update()
    {
        nearestTile = null;
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
                        }
                    }
                }
            }
            // set position to nearest tile pos
            this.x = nearestTile.x;
            this.y = nearestTile.y;
        }
    }
}

class Tile extends Phaser.GameObjects.Sprite
{
    constructor(scene, tileX, tileY, texture, forPlayer = false)
    {
        super(scene, tileX, tileY, texture)
        this.occupant = null;
        this.isTurretSpace = forPlayer;
        this.nextTileTranslation = null;
        this.setScale(0.5, 0.5);
        scene.add.existing(this);
    }
}

class Buildable extends BaseObject
{
    constructor(scene, texture, xPos, yPos)
    {
        super(scene, texture, xPos, yPos);
    }
}

class SolarPanel extends Buildable
{
    constructor(scene, texture, xPos, yPos)
    {
        super(scene, texture, xPos, yPos)
        {
            // create solar panel
            // find the tile at current position
        }
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