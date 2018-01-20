var Tetromino = function(attributes) {
	this.shape = attributes.shape;
	this.cubePositions = attributes.cubePositions;
	this.color = attributes.color;
	this.otherColor = attributes.otherColor 
	this.outlineColor = attributes.outlineColor;
	this.solid = attributes.solid;
	this.rotations = 1;
};

Tetromino.prototype.redrawBackground = function() {
	var context = getContext("tetris");
	this.cubePositions.forEach(function(position) {
		context.clearRect(position[0], position[1], boardIncrement, boardIncrement);
		context.fillStyle = 'black';
		context.fillRect(position[0], position[1], boardIncrement, boardIncrement);
	});
};

Tetromino.prototype.autoMove = function() {
	var that = this;
	currentInterval = setInterval(function() {
		if (!that.allowedDown()) {
			that.redrawBackground();
			that.moveDown();
			// that.drawTetromino();
			drawTetromino(that, that.cubePositions);
		} else {
			clearInterval(currentInterval);
			that.deadTetromino();
		}
	}, (rowClearAnimationTime * 5) + 1);
};

Tetromino.prototype.deadTetromino = function() {
	currentGame.previousShape = this.shape;
	this.cubePositions.forEach(function(deadTetrominoPosition) {
		currentGame.occupiedPositions.push([deadTetrominoPosition, currentTetromino.color, currentTetromino.outlineColor, currentTetromino.solid]);
	});
	currentGame.addToTetrominoStatistics(this.shape);
	if (currentGame.checkForCompleteRow()) {
			currentGame.deleteRowAnimation();
			setTimeout(function() {
				currentGame.blackoutBackground();
				currentGame.slideDownAfterRowDeleted();
				currentGame.redrawTetrominos();
				currentGame.deletedPositions = [];
				currentTetromino.addNewTetromino();
			}, (rowClearAnimationTime * 5) + 1);
	} else {
		currentGame.blackoutBackground();
		currentGame.redrawTetrominos();
		this.addNewTetromino();
	}
};


Tetromino.prototype.addNewTetromino = function() {
	clearInterval(currentInterval);
	this.cubePositions = [[maxVal, maxVal], [maxVal, maxVal], [maxVal, maxVal], [maxVal, maxVal]];
	currentTetromino = spawnTetromino();
	if (!currentTetromino.allowedDown()) {
		currentTetromino.autoMove();
		currentTetromino.getKeyboardInput();
	} else {
		//game over function will go here. I already tested this with an alert message
	}
};

Tetromino.prototype.getKeyboardInput = function() {
	var that = this;
	document.addEventListener("keydown", function(event) {
		that.redrawBackground();
		switch (event.keyCode) {
			case 65: // A
				that.moveLeft();
				break;
			case 83: // S
				if (!that.allowedDown()) {
					that.moveDown();
				}
				break;
			case 68:// D
				that.moveRight();
				break;
			default:
				if (!that.allowedDown()) {
					that.rotateTetromino();
				}
			}
		drawTetromino(that, that.cubePositions);
	});
};

Tetromino.prototype.allowedDown = function() {
	var pieceThereDown = 0;
	this.cubePositions.forEach(function(cubePosition) {
		if (cubePosition[1] > completeColumn[18]) {
			pieceThereDown += 1;
		}
		currentGame.occupiedPositions.forEach(function(usedPosition) {
			if (cubePosition[0] === usedPosition[0][0] && cubePosition[1] + boardIncrement === usedPosition[0][1]) {
				pieceThereDown += 1;
			}
		});
	});
	if (pieceThereDown > 0) {
		return true;
	}
};

Tetromino.prototype.allowedLeft = function() {
	var pieceThere = 0;
	var that = this;
	currentGame.occupiedPositions.forEach(function(usedPosition) {
		that.cubePositions.forEach(function(cubePosition) {
			if (cubePosition[0] - boardIncrement === usedPosition[0][0] && cubePosition[1] === usedPosition[0][1]) {
				pieceThere += 1;
			} 
		});
	});
	if (this.cubePositions[0][0] < boardIncrement) {
		pieceThere += 1;
	}
	if (pieceThere === 0) {
		return true;
	}
};

