const { FacebookInstantGamesLeaderboard } = require("phaser");

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
    board: [],
    projectiles: []
};

function main()
{
    let config = 
    {
        width: 800,
        height: 600,
        scene: 
        {
            create: create,
            preload: preload,
            update: update,
        }
    };

    // create phaser game
    let moonbaseDefender = new Phaser.Game(config);
}

// game functions
function create()
{
    // create base game objects
}

function preload()
{
    // load game assets
    // tiles
    this.load.image("../assets/sprites/tiles/tilePlaceableA.png", "tilePlaceableA");
    this.load.image("../assets/sprites/tiles/tilePlaceableB.png", "tilePlaceableB");

    this.load.image("../assets/sprites/tiles/tileTrackCrossA.png", "tileTrackCrossA");
    this.load.image("../assets/sprites/tiles/tileTrackCrossB.png", "tileTrackCrossB");

    this.load.image("../assets/sprites/tiles/tileTrackCurveA.png", "tileTrackCurveA");
    this.load.image("../assets/sprites/tiles/tileTrackCurveB.png", "tileTrackCurveB");

    this.load.image("../assets/sprites/tiles/tileTrackStraightA.png", "tileTrackStraightA");
    this.load.image("../assets/sprites/tiles/tileTrackStraightA.png", "tileTrackStraightA");
}

function update()
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

function loadLevel(levelIndex)
{
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
        gameObjectsCollection.board[boardTileIndex].setActive(false);
        gameObjectsCollection.board[boardTileIndex].setVisible(false);
    }

    gameObjectsCollection.board.length = 0;

    for (let projIndex = 0; projIndex < gameObjectsCollection.projectiles.length; projIndex++)
    {
        gameObjectsCollection.projectiles[projIndex].setActive(false);
        gameObjectsCollection.projectiles[projIndex].setVisible(false);
    }

    gameObjectsCollection.projectiles.length = 0;

    let level = LEVELS[levelIndex];
    //
}

window.addEventListener("load", main);