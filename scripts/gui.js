function createBasicTurret()
{
    console.log("request for basic turret");
    buildableGhost.enable("basicTurret")
}

function createSolarPanel()
{
    console.log("request for solar panel");
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

// gui classes
class MButton extends Phaser.GameObjects.Text
{
    #clickCol = "";
    #hoverCol = "";
    #standardCol = "";
    #onClickListeners = [];

    constructor(scene, msg, msgConfig, xPos, yPos, callbacks = [], backgroundCol = "#333333", hoverCol = "#545454", clickCol = "#808080")
    {
        // all listeners given to the button will recieve a reference to the pointer that triggered the event
        super(scene, xPos, yPos, msg, msgConfig);
        scene.add.existing(this);
        this.setInteractive();
        this.#standardCol = clickCol;
        this.#hoverCol = hoverCol;
        this.#standardCol = backgroundCol;
        this.setBackgroundColor(backgroundCol);

        // loop through callbacks and add them to the pointerdown event
        for (let ind = 0; ind < callbacks.length; ind++)
        {
            this.#onClickListeners.push(callbacks[ind]);
        }
        console.log("Total callbacks on Button '" + msg + "':", this.#onClickListeners.length);

        // add updates for hover, click etc
        this.on("pointerdown", this.#onClick);
        this.on("pointerover", ()=>{this.#updateCol(2);});
        this.on("pointerout", ()=>{this.#updateCol(1);});
    }

    setStandardCol(newCol)
    {
        this.#standardCol = newCol;
    }

    setHoverCol(newCol)
    {
        this.#hoverCol = newCol;
    }

    setClickCol(newCol)
    {
        this.#clickCol = newCol;
    }

    addOnClick(callback)
    {
        this.on("pointerdown", callback);
    }

    #updateCol(updateType)
    {
        // updateType values:
        // 1 - standard (background colour)
        // 2 - hover
        // 3 - click
        switch (updateType)
        {
            case 1:
                this.setBackgroundColor(this.#standardCol);
                break;
            case 2:
                this.setBackgroundColor(this.#hoverCol);
                break;
            case 3:
                this.setBackgroundColor(this.#clickCol);
                break;
        }
    }

    #onClick(pointer, currentlyOver = [])
    {
        // check if this gameobject is in the currentlyOver array
        // time complexity O(n)
        console.log("Button clicked");
        for (let listener = 0; listener < this.#onClickListeners.length; listener++)
        {
            this.#onClickListeners[listener](pointer);
        }
    }

    enable()
    {
        this.setActive(false);
        this.setVisible(false);
    }

    disable()
    {
        this.setVisible(false);
        this.setActive(false);
    }
}