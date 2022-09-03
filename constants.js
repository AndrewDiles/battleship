const INITIAL_HORIZONTAL_AND_SUNK = {horizontal: true, sunk: false}
const INITIAL_SHIP_INFO = [
	{name: "Carrier", length: 5, row :1, col:1, url: "url(./assets/carrier.png)", ...INITIAL_HORIZONTAL_AND_SUNK},
	{name: "Battleship", length: 4, row :2, col:1, url: "url(./assets/battleship.png)", ...INITIAL_HORIZONTAL_AND_SUNK},
	{name: "Destroyer", length: 3, row :3, col:1, url: "url(./assets/destroyer.png)", ...INITIAL_HORIZONTAL_AND_SUNK},
	{name: "Submarine", length: 3, row :4, col:1, url: "url(./assets/submarine.png)", ...INITIAL_HORIZONTAL_AND_SUNK},
	{name: "Patrol", length: 2, row :5, col:1, url: "url(./assets/patrol.png)", ...INITIAL_HORIZONTAL_AND_SUNK},
];

// BOOL depending on whether or not device used has touch functionality
// needed for drag events
const TOUCH_DEVICE =  (('ontouchstart' in window) ||  
    (navigator.maxTouchPoints > 0) ||  
    (navigator.msMaxTouchPoints > 0));  

const INITIAL_GAME_STATE = {
	gameOver: false, // will contain 1 or 2 for who won the player
	turn: 1,
	activePlayer: 1,
	isShooting: true,
	player1Name: null,
	player2Name: null,
	shipsPlaced: false,
	shipInfo : {
		1 : [...INITIAL_SHIP_INFO],
		2 : [...INITIAL_SHIP_INFO]
	},
	shotLocations : {
		1: [],
		2: []
	}
}

// HTML ELEMENTS
const INSTRUCTIONS_ELEMENT = document.getElementById("instructions");
const OVERLAY_ELEMENT = document.getElementById("overlay");
const PLAYER_1_VIEW_ELEMENT = document.getElementById("player-1-view");
const PLAYER_2_VIEW_ELEMENT = document.getElementById("player-2-view");
const MAIN = document.querySelector("main");

const ERROR_TIME = 500;

const INITIAL_INSTRUCTIONS = "Please enter your names and being the game";
const DEFAULT_FIRE_BUTTON_TEXT = "Select Target"
const MISS_INDICATION = "Miss - Next Turn"
const HIT_INDICATION = " Hit! - Next Turn"
const SUNK_INDICATION = " Sunk! - Next Turn"
const START_NEW_GAME_MESSAGE = "Start New Game"