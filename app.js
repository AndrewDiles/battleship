let gameState = null;
// let pieceTouched = null;

const getRowLetterFromNumber = (rowNumber) => {
  if (!rowNumber) return null;
  return String.fromCharCode(64 + rowNumber);
};

const getRowNumberFromLetter = (rowLetter) => {
  return rowLetter.charCodeAt(0) - 64;
};

const sameLocation = (loc1, loc2) => {
  return loc1.row === loc2.row && loc1.col === loc2.col;
};

const idFromLocation = (location) => {
  return `col${location.col}row${location.row}`;
};
const removeErrorClassFromElementInErrorTime = (elem) => {
  setTimeout(() => {
    if (!elem) return;
    elem.classList.remove("error");
  }, ERROR_TIME);
};
const cycleErrorOnElement = (elem) => {
  elem.classList.add("error");
  removeErrorClassFromElementInErrorTime(elem);
};
const setShipLocationFromElementAndLocation = (
  location,
  element,
  isHorizontal
) => {
  if (isHorizontal) {
    element.style.left = `${5 * location.col}vw`;
  } else {
    element.style.left = `${5 * (location.col + 1)}vw`;
  }
  element.style.top = `${5.2 * location.row - 1.7}vw`;
};
const removeAllBlockedAndOpenClasses = () => {
  for (let row = 1; row < 11; row++) {
    for (let col = 1; col < 11; col++) {
      document.getElementById(`col${col}row${row}`).classList.remove("blocked");
      document.getElementById(`col${col}row${row}`).classList.remove("open");
    }
  }
};
const testIfArraysShareALocation = (locationArray1, locationArray2) => {
  let matchFound = false;
  locationArray1.forEach((loc1) => {
    if (matchFound) return;
    locationArray2.forEach((loc2) => {
      if (matchFound) return;
      if (sameLocation(loc1, loc2)) matchFound = true;
    });
  });
  return matchFound;
};

const generateRowAndColFromDragEvent = (e, boardElement) => {
  const SAMPLE_CELL_RECT = document
    .querySelector(".cell-label")
    .getBoundingClientRect();
  const TOP_ROW_HEIGHT = SAMPLE_CELL_RECT.height;
  const CELL_SIZE = SAMPLE_CELL_RECT.width + SAMPLE_CELL_RECT.width / 250;
  const BOARD_START_X = boardElement.getBoundingClientRect().x;
  const BOARD_START_Y = boardElement.getBoundingClientRect().y;
	const TOPSCROLL = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
	const X_POS = e.clientX - BOARD_START_X - CELL_SIZE;
  const Y_POS = e.pageY - BOARD_START_Y - TOP_ROW_HEIGHT - TOPSCROLL;
  const col = Math.floor(X_POS / CELL_SIZE) + 1;
  const row =
    Math.floor(Y_POS / (CELL_SIZE + SAMPLE_CELL_RECT.width / 31.25)) + 1;
  return { row, col };
};

const generateShipOccupiedCells = (shipInfo, reverseHorizontal) => {
  const result = [{ col: shipInfo.col, row: shipInfo.row }];
  for (section = 1; section < shipInfo.length; section++) {
    if (reverseHorizontal) {
      if (!shipInfo.horizontal) {
        result.push({ col: shipInfo.col + section, row: shipInfo.row });
      } else result.push({ col: shipInfo.col, row: shipInfo.row + section });
    } else {
      if (shipInfo.horizontal) {
        result.push({ col: shipInfo.col + section, row: shipInfo.row });
      } else result.push({ col: shipInfo.col, row: shipInfo.row + section });
    }
  }
  return result;
};

// Decided to not include the "occupied" class on cells
// const modifyOccupiedOfShipLocations = (shipInfo, addOrRemove) => {
// }

