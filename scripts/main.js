// object for game states
GameStates = 
{
    TITLE: 1,
    GAMEOVER: 2
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