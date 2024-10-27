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
    constructor(scene, tileX, tileY, texture, forPlayer)
    {
        super(scene, tileX, tileY, texture)
        this.occupant = null;
        this.isTurretSpace = forPlayer;
        this.nextTile = null;
    }
}

class BasicTurret extends BaseObject
{
    constructor(scene, xPos, yPos)
    {
        super(scene, "basicTurret", xPos, yPos);
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