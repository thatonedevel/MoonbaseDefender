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

// testing flag
//let hasEnemySpawned = false;

// sprites
const SPRITE_SOLAR_PANEL_KEY = "solarPanel";
const SPRITE_BASIC_TURRET_KEY = "basicTurret";
const SPRITE_SHIELD_GENERATOR_KEY = "shieldGenerator";
const SPRITE_HOLOFENCE_KEY = "holoFence";
const SPRITE_ENERGY_KEY = "energy";
const SPRITE_BULLET_KEY = "bullet";
const SPRITE_AREA_KEY = "area";

// animations
const ANIMATION_ENERGY_PRODUCE_KEY = "energyProduce";
const ANIMATION_TURRET_FIRE_KEY = "turretFire";
const ANIMATION_BASIC_ENEMY_DAMAGE = "basicEnemyDamage";

// custom events
const EVENTS_ENEMY_DEATH = "enemyDeath";
const EVENTS_BUILDABLE_DEATH = "buildableDeath";

// enemy keys
const ENEMIES_BASIC_ENEMY = "basicEnemy";

// enemies selection per level
const ENEMIES_MAP = 
{
    levels:
    [
        {
            ENEMIES: [{name:ENEMIES_BASIC_ENEMY, weight: 100}],
            SPAWN_COOLDOWN: 5
        }
    ],

    getEnemy(level)
    {
        key = null;
        let roll = Math.floor(Math.random() * 100) // 0-99;
        for (let enemyIndex = 0; enemyIndex < this.levels[level].ENEMIES.length; enemyIndex++)
        {
            if (this.levels[level].ENEMIES[enemyIndex].weight > roll)
            {
                key = this.levels[level].ENEMIES[enemyIndex].name;
                break;
            }
        }

        return key;
    },

    getNextSpawnTime(level)
    {
        return this.levels[level].SPAWN_COOLDOWN + (gameData.applicationTime) / 1000;
    }
};

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
    EAST: 0,
    SOUTH: 1,
    WEST: 2,
    NORTH: 3
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
    effectAreas: [],
    shields: [],
    energyReadout: null,
    alertBanner: null
};

const gameData = 
{
    score: 0,
    highscore: 0,
    energyStored: 25,
    bannerEnableTime: 0,
    BANNER_DURATION: 3000,
    level: 1,
    nextEnemySpawnTime: -10,
    spawnLocations: [],
    deltaTime: 0,
    applicationTime: 0,
    mouseOverUI: false,
    gameOver: false
};

// score update event listeners
function raiseScore(duration, enemyTier)
{
    let enemDuration = duration;
    if (enemDuration === 0)
        enemDuration = 1;
    // duration will be ms, divide this by 1000, floor it, and add a base value of 100
    // multiplier of 1.x is applied, where x is enemy tier
    let base = 100;
    let sc = base + (1000 / enemDuration);
    let multiplier = 1.0 + (enemyTier / 10);
    sc *= multiplier;
    gameData.score += Math.round(sc); // round score to closest int since floats and ints are under one type
}

function lowerScore(penalty)
{
    let pointsDeduction = Math.round(penalty * (1.0 + Math.random()));
    if (gameData.score - pointsDeduction < 0)
    {
        gameData.score = 0;
    }
    else
    {
        gameData.score -= pointsDeduction;
    }
}

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
        },
        physics: 
        {
            default: "arcade", // omg arcade ganon hiiii!!!
            arcade:
            {
                gravity: 0,
                debug: false
            }
        }
    };

    // create phaser game
    let moonbaseDefender = new Phaser.Game(config);
}

