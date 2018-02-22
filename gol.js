// *** DESCRIPTION *** //

// This is a take on john conways game of life.

// The rules:
// 1. Any live cell with fewer than two live neighbours dies, as if caused by underpopulation.
// 2. Any live cell with two or three live neighbours lives on to the next generation.
// 3. Any live cell with more than three live neighbours dies, as if by overpopulation.
// 4. Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.

console.log('GOL script started');

// *** GLOBALS *** //


let canvas;
let context; 
let game;
let cells;
let steps;
let seeds = [];
let thisSeed;
let seedTicks = 0;
let running;
let fps = 1000/5;
let maxTicks = 2000;
let stalledState = 0;
let dropdowns = document.getElementsByClassName("dropdown-content");



// *** FUNCTIONS *** //

function init() {
	running = true;
	canvas = document.createElement('CANVAS');
	context = canvas.getContext('2d');
	canvas.height = 600;
	canvas.width = 1200;
	document.body.appendChild(canvas);
	cells = matrix(canvas.width/10, canvas.height/10);
	steps = matrix(canvas.width/10, canvas.height/10);
	evenStep = matrix(canvas.width/10, canvas.height/10);
	thisSeed = matrix(canvas.width/10, canvas.height/10);
	drawGrid();
	seed();
	game = setInterval(gameLoop, fps);
}

function startStop() {
	switch (running) {
	    case true:
			clearInterval(game);
			drawGrid();
			running = false;
	        break;
	    case false:
	        game = setInterval(gameLoop, fps);
	        running = true;
	        break;
	}
}

function restart() {
	thisSeed.forEach((column, columnIndex) => {
		column.forEach((cell, cellIndex) => {
			cells[columnIndex][cellIndex] = thisSeed[columnIndex][cellIndex];
			steps[columnIndex][cellIndex] = thisSeed[columnIndex][cellIndex];
		});
	});
}

function newSeed() {
	if (running) {
		clearInterval(game);
	}
	running = true;
	cells = matrix(canvas.width/10, canvas.height/10);
	thisSeed = matrix(canvas.width/10, canvas.height/10);
	drawGrid();
	seed();
	seedTicks = 0;
	game = setInterval(gameLoop, fps);
}



function matrix(m, n) {
  return Array.from({
    // generate array of length m
    length: m
    // inside map function generate array of size n
    // and fill it with `0`
  }, () => new Array(n).fill(0));
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive 
}

function clearScreen() {
	context.fillStyle = '#000000';
	context.fillRect(0, 0, canvas.width, canvas.height);
}

function drawGrid() {
	//Drawing verticle lines
	context.strokeStyle = '#333333';
	for (var i = 0; i < canvas.width/10; i++) {
		context.moveTo(i * 10, 0);
		context.lineTo(i * 10, canvas.height);
		context.stroke();
	}
	//Drawing horizontal lines
	for (var i = 0; i < canvas.height/10; i++) {
		context.moveTo(0, i * 10);
		context.lineTo(canvas.width, i * 10);
		context.stroke();
	}
}

function drawCells() {
	let count = 0;
	context.fillStyle = '#808080';
	steps.forEach((column, columnIndex) => {
		column.forEach((cell, cellIndex) => {
			cells[columnIndex][cellIndex] = steps[columnIndex][cellIndex]; // copy the changes to the cells array
		});
	});
	cells.forEach((column, columnIndex) => {
		column.forEach((cell, cellIndex) => {
			let numNeighbours = checkCellNeighbours(columnIndex, cellIndex);
			switch (cell) {
			    case 0:
			    	if (numNeighbours === 3) {
						steps[columnIndex][cellIndex] = 1; // mark the cell for birth
						count ++;
					}
			        break;
			    case 1:
					// fill cell
					context.fillRect(columnIndex * 10 + 1, cellIndex * 10 + 1, 8, 8);
					
					if (numNeighbours < 2) {
						steps[columnIndex][cellIndex] = 0; // mark the cell for deletion
						count ++;
					}
					if (numNeighbours > 3) {
						steps[columnIndex][cellIndex] = 0; // mark the cell for deletion
						count ++;
					}
			        break;
			}
		});
	});
	if (count === 0) {
		endSeed();
	}
}

function endSeed() {
	if (running) {
		startStop();
	}
	stalledState = 0;
	console.log(seedTicks);
	seeds.push({seed: thisSeed, ticks: seedTicks, added: Date.now()});
	seeds.sort(compare);
	if (seeds.length > 10) {
		seeds.splice(-1,1)
	}
	refreshDropdowns();
	//console.log(seeds);
	newSeed();
}

function compare(a, b) { // for array sort function
	if (a.ticks > b.ticks) {
		return -1;
	}
	if (a.ticks < b.ticks) {
		return 1;
	}
	return 0;
}

function refreshDropdowns() {
	// <a onclick="loadSeed(0)" href="#">0</a>
	dropdowns[0].innerHTML = "";
	seeds.forEach((seed,index) => {
		let a = document.createElement('a');
		let tn = document.createTextNode(index);
		let tt = document.createElement('span');
		let tttn = document.createTextNode(seed.ticks + ' generations');
		tt.setAttribute('class', 'tooltiptext');
		tt.appendChild(tttn);
		a.setAttribute('href', '#');
		a.setAttribute('class', 'tooltip');
		a.setAttribute('onclick', 'loadSeed(this.textContent)');
		a.appendChild(tn);
		a.appendChild(tt);
		//console.log(a);
		dropdowns[0].appendChild(a);
	});
}

