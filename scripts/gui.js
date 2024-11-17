const { Game } = require("phaser");

function createBasicTurret()
{
    buildableGhost.enable("basicTurret")
}

function createSolarPanel()
{
    buildableGhost.enable("solarPanel");
}

function createShieldGenerator()
{
    buildableGhost.enable("shieldGenerator");
}

function togglePause()
{
    if (currentGameState == GameStates.PAUSED)
    {
        currentGameState = GameStates.PLAYING;
    }
    else if (currentGameState == GameStates.PLAYING)
    {
        currentGameState = GameStates.PAUSED;
    }
}