const applyBlockedAndOpenClasses = (
  newCellsToOccupy,
  playerNumber,
  shipName
) => {
  newCellsToOccupy = newCellsToOccupy.map((cell) => {
    return { ...cell, isTaken: false };
  });
  gameState.shipInfo[playerNumber].forEach((shipInfo) => {
    if (shipInfo.name === shipName) return;
    const takenArray = generateShipOccupiedCells(shipInfo);
    takenArray.forEach((takenLocation) => {
      newCellsToOccupy.forEach((locationToMoveInto, index) => {
        if (sameLocation(takenLocation, locationToMoveInto)) {
          newCellsToOccupy[index].isTaken = true;
          document
            .getElementById(idFromLocation(takenLocation))
            .classList.add("blocked");
        }
      });
    });
  });
  let hasIllegalLocation = false;
  newCellsToOccupy.forEach((locationToMoveInto) => {
    if (!locationToMoveInto.isTaken) {
      const targetCellElement = document.getElementById(
        idFromLocation(locationToMoveInto)
      );
      if (targetCellElement) {
        targetCellElement.classList.add("open");
      } else {
        hasIllegalLocation = true;
      }
    } else {
      hasIllegalLocation = true;
    }
  });
  if (!hasIllegalLocation) {
    const targetShipInfo = gameState.shipInfo[playerNumber].find(
      (shipInfo) => shipInfo.name === shipName
    );
    // modifyOccupiedOfShipLocations(targetShipInfo, "remove");
    targetShipInfo.row = newCellsToOccupy[0].row;
    targetShipInfo.col = newCellsToOccupy[0].col;
    setShipLocationFromElementAndLocation(
      targetShipInfo,
      document.getElementById(`${shipName}${playerNumber}`),
      targetShipInfo.horizontal
    );
    // modifyOccupiedOfShipLocations(targetShipInfo, "add");
  }
};
const moveShip = (row, col, playerNumber, shipName) => {

  if (row > 10 || row < 1 || col > 10 || col < 1) {
    removeAllBlockedAndOpenClasses();
    return;
  }
  const newCellsToOccupy = [{ col, row }];
  const shipInfo = gameState.shipInfo[playerNumber].find(
    (info) => info.name === shipName
  );
  for (section = 1; section < shipInfo.length; section++) {
    if (shipInfo.horizontal) {
      newCellsToOccupy.push({ col: col + section, row });
    } else newCellsToOccupy.push({ col: col, row: row + section });
  }
  removeAllBlockedAndOpenClasses();
  applyBlockedAndOpenClasses(newCellsToOccupy, playerNumber, shipName);
}
const handleDragShip = (e, playerNumber, shipName) => {
	// console.log("dragging")
  if (e.x === 0 && e.y === 0) {
    removeAllBlockedAndOpenClasses();
    return;
  }
	const TARGET_BOARD =
    playerNumber === 1 ? PLAYER_1_VIEW_ELEMENT : PLAYER_2_VIEW_ELEMENT;
	const { row, col } = generateRowAndColFromDragEvent(e, TARGET_BOARD);
	moveShip(row, col, playerNumber, shipName)
};
const handleDragShipTouch = (e, playerNumber, shipName) => {
	const TARGET_BOARD =
    playerNumber === 1 ? PLAYER_1_VIEW_ELEMENT : PLAYER_2_VIEW_ELEMENT;
	if (e && e.touches && e.touches[0]) {
		const touchInfo = e.touches[0];
		const { row, col } = generateRowAndColFromDragEvent(touchInfo, TARGET_BOARD);
		moveShip(row, col, playerNumber, shipName)
	} else {console.log("error obtaining touch info")}
}
const handleRotateShip = (rotateButtonElement, playerNumber, shipName) => {
  const shipToRotateInfo = gameState.shipInfo[playerNumber].find(
    (ship) => ship.name === shipName
  );
  if (shipToRotateInfo.row + shipToRotateInfo.length > 11) {
    rotateButtonElement.classList.add("blocked");
    setTimeout(() => {
      rotateButtonElement.classList.remove("blocked");
    }, 500);
    return;
  }
  const shipToRotateLocationsArray = generateShipOccupiedCells(
    shipToRotateInfo,
    true
  );
  let isBlocked = false;
  gameState.shipInfo[playerNumber].forEach((testingShipInfo) => {
    if (isBlocked || testingShipInfo.name === shipToRotateInfo.name) return;
    const testingShipLocationsArray =
      generateShipOccupiedCells(testingShipInfo);
    isBlocked = testIfArraysShareALocation(
      testingShipLocationsArray,
      shipToRotateLocationsArray
    );
  });
  // "blocked" class temporarily
  if (isBlocked) {
    rotateButtonElement.classList.add("blocked");
    setTimeout(() => {
      rotateButtonElement.classList.remove("blocked");
    }, 500);
  } else {
    // make rotation
    shipToRotateInfo.horizontal = !shipToRotateInfo.horizontal;
    const shipElement = document.getElementById(
      `${shipToRotateInfo.name}${playerNumber}`
    );
    shipElement.classList.toggle("rotated");
    if (rotateButtonElement.innerText === "↺") {
      rotateButtonElement.innerText = "⤸";
    } else {
      rotateButtonElement.innerText = "↺";
    }
    // ⤻⤸⤾⤿⤺⤶
    setShipLocationFromElementAndLocation(
      shipToRotateInfo,
      shipElement,
      shipToRotateInfo.horizontal
    );
  }
};