Tetromino.prototype.allowedRight = function() {
	var pieceThere = 0;
	var that = this;
	currentGame.occupiedPositions.forEach(function(usedPosition) {
		that.cubePositions.forEach(function(cubePosition) {
			if (cubePosition[0] + boardIncrement === usedPosition[0][0] && cubePosition[1] === usedPosition[0][1]) {
				pieceThere += 1;
			} 
		});
	});
	if (this.cubePositions[3][0] > completeRow[8]) {
		pieceThere += 1;
	}
	if (pieceThere === 0) {
		return true;
	}
};
// All functions starting with "move" only adjust the cubePositions, they do not draw/redraw
Tetromino.prototype.moveLeft = function() {
	if (this.allowedLeft()) {
		this.cubePositions.forEach(function(position) {
			position[0] -= boardIncrement;
		});
	}
};

Tetromino.prototype.moveRight = function() {
	if (this.allowedRight()) {
		this.cubePositions.forEach(function(position) {
			position[0] += boardIncrement;
		});
	}
};

Tetromino.prototype.moveDown = function() {
	this.cubePositions.forEach(function(position) {
		position[1] += boardIncrement;
	});
};

Tetromino.prototype.rotateTetromino = function() {
	switch (this.shape) {
		case 'cross':
			this.rotateCross();
			break;
		case 'es':
			this.rotateEs();
			break;
		case 'zed':
			this.rotateZed();
			break;
		case 'jay':
			this.rotateJay();
			break;
		case 'el':
			this.rotateEl();
			break;
		case 'stick':
			this.rotateStick();
			break;
	}
};
// Hardcoding bonanza yay!
Tetromino.prototype.rotateStick = function() {
	if (this.rotations === 1) {
		this.cubePositions[0][0] += boardIncrement * 2;
		this.cubePositions[0][1] += negBoardIncrement * 2;
		this.cubePositions[1][0] += boardIncrement;
		this.cubePositions[1][1] += negBoardIncrement;
		this.cubePositions[3][0] += negBoardIncrement;
		this.cubePositions[3][1] += boardIncrement;
		this.rotations += 1;
	} else {
		if (this.allowedRight() && this.allowedLeft()) {
			this.cubePositions[0][0] += negBoardIncrement * 2;
			this.cubePositions[0][1] += boardIncrement * 2;
			this.cubePositions[1][0] += negBoardIncrement;
			this.cubePositions[1][1] += boardIncrement;
			this.cubePositions[3][0] += boardIncrement;
			this.cubePositions[3][1] += negBoardIncrement;
			this.rotations -= 1;
		}
	}
};

Tetromino.prototype.rotateCross = function() {
	if (this.rotations === 1) {
		this.cubePositions[3][0] += negBoardIncrement;
		this.cubePositions[3][1] += negBoardIncrement;
		this.rotations += 1;
	} else if (this.rotations === 2) {
		if (this.allowedRight()) {
			this.cubePositions[1][1] += negBoardIncrement * 2;
			this.cubePositions[3][0] += boardIncrement;
			this.cubePositions[3][1] += boardIncrement;
			this.rotations += 1;
		}
	} else if (this.rotations === 3) {
		this.cubePositions[0][0] += boardIncrement;
		this.cubePositions[0][1] += boardIncrement;
		this.rotations += 1;
	} else {
		if (this.allowedLeft()) {
			this.cubePositions[0][0] += negBoardIncrement;
			this.cubePositions[0][1] += negBoardIncrement;
			this.cubePositions[1][1] += boardIncrement * 2;
			this.rotations = 1;
		}
	}
};

