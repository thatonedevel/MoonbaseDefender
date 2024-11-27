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

// object for game states
const GameStates = 
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
const gameObjectsCollection = 
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
    deltaTime: 0
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
    MoonbaseInput.directionKeys = this.input.keyboard.createCursorKeys();
    // set game state to playing
    currentGameState = GameStates.PLAYING;
    buildableGhost = new BuildableGhost(this, "solarPanel", 32, 32);
    // add the buttons for creating the buildables
    gameObjectsCollection.buildableButtons.push(new MButton(this, "Solar Panel (/25)", {fontFamily:"Arial", color:"#FFFFFF", fontSize:16}, 64, 550, [createSolarPanel]));
    gameObjectsCollection.buildableButtons.push(new MButton(this, "Basic Turret (/75)", {fontFamily: "Arial", color:"#FFFFFF", fontSize:16}, 200, 550, [createBasicTurret]));
    gameObjectsCollection.energyReadout = this.add.text(800, 50, "Energy: 0", {fontSize:16, fontFamily:"Arial", backgroundColor:"#333333", padding:{x:5, y:5}, align:"center"});
    gameObjectsCollection.alertBanner = this.add.text(0, 525, "[ALERT]", {fontSize: 16, fontFamily: "Arial", backgroundColor: "#ea1111", color:"#FFFFFF", padding:{x:500, y:10}, align:"center"}).setAlpha(0.75);
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

    // other
    this.load.image("energy", "../assets/sprites/energy.png");
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

    // input
    if (currentGameState == GameStates.PLAYING)
    {
        buildableGhost.update();
    }




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

window.addEventListener("load", main);