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

    this.load.image("../assets/sprites/tiles/tileTrackCurveLeftA.png", "tileTrackCurveLeftA");
    this.load.image("../assets/sprites/tiles/tileTrackCurveLeftB.png", "tileTrackCurveLeftB");

    this.load.image("../assets/sprites/tiles/tileTrackCurveRightA.png", "tileTrackCurveRightA");
    this.load.image("../assets/sprites/tiles/tileTrackCurveRightB.png", "tileTrackCurveRightB");

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

function createGameBoard()
{
    
}

window.addEventListener("load", main);