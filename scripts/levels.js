/*
    -Levels should cover the full screen
    - Consist of 32x32px tiles
    - Levels will be in a 16:9 ratio
    - Leave an extra 32 px at the top for GUI
    - 1 = enemy spawns
    - 2 - 13 track for enemies
    - 0 = placeable turret space
    - MORE WILL BE ADDED


    COMPASS HEADINGS:
    straight tiles:
    2 - NORTH
    3 - EAST
    4 - SOUTH
    5 - WEST

    curves:
    6 - SOUTH TO WEST
    7 - WEST TO NORTH
    8 - NORTH TO EAST
    9 - EAST TO SOUTH
    10 - WEST TO SOUTH
    11 - NORTH TO WEST
    12 - EAST TO NORTH
    13 - SOUTH TO EAST
*/

const LEVELS = [
    [
        [0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,4,0,0,0,0,0,0,0,13,3,3,3,9,0,0],
        [0,8,9,0,0,0,0,0,0,2,0,0,0,4,0,0],
        [0,0,4,0,0,0,0,0,0,2,0,0,0,4,0,0],
        [0,0,8,3,3,9,0,0,0,2,0,0,0,4,0,0],
        [0,0,0,0,0,4,0,0,0,2,0,0,0,4,0,0],
        [0,0,0,0,0,8,3,3,3,12,0,0,0,4,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0]
    ]
];

class Tile extends Phaser.GameObjects.Sprite
{
    #occupants = [];
    constructor(scene, tileX, tileY, texture, forPlayer = false)
    {
        super(scene, tileX, tileY, texture)
        this.isTurretSpace = forPlayer;
        this.nextTileTranslation = null;
        this.setScale(0.5, 0.5);
        scene.add.existing(this);
    }

    addOccupant(newOccupant)
    {
        this.#occupants.push(newOccupant)
    }