// game functions
function _create()
{
    // cap update rate at 60
    this.physics.world.setFPS(60); // https://phaser.discourse.group/t/different-game-speed-depending-on-monitor-refresh-rate/7231/2
    // create base game objects
    loadLevel(gameData.level - 1, this);
    // add input maps to game input object
    MoonbaseInput.mouse = this.input.activePointer;
    MoonbaseInput.directionKeys = this.input.keyboard.createCursorKeys();
    // set game state to playing
    currentGameState = GameStates.PLAYING;
    buildableGhost = new BuildableGhost(this, SPRITE_SOLAR_PANEL_KEY, 32, 32);
    // add the buttons for creating the buildables
    // create game animations
    this.anims.create({key:ANIMATION_ENERGY_PRODUCE_KEY, frames:SPRITE_SOLAR_PANEL_KEY, frameRate:6});
    this.anims.create({key:ANIMATION_BASIC_ENEMY_DAMAGE, frames:ENEMIES_BASIC_ENEMY, frameRate:6});
    this.anims.create({key:ANIMATION_TURRET_FIRE_KEY, frames:SPRITE_BASIC_TURRET_KEY, frameRate:24});

    // buildables gui
    gameObjectsCollection.buildableButtons.push(new MButton(this, "Solar Panel (/25)", {fontFamily:"Arial", color:"#FFFFFF", fontSize:16}, 64, 540, [createSolarPanel]));
    gameObjectsCollection.buildableButtons.push(new MButton(this, "Basic Turret (/75)", {fontFamily: "Arial", color:"#FFFFFF", fontSize:16}, 200, 540, [createBasicTurret]));
    gameObjectsCollection.buildableButtons.push(new MButton(this, "Shield Generator (/50)", {fontFamily: "Arial", color:"#FFFFFF", fontSize:16}, 340, 540, [createShieldGenerator]));
    gameObjectsCollection.buildableButtons.push(new MButton(this, "HoloFence (/50)", {fontFamily: "Arial", color:"#FFFFFF", fontSize:16}, 515, 540, [createHoloFence]));

    gameObjectsCollection.energyReadout = this.add.text(925, 15, "Energy: 0", {fontSize:16, fontFamily:"Arial", backgroundColor:"#333333", padding:{x:5, y:5}, align:"center"});
    gameObjectsCollection.alertBanner = this.add.text(0, 525, "Insufficient Energy", {fontSize:16, fontFamily:"Arial", backgroundColor:"#bc1b1b", padding:{x:450, y:5}, align:"center"}).setAlpha(0.75).setActive(false).setVisible(false);

    // set up score events
    this.events.on(EVENTS_BUILDABLE_DEATH, lowerScore);
    this.events.on(EVENTS_ENEMY_DEATH, raiseScore);
}

function enableBanner()
{
    gameData.bannerEnableTime = gameData.applicationTime;
    gameObjectsCollection.alertBanner.setActive(true);
    gameObjectsCollection.alertBanner.setVisible(true);
    gameObjectsCollection.alertBanner.setAlpha(0.75);
}

function updateBanner()
{
    if (gameObjectsCollection.alertBanner.active)
    {
        if (gameData.applicationTime - gameData.bannerEnableTime >= gameData.BANNER_DURATION)
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
            let enabledDuration = gameData.applicationTime - gameData.bannerEnableTime;

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
    this.load.image(SPRITE_HOLOFENCE_KEY, "../assets/sprites/buildables/holofence.png");
    this.load.image(SPRITE_SHIELD_GENERATOR_KEY, "../assets/sprites/buildables/shieldGenerator.png");
    
    // enemies
    this.load.spritesheet(ENEMIES_BASIC_ENEMY, "../assets/sprites/enemies/basicufo.png", {frameWidth:128, frameHeight:128, startFrame:0, endFrame:2});
    
    // other
    this.load.image(SPRITE_ENERGY_KEY, "../assets/sprites/energy.png");
    this.load.image(SPRITE_BULLET_KEY, "../assets/sprites/bullet.png");
    this.load.image(SPRITE_AREA_KEY, "../assets/sprites/area.png");
}

function _update(time, delta)
{
    gameData.deltaTime = delta;
    gameData.applicationTime = time;
    // main game loop goes here
    // call update on all game objects
    for (let i = 0; i < gameObjectsCollection.turrets.length; i++)
    {
        gameObjectsCollection.turrets[i].updateObj();
    }

    for (let i = 0; i < gameObjectsCollection.enemies.length; i++)
    {
        gameObjectsCollection.enemies[i].updateObj();
    }

    for (let i = 0; i < gameObjectsCollection.projectiles.length; i++)
    {
        gameObjectsCollection.projectiles[i].updateObj();
    }

    for (let i = 0; i < gameObjectsCollection.energyObjects.length; i++)
    {
        gameObjectsCollection.energyObjects[i].updateObj();
    }

    // input
    if (currentGameState === GameStates.PLAYING)
    {
        if (gameData.nextEnemySpawnTime === -10)
        {
            gameData.nextEnemySpawnTime = (gameData.applicationTime / 1000) + 10; // seconds until next enemy spawn
        }
        else if (gameData.nextEnemySpawnTime <= gameData.applicationTime / 1000)
        {
            // enemy needs to be spawned
            let loc = gameData.spawnLocations[Math.floor(Math.random() * gameData.spawnLocations.length)];
            let key = ENEMIES_MAP.getEnemy(gameData.level - 1);
            let enemy = EnemiesFactory.createEnemy(key, this, loc.spawnRow, loc.spawnCol);
            // add enemy to the enemies array
            gameObjectsCollection.enemies.push(enemy);

            // set next spawn time
            gameData.nextEnemySpawnTime = ENEMIES_MAP.getNextSpawnTime(gameData.level - 1);
            //hasEnemySpawned = true;
        }

        buildableGhost.updateObj();
        updateBanner();
    }

    // update high score
    if (gameData.score > gameData.highscore)
    {
        gameData.highscore = gameData.score;
    }

    gameObjectsCollection.energyReadout.setText("Energy: " + gameData.energyStored.toString());
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