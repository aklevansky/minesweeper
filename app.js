import Minesweeper from './js/minesweeper';
import fieldTemplate from './resources/templates/field.html';
import polyfills from './js/polyfills';
import styles from './resources/css/styles.css';

// checking whether polyfills are necessary;
polyfills();

let options = {
	height: 9,
	width: 9,
	bombs: 10,
	template: fieldTemplate
};

let game = new Minesweeper(options);

// some additional actions for demo page

// !!! ATTENTION
// Global variable, but it's the easiest way to achieve the desired result
let USER_CLICK_COUNTER = 0;


let container = document.getElementById('minesweeper-container');
let messageContainer = document.getElementById('messageContainer');

container.appendChild(game.getEl());

// display a message if the user does not click on the START button
// and begins to click on the field instead
container.addEventListener('click', checkGameStatus);

function checkGameStatus(e) {

	if (e.target.closest('[data-type="start"]')) {

		container.removeEventListener('click', checkGameStatus);
		messageContainer.innerHTML = "";
		messageContainer.classList.remove('show');

		// display information if after playing the game the user tries to start a new on
		// without resetting the field
		container.addEventListener('FieldEvent', afterTheGame);


	} else if (e.target.closest('[data-type="game-field"]')) {
		messageContainer.innerHTML = "Press START button to start the game";
		messageContainer.classList.add('show');
	}
}

function startNewGameWarning(e) {

	// we don't call this event handler just after the user wins or loses the game. i.e. on his last click during the game
	if ( !USER_CLICK_COUNTER++ ) {	
		return;
	}

	if (e.target.closest('[data-type="reset"]')) {

		container.removeEventListener('click', startNewGameWarning);
		container.removeEventListener('FieldEvent', afterTheGame);
		container.addEventListener('click', checkGameStatus); // check, whether the user clicks on START button
		messageContainer.innerHTML = "";
		messageContainer.classList.remove('show');
		USER_CLICK_COUNTER = 0;	// resetting the global

	} else if (e.target.closest('[data-type="game-field"]') || e.target.closest('[data-type="start"]')) {
		messageContainer.innerHTML = "To start a new game reset the game field by pressing RESET, then press START";
		messageContainer.classList.add('show');
	}
}

function afterTheGame(e) {

	if (e.detail.type === 'win' || e.detail.type === 'lose') {
		container.addEventListener('click', startNewGameWarning);
	}

}