function hideDraggingElement(e) {
  const crt = this.cloneNode(true);
  crt.style.opacity = 0;
  crt.classList.add("make-hidden-on-dragend");
  // crt.style.display = "none";
  document.body.appendChild(crt);
  e.dataTransfer.setDragImage(crt, 0, 0);
}

const removeClonedElements = () =>
  document
    .querySelectorAll(".make-hidden-on-dragend")
    .forEach((nodeElement) => nodeElement.remove());

const createMoveableShips = (playerNumber) => {
	// if (TOUCH_DEVICE) pieceTouched = null;
  gameState.shipInfo[playerNumber].forEach((shipInfo) => {
    const newShip = document.createElement("div");
    newShip.innerText = shipInfo.name;
    newShip.classList.add("ship");
    newShip.id = `${shipInfo.name}${playerNumber}`;
    newShip.style.width = `${5 * shipInfo.length}vw`;
		newShip.style.backgroundImage = shipInfo.url;
		newShip.style.backgroundSize = `${5*shipInfo.length}vw 5vw`;
		// if (shipInfo.name === "Submarine") newShip.style.color = "white";
    setShipLocationFromElementAndLocation(shipInfo, newShip, true);
    
    const rotateButton = document.createElement("button");
    rotateButton.classList.add("rotate-button");
    rotateButton.innerText = "⤸";
    // ⤻🔄⤶
    newShip.appendChild(rotateButton);
    if (playerNumber === 1) {
      PLAYER_1_VIEW_ELEMENT.appendChild(newShip);
    } else {
      PLAYER_2_VIEW_ELEMENT.appendChild(newShip);
    }

		rotateButton.addEventListener("click", () =>
		handleRotateShip(rotateButton, playerNumber, shipInfo.name)
	);

		if (TOUCH_DEVICE) {

		// touchstart is equivalent to mousedown
		// touchend is equivalent to mouseup
		// touchmove is equivalent to mousemove
		newShip.addEventListener("touchmove", (e) => {
			handleDragShipTouch(e, playerNumber, shipInfo.name);
		});

		} else {
			newShip.draggable = "true";
			newShip.addEventListener("dragstart", hideDraggingElement, false);
			newShip.addEventListener("drag", (e) => {
				handleDragShip(e, playerNumber, shipInfo.name);
			});
			newShip.addEventListener("dragend", removeClonedElements);
		}
  });
};
const setOccupiedCells = (playerNumber) => {
  gameState.shipInfo[playerNumber].forEach((shipInfo) => {
    let col = shipInfo.col;
    let row = shipInfo.row;
    const cellsToTarget = [`col${col}row${row}`];
    for (section = 1; section < shipInfo.length; section++) {
      if (shipInfo.horizontal) {
        col++;
      } else row++;
      cellsToTarget.push(`col${col}row${row}`);
    }
    // cellsToTarget.forEach((id)=>{
    // 	document.getElementById(id).classList.add("occupied")
    // })
  });
};

const moveToPlayer2Deploy = (e) => {
  e.target.remove();
  PLAYER_1_VIEW_ELEMENT.classList.add("hidden");
  PLAYER_1_VIEW_ELEMENT.innerHTML = "";
  OVERLAY_ELEMENT.classList.remove("hidden");
  const readyButton = createReadyButton(
    // `Player 2: ${gameState.player2Name}'s turn to deploy ships`
		`${gameState.player2Name}'s turn to deploy ships`
  );
  readyButton.addEventListener("click", () => beginPlayerDeployment(2));
};

