'use strict';

// a very simple timer

export default class Timer{
	constructor(elem){
		if (!elem) {
			elem = document.createElement('span');
		}

		this._elem = elem;
		this._elem.innerHTML = '0';

		this.timer = null;
	}

	start() {

		let count = 1; 

		this.timer = setInterval( () => {
			this._elem.innerHTML = count;
			count++;
			if (count === 9999) {
				count = 0;
			}
		}, 1000 );
	}

	stop() {
		clearInterval(this.timer);
	}
}