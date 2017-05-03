export default class Game {
	constructor(options) {
		this.width = options.width;
		this.height = options.height;
		this.bombs = [];
		this.numberOfBombs = options.bombs;
		// number of open cells
		this._openCells = new Set();
		// cells where user thinks mines are located
		this._userSelected = new Set();
		this._field = options.field;
	}

	/**
	 * game engine (data model) for Minesweeper game
	 * @param  {string} type      type of event
	 * @param  {array} cellIndex  cell index [x,y] 
	 */
	onFieldEvents(type, cellIndex = -1) {

		// if there is a second parameter, calculate its number from coordinates
		if (Array.isArray(cellIndex)) {
			cellIndex = this.indexToNumber(cellIndex);
		}

		if (type === 'move') {

			if (!this.bombs.size) {
				this.bombs = this.createBombs({
					width: this.width,
					height: this.height,
					bombs: this.numberOfBombs
				}, cellIndex);
			}

			this.analyze(cellIndex);

		} else if (type === 'toggleMark') {

			if (!this._userSelected.has(cellIndex)) {
				this._userSelected.add(cellIndex);
			} else {
				this._userSelected.delete(cellIndex);
			}
		}
	}

	generateFieldEvent(type, cells = null, count = 0) {

		// custom event types: openCell, displayBombs

		let fieldEvent = new CustomEvent('FieldEvent', {
			detail: {
				type: type,
				cells: cells,
				count: count
			},
			bubbles: true
		});

		this._field.dispatchEvent(fieldEvent);

		if (type === 'open') {

			if (this._openCells.size === this.width * this.height - this.numberOfBombs) {
				this.displayBombs();
				this.generateFieldEvent('win');
			}
		}

	}

	createBombs(options, cellIndex = -1) {

		let numberOfCells = options.width * options.height;

		// every number in set is unique,
		// so it's easy to filter duplicates 
		// (size of the field is not big, so is potential performance loss at initialization)
		// first item in cell is the first cell clicked, and it is deleted from the set before it is returned
		// as the very first cell can't have a mine
		let cellNumbers = new Set();	// constructor with iterable new Set([cellIndex]); not supported in IE
		cellNumbers.add(cellIndex);

		while (cellNumbers.size <= options.bombs) {

			// random number from 0 to numberOfCells - 1
			let cellWithMine = Math.floor(Math.random() * numberOfCells);
			cellNumbers.add(cellWithMine);
		}

		cellNumbers.delete(cellIndex);
		return cellNumbers;
	}

	displayBombs() {


		let cells = [];

		this.bombs.forEach((bomb) => {
			cells.push(this.numberToIndex(bomb));
		});

		this.generateFieldEvent('displayBombs', cells);
	}

	indexToNumber(arr) {
		return this.width * arr[1] + arr[0];
	}

	numberToIndex(num) {
		// ^0 отсекает дробную часть от числа
		let row = (num / this.height) ^ 0;
		let cellIndex = num % this.width;

		return [row, cellIndex];
	}


	analyze(num = -1) {

		// check for errors
		if (num === -1) {
			return;
		}

		if (this.bombs.has(num)) {
			// sending information about explosion
			this.generateFieldEvent('explode', this.numberToIndex(num));
			// sending remaining mines, deleting the exploded one
			this.bombs.delete(num);
			this.displayBombs();
			this.generateFieldEvent('lose');
			return;
		}

		let adjacent = this.getAdjacent(num);
		let count = this.bombCount(adjacent);

		this._openCells.add(num);
		// cell - cell number, count - number of mines around (to display in cell innerHTML)
		this.generateFieldEvent('open', this.numberToIndex(num), count);

		if (count === 0) {
			adjacent.forEach( (cell) => {

				if (!this._openCells.has(cell) && !this._userSelected.has(cell)) {
					this.analyze(cell);
				}
			})
		}
	}

	// returns and array of cells (cell numbers) around the cell number 'num'
	getAdjacent(num) {
		let numberOfCells = this.width * this.height;

		let flagTop = false;
		let flagBottom = false;

		let adjacent = [];

		let a = num - this.width;
		if (a < 0) {
			a = null;
			flagTop = true;
		}

		let b = num + this.width;
		if (b >= numberOfCells) {
			b = null;
			flagBottom = true;
		}

		[a, b].forEach((cell) => {
			if (cell !== null) {
				adjacent.push(cell);
			}
		});

		if ((num % this.width)) {
			getLeft.call(this, adjacent, num);
		}

		if ((num % this.width !== this.width - 1)) {
			getRight.call(this, adjacent, num);
		}

		return adjacent;

		function getLeft(arr, num) {
			let a, b, c;

			flagTop ? a = null : a = num - this.width - 1;
			b = num - 1;
			flagBottom ? c = null : c = num + this.width - 1;

			[a, b, c].forEach((cell) => {
				if (cell !== null) {
					arr.push(cell);
				}
			});
		}

		function getRight(arr, num) {
			let a, b, c;

			flagTop ? a = null : a = num - this.width + 1;
			b = num + 1;
			flagBottom ? c = null : c = num + this.width + 1;

			[a, b, c].forEach((cell) => {
				if (cell !== null) {
					arr.push(cell);
				}
			});
		}
	}

	bombCount(arr) {
		let counter = 0;

		arr.forEach((cell) => {
			if (this.bombs.has(cell)) {
				counter++;
			}
		});

		return counter;
	}
}