const shotSelection = (e) => {
  e.target.remove();
  gameState.isShooting = true;
  if (gameState.activePlayer === 1) {
    document.getElementById("fireButton1").innerText = DEFAULT_FIRE_BUTTON_TEXT;
    PLAYER_1_VIEW_ELEMENT.classList.remove("hidden");
  } else {
    document.getElementById("fireButton2").innerText = DEFAULT_FIRE_BUTTON_TEXT;
    PLAYER_2_VIEW_ELEMENT.classList.remove("hidden");
  }
};
const executeRound = () => {
  console.log("EXECUTING TURN ", gameState.turn);
  // update top header make ready button
  // PLAYER_1_VIEW_ELEMENT.classList.add("hidden");
  // PLAYER_1_VIEW_ELEMENT.innerHTML = "";
  OVERLAY_ELEMENT.classList.remove("hidden");
  const readyButton = createReadyButton(
    `Round ${gameState.turn} - ${
      gameState.activePlayer === 1
        ? gameState.player1Name
        : gameState.player2Name
    }'s turn.`
  );
  readyButton.addEventListener("click", shotSelection);
};

const createUnselectableSunkShip = (shipInfo, bottom, providedTargetBoard) => {
	const targetBoard = providedTargetBoard ? providedTargetBoard : gameState.activePlayer === 1 ? PLAYER_1_VIEW_ELEMENT : PLAYER_2_VIEW_ELEMENT;
	const newShip = document.createElement("div");
	newShip.innerText = shipInfo.name;
	newShip.classList.add("unselectable-ship");
	newShip.style.backgroundImage = shipInfo.url;
	newShip.style.backgroundSize = `${5*shipInfo.length}vw 5vw`;
	newShip.style.width = `${5 * shipInfo.length}vw`;
	// if (shipInfo.name === "Submarine") newShip.style.color = "white";
		if (shipInfo.horizontal) {
			newShip.style.left = `${5 * shipInfo.col}vw`;
		} else {
			newShip.style.left = `${5 * (shipInfo.col + 1)}vw`;
			newShip.classList.add("rotated");
		}
		if (bottom) {
			newShip.style.bottom = `${5.2 * (10-shipInfo.row)}vw`;
		} else {
			newShip.style.top = `${5.2 * (shipInfo.row)-1.7}vw`;
		}
		targetBoard.appendChild(newShip)
}

const handleAttemptFire = (e) => {
	const buttonText = e.target.innerText;
  if (gameState.isShooting) {
    if (buttonText === DEFAULT_FIRE_BUTTON_TEXT) {
      cycleErrorOnElement(e.target);
      return;
    } else {
      gameState.isShooting = false;
      const row = getRowNumberFromLetter(buttonText[0]);
      const col =
        buttonText[2] === ""
          ? parseInt(buttonText[1])
          : parseInt(buttonText[1] + buttonText[2]);
      const shotLocation = { col, row };
      const enemyPlayerNumber = gameState.activePlayer === 1 ? 2 : 1;
      const locationElement = document.querySelector(".targeted");
      // enemy location
      const enemyElement = document.getElementById(
        `col${col}row${row}self${enemyPlayerNumber}`
      );
      gameState.shotLocations[gameState.activePlayer].push(shotLocation);
      let isHit = false;
			let shipIndex = null;
      gameState.shipInfo[enemyPlayerNumber].forEach((shipInfo, index) => {
        if (shipInfo.sunk || isHit) return;
        const testLocations = generateShipOccupiedCells(shipInfo);
        testLocations.forEach((testLocation) => {
          if (sameLocation(testLocation, shotLocation)) {
						isHit = true;
						shipIndex = index;
					}
        });
      });
      if (isHit) {
        // test is sunk
        console.log("hit");
				locationElement.classList.remove("targeted");
        enemyElement.classList.add("hit");
				let isSunk = false;
				let totalHit = 0;
				const hitShipInfo = gameState.shipInfo[enemyPlayerNumber][shipIndex];
				const hitShipLocations = generateShipOccupiedCells(hitShipInfo);
				hitShipLocations.forEach((shipLocation)=>{
					gameState.shotLocations[gameState.activePlayer].forEach((shotLocation)=>{
						if (sameLocation(shipLocation, shotLocation)) totalHit++
					})
				})
				if (totalHit === hitShipInfo.length) {
					isSunk = true;
					gameState.shipInfo[enemyPlayerNumber][shipIndex].sunk = true;
				}
				if (isSunk) {
					console.log("sunk")
					locationElement.classList.add("sunk");
					createUnselectableSunkShip(hitShipInfo)
					let gameOver = gameState.shipInfo[enemyPlayerNumber].every((ship)=>ship.sunk)
					if (gameOver) {
						console.log("game over")
						INSTRUCTIONS_ELEMENT.innerText = `GAME OVER - ${gameState.activePlayer === 1 ? gameState.player1Name : gameState.player2Name } WINS!`;
						e.target.innerText = START_NEW_GAME_MESSAGE;
						gameState.gameOver = true;
					} else {
						e.target.innerText = hitShipInfo.name + SUNK_INDICATION;
					}
				} else {
					locationElement.classList.add("hit");
					e.target.innerText = hitShipInfo.name + HIT_INDICATION;
				}
      } else {
        console.log("miss");
        e.target.innerText = MISS_INDICATION;
        locationElement.classList.remove("targeted");
        locationElement.classList.add("missed");
        enemyElement.classList.add("missed");
      }
    }
  } else if (buttonText === START_NEW_GAME_MESSAGE){
		clearGame()
		initializeGame();
  } else {
		gameState.activePlayer === 1 ? PLAYER_1_VIEW_ELEMENT.classList.add("hidden") : PLAYER_2_VIEW_ELEMENT.classList.add("hidden"); 
		gameState.turn++;
		gameState.activePlayer = gameState.activePlayer === 1 ? 2 : 1
		executeRound()
	}
};
const createFireButton = (parent, playerNumber) => {
  const fireButton = document.createElement("button");
  fireButton.classList.add("game-button", "fire-button");
  fireButton.id = `fireButton${playerNumber}`;
  fireButton.innerText = DEFAULT_FIRE_BUTTON_TEXT;
  fireButton.addEventListener("click", handleAttemptFire);
  parent.appendChild(fireButton);
};

