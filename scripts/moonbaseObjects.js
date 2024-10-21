class BaseObject
{
    constructor()
    {
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

class BaseTurret extends BaseObject
{
    constructor()
    {

    }
}

class BaseEnemy extends BaseObject
{
    constructor()
    {

    }
}

class BaseProjectile extends BaseObject
{
    constructor(originX, originY)
    {

    }
}