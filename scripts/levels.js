/*
    -Levels should cover the full screen
    - Consist of 32x32px tiles
    - Levels will be in a 16:9 ratio
    - Leave an extra 32 px at the top for GUI
    - 1 = enemy spawns
    - 2 - 13 track for enemies
    - 0 = placeable turret space
    - MORE WILL BE ADDED


    COMPASS HEADINGS:
    straight tiles:
    2 - NORTH
    3 - EAST
    4 - SOUTH
    5 - WEST

    curves:
    6 - SOUTH TO WEST
    7 - WEST TO NORTH
    8 - NORTH TO EAST
    9 - EAST TO SOUTH
    10 - WEST TO SOUTH
    11 - NORTH TO WEST
    12 - EAST TO NORTH
    13 - SOUTH TO EAST
*/

const LEVELS = [
    [
        [0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,4,0,0,0,0,0,0,0,13,3,3,3,9,0,0],
        [0,8,9,0,0,0,0,0,0,2,0,0,0,4,0,0],
        [0,0,4,0,0,0,0,0,0,2,0,0,0,4,0,0],
        [0,0,8,3,3,9,0,0,0,2,0,0,0,4,0,0],
        [0,0,0,0,0,4,0,0,0,2,0,0,0,4,0,0],
        [0,0,0,0,0,8,3,3,3,12,0,0,0,4,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0]
    ]
];