const handleClickCell = (e, row, col, playerNumber) => {
	if (!gameState.isShooting) return
  const clickedLocation = { col, row };
  const hasAlreadyBeenShot = gameState.shotLocations[playerNumber].find(
    (shotLocation) => sameLocation(shotLocation, clickedLocation)
  );
  if (hasAlreadyBeenShot) {
    return cycleErrorOnElement(e.target);
  }
  let foundPreviousTarget = document.querySelector(".targeted");
  if (foundPreviousTarget) {
    while (foundPreviousTarget) {
      foundPreviousTarget.classList.remove("targeted");
      foundPreviousTarget = document.querySelector(".targeted");
    }
  }
  e.target.classList.add("targeted");
  document.getElementById(
    `fireButton${playerNumber}`
  ).innerText = `${getRowLetterFromNumber(row)}${col} - FIRE!`;
};

const addButtonListeners = (playerNumber) => {
  for (let row = 1; row < 11; row++) {
    for (let col = 1; col < 11; col++) {
      const cell = document.getElementById(`col${col}row${row}${playerNumber}`);
      cell.addEventListener("click", (e) => {
        handleClickCell(e, row, col, playerNumber);
      });
    }
  }
};

const populateSelfBoardWithShips = (targetBoard, playerNumber) => {
	gameState.shipInfo[playerNumber].forEach((shipInfo) => {
		createUnselectableSunkShip(shipInfo, "bottom", targetBoard)
	});
}

const endDeploymentStage = (e) => {
  console.log("END OF DEPLOYMENT");
  e.target.remove();
  PLAYER_2_VIEW_ELEMENT.classList.add("hidden");
  PLAYER_2_VIEW_ELEMENT.innerHTML = "";
  [
    { targetBoard: PLAYER_1_VIEW_ELEMENT, playerNumber: 1 },
    { targetBoard: PLAYER_2_VIEW_ELEMENT, playerNumber: 2 },
  ].forEach((e) => {
    createBoard(e.targetBoard, e.playerNumber);
    addButtonListeners(e.playerNumber);
    createFireButton(e.targetBoard, e.playerNumber);
    createBoard(e.targetBoard, `self${e.playerNumber}`);
		populateSelfBoardWithShips(e.targetBoard, e.playerNumber)
  });
  executeRound();
};
const createSubmitLocationsButton = (playerNumber) => {
  const confirmButton = document.createElement("button");
  confirmButton.innerText = "DEPLOY SHIPS";
  confirmButton.classList.add("game-button");
  MAIN.appendChild(confirmButton);
  if (playerNumber === 1) {
    confirmButton.addEventListener("click", moveToPlayer2Deploy);
  } else {
    confirmButton.addEventListener("click", endDeploymentStage);
  }
};

