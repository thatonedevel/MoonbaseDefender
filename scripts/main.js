// object for game states
let GameStates = 
{
    TITLE: 1,
    GAMEOVER: 2
};

// all gameobjects are to be stored here
let gameObjectsCollection = 
{
    
};

function main()
{
    let config = 
    {
        width: 800,
        height: 600,
        scence: 
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
}

function update()
{
    // main game loop goes here
}

window.addEventListener("load", main);