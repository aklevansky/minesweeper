import Game from './game';
import Timer from './timer';
import lodashTemplate from 'lodash.template';

export default class Minesweeper {
	constructor({
		width = 9,
		height = 9,
		bombs = 10,
		template = ''
	} = {}) {
		this._template = template;
		this.width = width;
		this.height = height;
		this.bombs = bombs;

		this.display = null;	// initialized further in _initialize();
		this._elem = Minesweeper.render({width, height, bombs, template}, true);
		


		// number of bombs
		this.numberOfBombs = bombs;
		// game field, initialized in startGame
		this.field = null;
		// add event handlers to the buttons
		this._initialize();

		// game engine
		this._game = null;
		// timer object
		this._timer = null;

		this.numberOfMoves = 0;

		 // saving functions with bind, so that we can remove event handlers easily
		 this.move = this._move.bind(this);
		 this.markMine = this._markMine.bind(this);
		 this.onFieldEvent = this._onFieldEvent.bind(this);
	}

	// if flag - true - returns a DOM-element (div), else - an HTML string;
	static render(options, flag = true) {

		let field = lodashTemplate(options.template)(options);

		if (flag) {
			let div = document.createElement('div');
			div.innerHTML = field;

			return div;
		}

		return field;
	}


	_initialize() {

		this.display = this._elem.querySelector('[data-type="bombs-remaining"]');

		this._elem.querySelector('[data-type="status"]').classList.add("js-searching");

		// event handlers for buttons
		let start = this._elem.querySelector('[data-type="start"]');
		let reset = this._elem.querySelector('[data-type="reset"]');

		// starting a game on a created field with given parameters
		start.addEventListener('click', this.startGame.bind(this));
		reset.addEventListener('click', this.resetGame.bind(this));

		// switch off default events for right mouse click
		this._elem.addEventListener('contextmenu', function(e){e.preventDefault(); return false;})
	}

	generateGameEvent(type, cell = 0, row = 0) {
		this._game.onFieldEvents(type, [cell, row]);

	}

	startGame() {
		if (this._game) {
			return;
		}

		this._game = new Game({
			width: this.width,
			height: this.height,
			bombs: this.bombs,
			field: this._elem
		});

		this._timer = new Timer(this._elem.querySelector('[data-type="clock"]'));
		this._timer.start();
		// game field
		this.field = this._elem.querySelector('[data-type="game-field"]');

		// user actions
		this.field.addEventListener('click', this.move);
		this.field.addEventListener('contextmenu', this.markMine);

		// Game object event
		this._elem.addEventListener('FieldEvent', this.onFieldEvent);
	}

	resetGame() {
		this._elem.innerHTML = Minesweeper.render({
			template: this._template,
			height: this.height,
			width: this.width,
			bombs: this.bombs
		}, false);
		this._field = null;
		this._game = null;
		this._timer = null;
		this.numberOfMoves = 0;
		this._initialize();
	}

	getEl() {
		return this._elem;
	}

	displayBombs(bombs) {
	
		if (!this.field) {
			return;
		}
		// if the total quantity of bombs is equal to the number of bombs -> we WON, and
		// js-flag class is applied, if not -> one bomb exploded and js-bomb class is applied
		let className = 'js-bomb';
		if (bombs.length === this.bombs) {
			className = 'js-flag';
		}

		bombs.forEach((bomb) => {
			this.field.rows[bomb[0]].cells[bomb[1]].classList.add(className);
		});
	}

	explode(cell) {
		this.field.rows[cell[0]].cells[cell[1]].classList.add('js-explosion');
	}

	// count - number of mines around the cell
	open(cell, count) {
		let td = this.field.rows[cell[0]].cells[cell[1]];

		td.classList.add('js-open');

		// if this cell was detected as potentially containing a mine
		if (td.classList.contains('js-presumed-mine')) {
			this._remainingMines += 1;
			td.classList.remove('js-presumed-mine');
		}

		if (count) {
			let display = td;

			// if some element exists inside TD, we write the text in the innermost element
			while (display.firstElementChild) {
				display = display.firstElementChild;
			}

			display.innerHTML = count;
		}
	}

	_gameOver() {
		this._timer.stop();
		this.field.removeEventListener('click', this.move);
		this.field.removeEventListener('contextmenu', this.markMine);
		this._elem.removeEventListener('FieldEvent', this.onFieldEvent);
	}

	win() {
		this._remainingMines = 0;
		this._elem.querySelector('[data-type="status"]').classList.remove("js-searching");
		this._elem.querySelector('[data-type="status"]').classList.add("js-winning");
		this._gameOver();
	}

	lose() {

		this._elem.querySelector('[data-type="status"]').classList.remove("js-searching");
		this._elem.querySelector('[data-type="status"]').classList.add("js-losing");
		let wrong = this.field.querySelectorAll('.js-presumed-mine:not(.js-bomb)');
		if (wrong.length) {
			Array.from(wrong).forEach( (cell) => {
				cell.classList.add('js-flag-wrong');
			});
		}
		this._gameOver();
	}

	_markMine(e) {

		let cell = e.target.closest('td');

		// leave open cells as they are
		if (!cell || cell.classList.contains('js-open')) {
			return;
		}

		if (cell.classList.contains('js-presumed-mine')) {
			this._remainingMines += 1;

		// check necessary to prevent mine counter going below zero
		} else if (!this._remainingMines) {

			return;
		} else {
			this._remainingMines -= 1;
		}

		cell.classList.toggle('js-presumed-mine');

		this.generateGameEvent('toggleMark', cell.cellIndex, cell.parentElement.rowIndex);

	}

	get _remainingMines() {
	
		if (!this.display) {
			return null;
		}

		return +this.display.innerHTML;
	}

	set _remainingMines(num) {

		if (!this.display) {
			return;
		}

		this.display.innerHTML = num;
	}

	_move(e) {
		let cell = e.target.closest('td');

		if (!cell) {
			return false;
		}

		if (cell.classList.contains('js-presumed-mine')) {
			return false;
		}

		this.numberOfMoves++;
		this.generateGameEvent('move', cell.cellIndex, cell.parentElement.rowIndex);
	}

	_onFieldEvent(e) {

		if (e.detail.type in this) {
			this[e.detail.type](e.detail.cells, e.detail.count);
		}
	}
}