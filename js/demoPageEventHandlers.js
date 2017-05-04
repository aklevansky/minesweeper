export default () => {

	// Module not necessary for the app
	// Contains event handlers for demo page: display warning messages to the user
	// three main event handlers: 
	// beforeGameStarts
	// duringGameReset
	// afterGameEnds + additional afterGameWarning handler

	const appContainer = document.getElementById('minesweeper-container');
	const messageContainer = document.getElementById('messageContainer');

	const START_BUTTON_MESSAGE = 'Press START button to start the game';
	const RESET_FIELD_MESSAGE = "To start a new game reset the game field by pressing RESET, then press START";

	// display a message if the user does not click on the START button
	// and begins to click on the field instead
	appContainer.addEventListener('click', beforeGameStarts);

	/*
	User should start the game by clicking on START button
	if they click anywhere else on the game field - display a hing
	*/
	function beforeGameStarts(e) {

		if (e.target.closest('[data-type="start"]')) { // click on the start button

			appContainer.addEventListener('click', duringGameReset);
			messageContainer.innerHTML = "";
			messageContainer.classList.remove('show');

			// display information if after playing the game the user tries to start a new on
			// without resetting the field
			appContainer.addEventListener('FieldEvent', afterGameEnds);
			appContainer.removeEventListener('click', beforeGameStarts);


		} else if (e.target.closest('[data-type="game-field"]')) {
			messageContainer.innerHTML = START_BUTTON_MESSAGE;
			messageContainer.classList.add('show');
		}
	}



	function afterGameEnds(e) {

		// ATTENTION! First click on the field after game end event is fired should be ignored (it's user's final move) =>
		// => create a closure to store a counter
		if (e.detail.type === 'win' || e.detail.type === 'lose') {

			appContainer.removeEventListener('FieldEvent', afterGameEnds);
			appContainer.removeEventListener('click', duringGameReset);

			(() => {
				let User_Click_Counter = 0;
				appContainer.addEventListener('click', startNewGameWarning);

				function startNewGameWarning(e) {

					// we don't call this event handler just after the user wins or loses the game. i.e. on his last click during the game
					if (!User_Click_Counter++) {
						return;
					}

					if (e.target.closest('[data-type="reset"]')) {

						appContainer.removeEventListener('click', startNewGameWarning);
						appContainer.addEventListener('click', beforeGameStarts); // check, whether the user clicks on START button
						messageContainer.innerHTML = "";
						messageContainer.classList.remove('show');

					} else if (e.target.closest('[data-type="game-field"]') || e.target.closest('[data-type="start"]')) {
						messageContainer.innerHTML = RESET_FIELD_MESSAGE;
						messageContainer.classList.add('show');
					}
				}

			})();
		}

	}

	function duringGameReset(e) {

		if (e.target.closest('[data-type="reset"]')) { // click on the reset button
			appContainer.removeEventListener('click', afterGameEnds);
			appContainer.removeEventListener('click', duringGameReset);
			appContainer.addEventListener('click', beforeGameStarts);
		}
	}

}