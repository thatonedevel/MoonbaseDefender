const COLUMNS = 16;
const ROWS = 9;

// object for game states
let GameStates = 
{
    TITLE: 1,
    GAMEOVER: 2
};

// all gameobjects are to be stored here
let gameObjectsCollection = 
{
    turrets: [],
    enemies: [],
    board: [
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        []
    ],
    projectiles: []
};

function main()
{
    let config = 
    {
        width: 1600,
        height: 900,
        scene: 
        {
            create: _create,
            preload: _preload,
            update: _update,
        }
    };

    // create phaser game
    let moonbaseDefender = new Phaser.Game(config);
}

// game functions
function _create()
{
    // create base game objects
    loadLevel(0, this);
}

function _preload()
{
    // add loader evt listeners
    console.log("Started loading files");
    this.load.on("addfile", fileAddedToLoadQueueListener);
    this.load.on("load", fileLoadedListener);
    this.load.on("loaderror", fileLoadFailListener);

    // load game assets
    // tiles
    this.load.image("tilePlaceableA", "../assets/sprites/tiles/tilePlaceableA.png");
    this.load.image("tilePlaceableB", "../assets/sprites/tiles/tilePlaceableB.png");

    this.load.image("tileTrackCrossA", "../assets/sprites/tiles/tileTrackCrossA.png");
    this.load.image("tileTrackCrossB", "../assets/sprites/tiles/tileTrackCrossB.png");

    this.load.image("tileTrackCurveA", "../assets/sprites/tiles/tileTrackCurveA.png");
    this.load.image("tileTrackCurveB", "../assets/sprites/tiles/tileTrackCurveB.png");

    this.load.image("tileTrackStraightA", "../assets/sprites/tiles/tileTrackStraightA.png");
    this.load.image("tileTrackStraightB", "../assets/sprites/tiles/tileTrackStraightB.png");
}

function _update()
{
    // main game loop goes here
    // call update on all game objects
    for (let i = 0; i < gameObjectsCollection.turrets.length; i++)
    {
        gameObjectsCollection.turrets[i].update();
    }

    for (let i = 0; i < gameObjectsCollection.enemies.length; i++)
    {
        gameObjectsCollection.enemies[i].update();
    }

    for (let i = 0; i < gameObjectsCollection.projectiles.length; i++)
    {
        gameObjectsCollection.projectiles[i].update();
    }
}

function loadLevel(levelIndex, scene)
{
    let tileX = 64;
    let tileY = 64;
    let tileCount = 0;
    let currentVariant = "A";
    let newTile;

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

            if (tileCount % 2 == 0)
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
                    break;
                case 9:
                    newTile = new Tile(scene, tileX, tileY, "tileTrackCurve" + currentVariant);
                    gameObjectsCollection.board[row].push(newTile);
                    newTile.nextTileTranslation = {x: 0, y:1};
                    newTile.angle = 270;
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
                    newTile = new Tile(scene, tileX, tileY, "tileTrackCurrent" + currentVariant);
                    gameObjectsCollection.board[row].push(newTile);
                    newTile.nextTileTranslation = {x: 0, y: -1};
                    newTile.angle = 180;
                    break;
                case 13:
                    newTile = new Tile(scene, tileX, tileY, "tileTrackCurrent" + currentVariant);
                    gameObjectsCollection.board[row].push(newTile);
                    newTile.nextTileTranslation = {x: 1, y:0};
                    newTile.angle = 270;
                    break;
            }

            tileX += 128;
        }
        tileX = 64;
        tileY += 128;
    }
}

function fileAddedToLoadQueueListener(key, type, loader, file)
{
    console.log("File ", file, " added to load queue with key ", key);
}

function fileLoadFailListener(file)
{
    console.warn("File ", file, " could not be loaded");
}

function fileLoadedListener(file)
{
    console.log("File ", file, " loaded successfully");
}

window.addEventListener("load", main);