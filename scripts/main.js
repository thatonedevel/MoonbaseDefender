/*
MoonbaseDefender - An open source Tower-Defence game made using Phaser 3 (https://www.phaser.io/)
Copyright (C) 2025 Nora Dwelly

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>
*/

// sprites
const SPRITE_SOLAR_PANEL_KEY = "solarPanel";
const SPRITE_BASIC_TURRET_KEY = "basicTurret";
const SPRIRE_SHIELD_GENERATOR_KEY = "shieldGenerator";
const SPRITE_ENERGY_KEY = "energy";

// animations
const ANIMATION_ENERGY_PRODUCE_KEY = "energyProduce";
const ANIMATION_TURRET_FIRE_KEY = "turretFire";

// object for game states
const GameStates = 
{
    TITLE: 0,
    GAME_OVER: 1,
    PAUSED: 2,
    PLAYING: 3,
    SELECTING_LEVEL: 4
};

const COMPASS_HEADINGS = 
{
    NORTH: 0,
    SOUTH: 1,
    EAST: 2,
    WEST: 3
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
const gameObjectsCollection = 
{
    turrets: [],
    enemies: [],
    energyObjects: [],
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
    projectiles: [],
    buildableButtons: [],
    energyReadout: null,
    alertBanner: null
};

const gameData = 
{
    score: 0,
    highscore: 0,
    energyStored: 25,
    deltaTime: 0,
    bannerEnableTime: 0,
    BANNER_DURATION: 3000
};

function main()
{
    BuildablesFactory.initBuildableFactory();
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
    MoonbaseInput.directionKeys = this.input.keyboard.createCursorKeys();
    // set game state to playing
    currentGameState = GameStates.PLAYING;
    buildableGhost = new BuildableGhost(this, SPRITE_SOLAR_PANEL_KEY, 32, 32);
    // add the buttons for creating the buildables
    // create game animations
    this.anims.create({key:ANIMATION_ENERGY_PRODUCE_KEY, frames:"solarPanel", frameRate:6});

    gameObjectsCollection.buildableButtons.push(new MButton(this, "Solar Panel (/25)", {fontFamily:"Arial", color:"#FFFFFF", fontSize:16}, 64, 540, [createSolarPanel]));
    gameObjectsCollection.buildableButtons.push(new MButton(this, "Basic Turret (/75)", {fontFamily: "Arial", color:"#FFFFFF", fontSize:16}, 200, 540, [createBasicTurret]));
    gameObjectsCollection.energyReadout = this.add.text(925, 15, "Energy: 0", {fontSize:16, fontFamily:"Arial", backgroundColor:"#333333", padding:{x:5, y:5}, align:"center"});
    gameObjectsCollection.alertBanner = this.add.text(0, 525, "Insufficient Energy", {fontSize:16, fontFamily:"Arial", backgroundColor:"#bc1b1b", padding:{x:450, y:5}, align:"center"}).setAlpha(0.75);
}

function enableBanner()
{
    gameData.bannerEnableTime = Date.now();
    gameObjectsCollection.alertBanner.setActive(true);
    gameObjectsCollection.alertBanner.setVisible(true);
    gameObjectsCollection.alertBanner.setAlpha(0.75);
}

function updateBanner()
{
    if (gameObjectsCollection.alertBanner.active)
    {
        if (Date.now() - gameData.bannerEnableTime >= gameData.BANNER_DURATION)
        {
            gameObjectsCollection.alertBanner.setActive(false);
            gameObjectsCollection.alertBanner.setVisible(false);
            gameObjectsCollection.alertBanner.setAlpha(0.75);
            gameData.bannerEnableTime = 0;
        }
        else
        {
            let fullTransparency = 0.75;
            // determine % of duration passed and map that onto the alpha value
            let enabledDuration = Date.now() - gameData.bannerEnableTime;

            let newTransparency = fullTransparency - (enabledDuration / gameData.BANNER_DURATION);
            gameObjectsCollection.alertBanner.setAlpha(newTransparency);
        }
    }
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
    //this.load.image("solarPanel", "../assets/sprites/buildables/solarpanel.png");
    this.load.spritesheet(SPRITE_SOLAR_PANEL_KEY, "../assets/sprites/buildables/solarpanel.png", {frameWidth:128, frameHeight:128, startFrame:0, endFrame:2});
    this.load.spritesheet(SPRITE_BASIC_TURRET_KEY, "../assets/sprites/buildables/turret_sheet.png", {frameWidth:68, frameHeight:128, startFrame:0, endFrame:8});
    // other
    this.load.image(SPRITE_ENERGY_KEY, "../assets/sprites/energy.png");
}

function _update()
{
    let deltaStart = Date.now();
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

    for (let i = 0; i < gameObjectsCollection.energyObjects.length; i++)
    {
        gameObjectsCollection.energyObjects[i].update();
    }

    // input
    if (currentGameState == GameStates.PLAYING)
    {
        buildableGhost.update();
        updateBanner();
    }

    gameObjectsCollection.energyReadout.setText("Energy: " + gameData.energyStored.toString());
    // delta time calculation, ran at the end of every frame
    gameData.deltaTime = (Date.now() - deltaStart) / 1000;
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

function swapArrElems(arr, indA, indB)
{
    let tmp = arr[indA];
    arr[indA] = arr[indB];
    arr[indB] = tmp; 
}

window.addEventListener("load", main);