function checkCellNeighbours(x, y) {
	//console.log(x,y);
	let count = 0;

	if (x > 0 && y > 0) {
		if (cells[x-1][y-1] >= 1) {count ++;}
	}
	if (x > 0) {
		if (cells[x-1][y] >= 1) {count ++;}
	}
	if (x > 0 && y < canvas.height/10 -1) {
		if (cells[x-1][y+1] >= 1) {count ++;}
	}
	if (y > 0) {
		if (cells[x][y-1] >= 1) {count ++;}
	}
	if (y < canvas.height/10 -1) {
		if (cells[x][y+1] >= 1) {count ++;}
	}
	if (x < canvas.width/10 -1 && y > 0) {
		if (cells[x+1][y-1] >= 1) {count ++;}
	}
	if (x < canvas.width/10 -1) {
		if (cells[x+1][y] >= 1) {count ++;}
	}
	if (x < canvas.width/10 -1 && y < canvas.height/10 -1) {
		if (cells[x+1][y+1] >= 1) {count ++;}
	}

	return count;
}

function gameLoop() {
	seedTicks++;
	clearScreen();
	drawCells();
	if (seedTicks % 2 === 0) { // do every second (even) tick
		let count = 0;
		cells.forEach((column, columnIndex) => {
			column.forEach((cell, cellIndex) => {
				if (evenStep[columnIndex][cellIndex] !== cells[columnIndex][cellIndex]) {
					count++;
					evenStep[columnIndex][cellIndex] = cells[columnIndex][cellIndex];
				}
			});
		});
		if (count === 0) {  // state is the same after two ticks
			stalledState++;
		}
	}
	if (seedTicks > maxTicks || stalledState >= 3) {
		endSeed();
	}
}

// can take a seed or provides random seed
function seed(s) {
	//console.log(s);
	cells.forEach((column, columnIndex) => {
		column.forEach((cell, cellIndex) => {
			if (s) {
				cells[columnIndex][cellIndex] = s.seed[columnIndex][cellIndex];
			} else {
				cells[columnIndex][cellIndex] = getRandomInt(0, 1);
			}
			thisSeed[columnIndex][cellIndex] = cells[columnIndex][cellIndex];
			steps[columnIndex][cellIndex] = cells[columnIndex][cellIndex];
		});
	});
}

function step() {
	seedTicks++;
	clearScreen();
	drawCells();
	drawGrid()
	if (seedTicks > 1000) {
		endSeed();
	}
}

function loadSeed(rank) { // Ranks 0-9 ordered
	//console.log('rank', rank);
	if (running) {
		clearInterval(game);
	}
	if (!rank && rank !== 0) {
		console.log('No rank given:', rank);
	} else if (typeof(rank) === 'string') {
		rank = parseInt(rank.charAt(0));
	}
	running = true;
	cells = matrix(canvas.width/10, canvas.height/10);
	steps = matrix(canvas.width/10, canvas.height/10);
	thisSeed = matrix(canvas.width/10, canvas.height/10);
	drawGrid();
	seed(seeds[rank]);
	seedTicks = 0;
	game = setInterval(gameLoop, fps);
}

function aliveSeed() {
	if (running) {
		clearInterval(game);
	}
	running = true;
	cells = matrix(canvas.width/10, canvas.height/10);
	steps = matrix(canvas.width/10, canvas.height/10);
	thisSeed = matrix(canvas.width/10, canvas.height/10);

	cells[41][16] = 1;
	cells[41][17] = 1;
	cells[42][16] = 1;
	cells[42][17] = 1;

	cells[52][15] = 1;
	cells[52][16] = 1;
	cells[52][17] = 1;
	cells[53][14] = 1;
	cells[53][18] = 1;
	cells[54][13] = 1;
	cells[54][19] = 1;
	cells[55][14] = 1;
	cells[55][18] = 1;
	cells[56][15] = 1;
	cells[56][16] = 1;
	cells[56][17] = 1;
	cells[57][15] = 1;
	cells[57][16] = 1;
	cells[57][17] = 1;

	cells[62][13] = 1;
	cells[62][14] = 1;
	cells[62][15] = 1;
	cells[63][12] = 1;
	cells[63][13] = 1;
	cells[63][15] = 1;
	cells[63][16] = 1;
	cells[64][12] = 1;
	cells[64][13] = 1;
	cells[64][15] = 1;
	cells[64][16] = 1;
	cells[65][12] = 1;
	cells[65][13] = 1;
	cells[65][14] = 1;
	cells[65][15] = 1;
	cells[65][16] = 1;
	cells[66][11] = 1;
	cells[66][12] = 1;
	cells[66][16] = 1;
	cells[66][17] = 1;

	cells[71][12] = 1;
	cells[71][13] = 1;

	cells[75][14] = 1;
	cells[75][15] = 1;
	cells[76][14] = 1;
	cells[76][15] = 1;

	cells.forEach((column, columnIndex) => {
		column.forEach((cell, cellIndex) => {
			thisSeed[columnIndex][cellIndex] = cells[columnIndex][cellIndex];
			steps[columnIndex][cellIndex] = cells[columnIndex][cellIndex];
		});
	});

	drawGrid();
	seedTicks = 0;
	game = setInterval(gameLoop, fps);
}

// *** EVENT LISTENERS *** //

let slider = document.getElementById("speedSlider");
let sliderText = document.getElementById("sliderText");
slider.oninput = function() {
    sliderText.innerHTML = this.value + " fps";
    fps = 1000/this.value;
    if (running) {
    	clearInterval(game);
    	game = setInterval(gameLoop, fps);
    }
}

// Open the drop down menu
function dropDown() {
	refreshDropdowns();
    document.getElementById("rankDropdown").classList.toggle("show");
}

// Close the dropdown if the user clicks outside of it
window.onclick = function(event) {
  if (!event.target.matches('.ddbtn')) {

    let i;
    for (i = 0; i < dropdowns.length; i++) {
      let openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}


// *** INITIALIZE *** //

init();