const beginPlayerDeployment = (playerNumber) => {
  if (playerNumber === 1) {
    PLAYER_1_VIEW_ELEMENT.classList.remove("hidden");
  } else {
    createBoard(PLAYER_2_VIEW_ELEMENT);
    PLAYER_2_VIEW_ELEMENT.classList.remove("hidden");
  }
  OVERLAY_ELEMENT.innerHTML = "";
  OVERLAY_ELEMENT.classList.add("hidden");
  createMoveableShips(playerNumber);
  setOccupiedCells(playerNumber);
  createSubmitLocationsButton(playerNumber);
};

const createBoard = (parent, idAddOn) => {
  for (let row = 0; row < 11; row++) {
    for (let col = 0; col < 11; col++) {
      const cell = document.createElement(typeof idAddOn === "string" ? idAddOn.includes("self") ? "div":"button" : "button");
      if (row === 0) {
        cell.tabIndex = "-1";
        cell.classList.add("cell-label");
        if (col !== 0) {
          cell.innerText = col;
        }
      } else if (col === 0) {
        cell.innerText = getRowLetterFromNumber(row);
        cell.classList.add("cell-label");
        cell.tabIndex = "-1";
      } else {
        cell.classList.add("cell");
        if (idAddOn) {
          cell.classList.add(idAddOn);
          // cell.tabIndex = "-1";
        }
        cell.id = `col${col}row${row}${idAddOn || ""}`;
      }
      parent.appendChild(cell);
    }
  }
};

const createReadyButton = (message) => {
  OVERLAY_ELEMENT.innerHTML = "";
  INSTRUCTIONS_ELEMENT.innerText = message;
  const readyButton = document.createElement("button");
  readyButton.classList.add("absolute-center", "game-button");
  readyButton.innerText = "READY";
  OVERLAY_ELEMENT.appendChild(readyButton);
  return readyButton;
};

const createPlayerNameInputs = () => {
  [1, 2].forEach((playerNumber) => {
    const playerNameLabel = document.createElement("label");
    playerNameLabel.innerText = `PLAYER ${playerNumber}:`;
    const playerNameInput = document.createElement("input");
    playerNameInput.classList.add("name-input");
		const savedName = localStorage.getItem("bs-player"+playerNumber);
		playerNameInput.value = savedName || `Player ${playerNumber}`;
    playerNameInput.id = `name${playerNumber}`;
    playerNameLabel.appendChild(playerNameInput);
    OVERLAY_ELEMENT.appendChild(playerNameLabel);
  });
};
const createStartButton = () => {
  const startGameButton = document.createElement("button");
  startGameButton.innerText = "START GAME";
  startGameButton.classList.add("game-button");
  OVERLAY_ELEMENT.appendChild(startGameButton);
  return startGameButton;
};
const handleClickStart = () => {
  const input1 = document.getElementById("name1");
  const name1 = input1.value;
  if (name1 === "") {
    input1.classList.add("error");
    input1.addEventListener("focus", () => {
      input1.classList.remove("error");
    });
    return;
  }
  const input2 = document.getElementById("name2");
  const name2 = input2.value;
  if (name2 === "") {
    input2.classList.add("error");
    input2.addEventListener("focus", () => {
      input2.classList.remove("error");
    });
    return;
  }
  gameState.player1Name = name1;
  gameState.player2Name = name2;
	localStorage.setItem("bs-player1", name1);
	localStorage.setItem("bs-player2", name2);
  createReadyButton(
    // `Player 1: ${name1}'s turn to deploy ships`
		`${name1}'s turn to deploy ships`
  ).addEventListener("click", () => beginPlayerDeployment(1));
};
const createStartButtonAndNameInputs = () => {
  createPlayerNameInputs();
  createStartButton().addEventListener("click", handleClickStart);
};

const initializeGame = () => {
  gameState = JSON.parse(JSON.stringify(INITIAL_GAME_STATE));
  INSTRUCTIONS_ELEMENT.innerText = INITIAL_INSTRUCTIONS;
  createBoard(PLAYER_1_VIEW_ELEMENT);
  createStartButtonAndNameInputs();
};

const clearGame = () => {
	location.reload();
  // gameState = null;
  // PLAYER_1_VIEW_ELEMENT.innerHTML = "";
  // PLAYER_2_VIEW_ELEMENT.innerHTML = "";
  // OVERLAY_ELEMENT.innerHTML = "";
};

initializeGame();