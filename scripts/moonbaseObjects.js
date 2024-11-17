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
    }

    update()
    {

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