import Minesweeper from './js/minesweeper';
import fieldTemplate from './resources/templates/field.html';
import polyfills from './js/polyfills';
import styles from './resources/css/styles.css';
import demoPageEventHandlers from './js/demoPageEventHandlers';

// checking whether polyfills are necessary;
polyfills();

let options = {
	height: 9,
	width: 9,
	bombs: 10,
	template: fieldTemplate
};

let game = new Minesweeper(options);
document.getElementById('minesweeper-container').appendChild(game.getEl());

// adding some additional functionality for the demo page
demoPageEventHandlers();