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

function createBasicTurret()
{
    console.log("request for basic turret");
    if (gameData.energyStored >= BasicTurret.cost)
    {
        buildableGhost.enable("basicTurret");
    }
    else
    {
        enableBanner();
        console.log("insufficient energy");
    }
}

function createSolarPanel()
{
    console.log("request for solar panel");
    if (gameData.energyStored >= SolarPanel.cost)
        buildableGhost.enable("solarPanel");
    else
        console.log("insufficient energy");
}

function createShieldGenerator()
{
    console.log("request for shield generator");
    if (gameData.energyStored >= ShieldGenerator.cost)
        buildableGhost.enable("shieldGenerator");
    else
        console.log("insufficient energy");
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

class AlertBanner extends Phaser.GameObjects.Text
{

    #fadeOutEnabled = false;
    #fadeOutDuration = 1;
    #originalAlpha = 1;
    #deltaAlpha = 0;
    #bannerRect = null;
    constructor(scene, xPos, yPos, msg, style={
        fontSize:16,
        fontFace:"Arial",
        color:"#FFFFFF",
        padding:{x:0, y:10},
        align:"center"
    })
    {
        /**
         * An alert banner that disappears after a given time, with optional fading
         */
        super(scene, xPos, yPos, msg, style);
        this.setActive(false);
        this.setVisible(false);
        this.#originalAlpha = this.alpha;
        this.#bannerRect = scene.add.rectangle(xPos, yPos, 1024, this.displayHeight, style.color, this.alpha);
        this.#bannerRect.setActive(false);
        this.#bannerRect.setVisible(false);
        // calculate delta alpha for fadeout
        this.#deltaAlpha = this.#originalAlpha / this.#fadeOutDuration;
        this.setDepth(1);
    }

    enable(duration, fadeOut=false, message=null)
    {
        if (fadeOut)
        {
            this.#fadeOutDuration = duration;
            this.#deltaAlpha = this.#originalAlpha / this.#fadeOutDuration;
        }
        else
        {
            this.#fadeOutDuration = 0;
        }

        this.#fadeOutEnabled = fadeOut;

        if (message !== null)
        {
            this.setText(message);
        }
            
        this.setVisible(true);
        this.setActive(true);
        this.#bannerRect.setActive(true);
        this.#bannerRect.setVisible(true);
        this.scene.time.addEvent({delay:duration, callback:this.#disable});
    }

    update()
    {
        if (this.active && this.visible)
        {
            if (this.#fadeOutEnabled)
            {
                // banner should fade over time
                this.setAlpha(this.alpha - this.#deltaAlpha);
                this.#bannerRect.setAlpha(this.alpha - this.#deltaAlpha);
            }
        }
    }

    setBannerAlpha(newVal)
    {
        this.#originalAlpha = newVal;
        //this.#bannerRect.setAlpha(newVal);
        this.setAlpha(newVal);
        return this;
    }

    #disable()
    {
        super.setActive(false); // WHY IS THIS NOT A FUNCTION PHASER WHAT DO YOU MEAN PLEASE
        super.setVisible(false);
        // reset alpha
        super.setAlpha(this.#originalAlpha);
        this.#bannerRect.setVisible(false);
        this.#bannerRect.setActive(false);

    }
}