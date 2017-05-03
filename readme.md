Project description:

1) Main object: Minesweeper:
	a) game field initialization
	b) event handlers for Start, Reset
	c) responsible for view

when the user clicks Start button:
	а) Game object is initialized which is responsible for game data
	б) Timer object initialized
	в) necessary event handlers are added


Game object:
_onFieldEvents function is used to pass data from Minesweeper to Game object, Game object replies by sending an appropriate custom event.

Objects differ in their representation of the game field:
а) for Minesweeper object the field is a two-dimension table (column / row)
б) for Game object the field is a continuous array of cell numbers. Function numberToIndex and indexToNumber (Game) allow to easily pass from one system to another

Custom events are centralized: when a function wants to send data for further treatment, it calls generateFieldEvent or generateGameEvent (depending on the recipient) and passes all necessary parameters.

Minesweeper can send to Game the following data:
а) move - user's move with coordinates of the clicked cell. Mines are generated after the first move only (so that the user doesn't explode from the start)
б) toggleMark - check/uncheck the cell as potentially containing the mine. This information is necessary for Game object, so that when it informs Minesweeper on which empty cells to open, the checked cells are ignored.

Game can generate following custom events (names are identical to Minesweeper methods):
а) open - open the cell, number of mines around is also passed.
б) displayBombs - show all the mines, an array with mine coordinates is also passed
в) win - we've won! :-)
г) lose - we've lost! :-(
д) explode - user has exploded, cell coordinates are also passed. Then number of mines goes down by one, and when displayBombs array is passed, it doesn't contain the information on the exploded mine

HTML and CSS are independent from code: data-type properties are used when necessary, all classes that are required by the app start from js: 

a) js-open	- user clicks on the cell and opens it. Number of mines around (if any) is displayed in the innermost element of the cell
b) js-presumed-mine - user right-clicked the cell to check it is potentially dangerous
c) js-bomb - when we lose, mine containing cells get js-bomb class (except for the exploded mine)
d) js-flag-wrong - when we lose, user mistakes are marked with this class (if the user check wrong cells as potentially dangerous)
e) js-explosion - exploded mine
f) js-flag - cells with mines if the user wins