Tetromino.prototype.rotateEs = function() {
	if (this.rotations === 1) {
		this.cubePositions[0][0] += boardIncrement;
		this.cubePositions[0][1] += negBoardIncrement * 2;
		this.cubePositions[1][0] += boardIncrement;
		this.rotations += 1;
	} else {
		if (this.allowedLeft()) {
			this.cubePositions[0][0] += negBoardIncrement;
			this.cubePositions[0][1] += boardIncrement * 2;
			this.cubePositions[1][0] += negBoardIncrement;
			this.rotations -= 1;
		}
	}
};

Tetromino.prototype.rotateZed = function() {
	if (this.rotations === 1) {
		this.cubePositions[0][0] += boardIncrement;
		this.cubePositions[1][0] += boardIncrement;
		this.cubePositions[3][1] += negBoardIncrement * 2;
		this.rotations += 1;
	} else {
		if (this.allowedLeft()) {
			this.cubePositions[0][0] += negBoardIncrement;
			this.cubePositions[1][0] += negBoardIncrement;
			this.cubePositions[3][1] += boardIncrement * 2;
			this.rotations -= 1;
		}
	}
};

Tetromino.prototype.rotateJay = function() {
	if (this.rotations === 1) {
		this.cubePositions[0][1] += boardIncrement;
		this.cubePositions[1][0] += negBoardIncrement;
		this.cubePositions[3][0] += negBoardIncrement;
		this.cubePositions[3][1] += negBoardIncrement;
		this.rotations += 1;
	} else if (this.rotations === 2) {
		if (this.allowedRight()) {		
			this.cubePositions[0][1] += negBoardIncrement * 2;
			this.cubePositions[1][0] += negBoardIncrement;
			this.cubePositions[1][1] += negBoardIncrement;
			this.cubePositions[3][0] += boardIncrement;
			this.cubePositions[3][1] += boardIncrement;
			this.rotations += 1;
		}
	} else if (this.rotations === 3) {
		this.cubePositions[0][0] += boardIncrement;
		this.cubePositions[1][0] += boardIncrement;
		this.cubePositions[1][1] += boardIncrement;
		this.cubePositions[3][1] += negBoardIncrement;
		this.rotations += 1;
	} else {
		if (this.allowedLeft()) {
			this.cubePositions[0][0] += negBoardIncrement;
			this.cubePositions[0][1] += boardIncrement;
			this.cubePositions[1][0] += boardIncrement;
			this.cubePositions[3][1] += boardIncrement;
			this.rotations = 1;
		}
	}
};

Tetromino.prototype.rotateEl = function() {
	if (this.rotations === 1) {
		this.cubePositions[0][1] += negBoardIncrement;
		this.cubePositions[1][0] += boardIncrement;
		this.cubePositions[3][0] += negBoardIncrement;
		this.cubePositions[3][1] += negBoardIncrement;
		this.rotations += 1;
	} else if (this.rotations === 2) {
		if (this.allowedRight()) {
			this.cubePositions[0][1] += boardIncrement;
			this.cubePositions[1][0] += boardIncrement;
			this.cubePositions[1][1] += negBoardIncrement;
			this.cubePositions[3][0] += boardIncrement;
			this.rotations += 1;
		}
	} else if (this.rotations === 3) {
		this.cubePositions[0][0] += boardIncrement;
		this.cubePositions[0][1] += negBoardIncrement;
		this.cubePositions[1][0] += negBoardIncrement;
		this.cubePositions[1][1] += boardIncrement;
		this.cubePositions[3][1] += boardIncrement * 2;
		this.rotations += 1;
	} else {
		if (this.allowedLeft()) {
			this.cubePositions[0][0] += negBoardIncrement;
			this.cubePositions[0][1] += boardIncrement;
			this.cubePositions[1][0] += negBoardIncrement;
			this.cubePositions[3][1] += negBoardIncrement;
			this.rotations = 1;
		}
	}
};