    removeOccupant(target)
    {
        for (let i = 0; i < this.#occupants.length; i++)
        {
            if (this.#occupants[i] === target)
            {
                this.occupants.splice(0, 1);
                break;
            }
        }
    }

    emptyTile()
    {
        this.#occupants.length = 0;
    }

    get isEmpty()
    {
        return this.#occupants.length === 0;
    }

}

function loadLevel(levelIndex, scene)
{
    let tileX = 32;
    let tileY = 32;
    let tileCount = 0;
    let currentVariant = "A";
    let newTile = null;

    // clear out level data
    for (let turretIndex = 0; turretIndex < gameObjectsCollection.turrets.length; turretIndex++)
    {
        gameObjectsCollection.turrets[turretIndex].setActive(false);
        gameObjectsCollection.turrets[turretIndex].setVisible(false);
    }

    // clear the array
    gameObjectsCollection.turrets.length = 0;

    for (let enemyIndex = 0; enemyIndex < gameObjectsCollection.enemies.length; enemyIndex++)
    {
        gameObjectsCollection.enemies[enemyIndex].setActive(false);
        gameObjectsCollection.enemies[enemyIndex].setVisible(false);
    }

    gameObjectsCollection.enemies.length = 0;

    for (let boardTileIndex = 0; boardTileIndex < gameObjectsCollection.board.length; boardTileIndex++)
    {
        for (let col = 0; col < gameObjectsCollection.board[boardTileIndex].length; col++)
        {
            gameObjectsCollection.board[boardTileIndex][col].setActive(false);
            gameObjectsCollection.board[boardTileIndex][col].setVisible(false)
        }
    }

    gameObjectsCollection.board = [[], [], [], [], [], [], [], [], []];

    for (let projIndex = 0; projIndex < gameObjectsCollection.projectiles.length; projIndex++)
    {
        gameObjectsCollection.projectiles[projIndex].setActive(false);
        gameObjectsCollection.projectiles[projIndex].setVisible(false);
    }

    gameObjectsCollection.projectiles.length = 0;

    let level = LEVELS[levelIndex];
    // loop through and place tiles
    for (let row = 0; row < ROWS; row++)
    {
        for (let column = 0; column < COLUMNS; column++)
        {
            tileNo = level[row][column];

            if ((tileCount + row) % 2 == 0)
                currentVariant = "A";
            else
                currentVariant = "B";
            
            tileCount++;
            switch(tileNo)
            {
                case 0:
                    // empty tile
                    newTile = new Tile(scene, tileX, tileY, "tilePlaceable" + currentVariant, true);
                    gameObjectsCollection.board[row].push(newTile);
                    break;
                case 1:
                    newTile = new Tile(scene, tileX, tileY, "tileTrackStraight" + currentVariant);
                    gameObjectsCollection.board[row].push(newTile);
                    newTile.nextTileTranslation = {x:0, y:1};
                    break;

                case 2:
                    newTile = new Tile(scene, tileX, tileY, "tileTrackStraight" + currentVariant);
                    gameObjectsCollection.board[row].push(newTile);
                    newTile.nextTileTranslation = {x:0, y:-1};
                    break;
                
                case 3:
                    newTile = new Tile(scene, tileX, tileY, "tileTrackStraight" + currentVariant);
                    gameObjectsCollection.board[row].push(newTile);
                    newTile.nextTileTranslation = {x: 1, y:0};
                    newTile.angle = 90;
                    break;
                case 4:
                    newTile = new Tile(scene, tileX, tileY, "tileTrackStraight" + currentVariant);
                    gameObjectsCollection.board[row].push(newTile);
                    newTile.nextTileTranslation = {x: 0, y:1};
                    break;
                case 5:
                    newTile = new Tile(scene, tileX, tileY, "tileTrackStraight" + currentVariant);
                    gameObjectsCollection.board[row].push(newTile);
                    newTile.nextTileTranslation = {x: -1, y: 0};
                    newTile.angle = 90;
                    break;
                case 6:
                    newTile = new Tile(scene, tileX, tileY, "tileTrackCurve" + currentVariant);
                    gameObjectsCollection.board[row].push(newTile);
                    newTile.nextTileTranslation = {x: 1, y:0};
                    newTile.angle = 90;
                    break;
                case 7:
                    newTile = new Tile(scene, tileX, tileY, "tileTrackCurve" + currentVariant);
                    gameObjectsCollection.board[row].push(newTile);
                    newTile.nextTileTranslation = {x: 0, y: -1};
                    break;
                case 8:
                    newTile = new Tile(scene, tileX, tileY, "tileTrackCurve" + currentVariant);
                    gameObjectsCollection.board[row].push(newTile);
                    newTile.nextTileTranslation = {x: 1, y:0};
                    newTile.angle = 180;
                    break;
                case 9:
                    newTile = new Tile(scene, tileX, tileY, "tileTrackCurve" + currentVariant);
                    gameObjectsCollection.board[row].push(newTile);
                    newTile.nextTileTranslation = {x: 0, y:1};
                    break;
                case 10:
                    newTile = new Tile(scene, tileX, tileY, "tileTrackCurve" + currentVariant);
                    gameObjectsCollection.board[row].push(newTile);
                    newTile.nextTileTranslation = {x:0, y:1};
                    newTile.angle = 90;
                    break;
                case 11:
                    newTile = new Tile(scene, tileX, tileY, "tileTrackCurve" + currentVariant);
                    gameObjectsCollection.board[row].push(newTile);
                    newTile.nextTileTranslation = {x: 1, y:0};
                    break;
                case 12:
                    newTile = new Tile(scene, tileX, tileY, "tileTrackCurve" + currentVariant);
                    gameObjectsCollection.board[row].push(newTile);
                    newTile.nextTileTranslation = {x: 0, y: -1};
                    newTile.angle = 90;
                    break;
                case 13:
                    newTile = new Tile(scene, tileX, tileY, "tileTrackCurve" + currentVariant);
                    gameObjectsCollection.board[row].push(newTile);
                    newTile.nextTileTranslation = {x: 1, y:0};
                    newTile.angle = 270;
                    break;
            }

            tileX += 64;
        }
        tileX = 32;
        tileY += 64;
    }
}