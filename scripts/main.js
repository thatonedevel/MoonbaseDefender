// object for game states
let GameStates = 
{
    TITLE: 0,
    GAME_OVER: 1,
    PAUSED: 2,
    PLAYING: 3,
    SELECTING_LEVEL: 4
};

let buildableGhost;

const COLUMNS = 16;
const ROWS = 9;
let currentGameState = GameStates.PLAYING;


// input object
const MoonbaseInput = 
{
    mouse: null,
    directionKeys: null,
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
        width: 1024,
        height: 576,
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
    // add input maps to game input object
    MoonbaseInput.mouse = this.input.activePointer;
    MoonbaseInput.directionKeys = this.input.createCursorKeys();
    // set game state to playing
    currentGameState = GameStates.PLAYING;
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

    this.load.image("tileTrackCrossA", "../assets/sprites/tiles/tileTrackCrosszA.png");
    this.load.image("tileTrackCrossB", "../assets/sprites/tiles/tileTrackCrossB.png");

    this.load.image("tileTrackCurveA", "../assets/sprites/tiles/tileTrackCurveA.png");
    this.load.image("tileTrackCurveB", "../assets/sprites/tiles/tileTrackCurveB.png");

    this.load.image("tileTrackStraightA", "../assets/sprites/tiles/tileTrackStraightA.png");
    this.load.image("tileTrackStraightB", "../assets/sprites/tiles/tileTrackStraightB.png");

    // buildables
    this.load.image("solarPanel", "../assets/sprites/buildables/solarpanel.png");
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

    // input
    if (currentGameState == GameStates.PLAYING)
    {

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