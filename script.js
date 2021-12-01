const player = function (name, value, raw, opponent){

    let score = 0;

    return{
        name: name,
        value: value,
        raw: raw,
        opponent: opponent,
        score
    };
};

const boardLogic = (() => {
    const gameBoard = [0,0,0,0,0,0,0,0,0];

    const lineRef = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

    const _checkFull = function (array) {
        if(array.includes(0)){
            return false;
        };
        return true;
    };

    const claimTile = function (player,tileIndex){
        const boardFull = _checkFull(gameBoard);
        const legalSpace = [0];
        if(boardFull){
            legalSpace.push(player.opponent.value);
        };
        if(legalSpace.includes(gameBoard[tileIndex])){
            gameBoard[tileIndex] = player.value;
            displayLogic.claimTile(player.value,tile);
            return true;
        };
        return false;
    };

    const resetLine = function (refIndex){
        const reference = lineRef[refIndex];
        reference.forEach(tile => {
            gameBoard[tile] = 0;
            displayLogic.claimTile(0,tile);
        });
    };

    const resetBoard = function (){
        for(let tile = 0; tile < 9; tile++){
            gameBoard[tile] = 0;
            displayLogic.claimTile(0,tile);
        };
    };
    
    const checkMatch = function (line){
        if(line[0] !== 0){
            return line.every((tile) => {
                tile === line[0];
            });
        };
        return false;
    };

    const checkBoard = function (){
        for(let reference of lineRef){
            const line = [reference[0],reference[1],reference[2]];
            const match = checkMatch(line);
            if(match === true){
                resetLine(lineRef.indexOf(reference));
                return true;
            };
        };
        return false;
    };

})();

const gameBoard = (() => {

        //Checks the whole board for matches, returns true if a match is present on the board,
        //otherwise returns false.
        const _checkBoard = function () {
            let response = [];
            let matchFound;
            let lineIndex = null;

            for(let ref of lineRef){
                let line = [];
                
                line.push(tiles[ref[0][0]][ref[0][1]]);
                line.push(tiles[ref[1][0]][ref[1][1]]);
                line.push(tiles[ref[2][0]][ref[2][1]]);

                matchFound = _checkTiles(line);

                if(matchFound === true){
                    lineIndex = lineRef.indexOf(ref);
                    response.push(5);
                    let message = _resetLine(lineIndex);
                    response.push(message);
                    break;
                }
                else {
                    response.push(4);
                };
            };
        
            return response;
        };

        //Function to handle requests made to the gameboard and report back. Takes input in the form
        //of an array structured [commandIndex,command]. Command indexes are 0 for a board reset, 1 for
        //player input and 2 to get board status. For player input, the command is an array structured as
        //[playerValue,[row,column]]. Returns a response code structured [responseArgs,...].
        const requestHandler = function (request) {
            let response;
            switch(request[0]){
                case 0:
                    response = _resetBoard();
                    break;
                case 1:
                    response = _setTile(request[1][0],request[1][1]);
                    break;
                case 2:
                    response = [8,tiles];
                    break;
                default:
                    response = [6];
                    break;
            };
            return response;
        };

        return{
          requestHandler,
          responseMessages,
        };
})();

const gameLogic = (() => {
    //Gamemode for vs player and vs ai. 0 denotes vs player, 1 denotes vs ai.
    let gameMode = 0;
    let gameRunning = false;

    let startTimerVar;
    let startTimerTimeout;

    const _countDown = function () {
        startTimerTimeout--;
        if(startTimerTimeout === 0){
            _stopTimer();
            DOMManipulator.toggleStartTimer();
            _startGame();
        };
        DOMManipulator.updateStartTimer(startTimerTimeout);
    };

    const _checkWin = function () {
        let gameEnd = false;
        if(players[0].requestHandler(0)[1] === 5){
            gameEnd = true;
            return [gameEnd,players[0]];
        }
        else if(players[1].requestHandler(0)[1] === 5){
            gameEnd = true;
            return [gameEnd,players[1]];
        }
        else {
            return [gameEnd];
        };
    }

    const _endGame = function (endArray) {
        if(endArray[0] === true){
            currentPlayer = 0;
            DOMManipulator.updateTurn;
            timer.stopTimer();
            gameRunning = false;
            DOMManipulator.displayWinner(endArray[1]);
        }
    };

    const _stopTimer = function () {
        window.clearInterval(startTimerVar)
    };

    const _createPlayers = function () {
        let playerOne = player(document.getElementById("playerOneName").value);
        players.push(playerOne);
        let playerTwo = player(document.getElementById("playerTwoName").value);
        players.push(playerTwo);
    }

    const _startGame = function () {
        //Clear player list.
        players = [];
        //Create new players.
        _createPlayers();
        //Set the current player to Player 1.
        currentPlayer = 1;
        DOMManipulator.updateTurn(currentPlayer);
        //Update the DOM.
        DOMManipulator.startDOM();
        //start the turn timer.
        timer.startTimer();
    };

    const startTimer = function () {
        if(gameRunning === false){
            gameRunning = true;
            window.clearInterval(startTimerVar);
            DOMManipulator.toggleStartTimer();
            startTimerTimeout = 3;
            DOMManipulator.updateStartTimer(startTimerTimeout);
            startTimerVar = window.setInterval(_countDown,1000);
        };
    };

    const claimTile = function (tile) {
        let response = gameBoard.requestHandler([1,[currentPlayer,tile]]);

        if(response.length > 1 && response[1].slice(-1)[0] === 2){
            playerResponse = players[currentPlayer-1].requestHandler(1);
            DOMManipulator.updateScores();
        };

        if(response[0] === 0){
            changeTurn();
            timer.resetTimer();
        };

        _endGame(_checkWin());
    };

    const changeTurn = function () {
        if(currentPlayer === 1){
            currentPlayer = 2;
        }
        else if(currentPlayer === 2){
            currentPlayer = 1;
        };
        DOMManipulator.updateTurn(currentPlayer);
    };

    const resetGame = function () {
        //Clear current player.
        currentPlayer = 0;
        DOMManipulator.updateTurn(currentPlayer);
        //Set game mode to vs. Player.
        gameMode = 0;
        //Reset board.
        gameBoard.requestHandler([0]);
        //Reset player scores.
        players.forEach(player => {
            player.requestHandler(2)
        });
        //Stop the game.
        gameRunning = false;
        //Stop the timer.
        timer.stopTimer();
        //Reset the timer.
        timer.resetTimer();
        //Reset the timer.
        timer.setTime(3);
        //Reset the DOM.
        DOMManipulator.resetDOM();
    };

    const changeMode = function (mode) {
        if(gameRunning === false){
                DOMManipulator.changeDOMMode(mode);
                gameMode = mode;
                console.log(gameMode)
            };
    };

    const gameState = function () {
        return gameRunning;
    };

    return{
        claimTile,
        startTimer,
        resetGame,
        changeMode,
        changeTurn,
        gameState
    };

})();

const timer = (() => {
    let timeSet = 3;
    let timeLeft = 0;
    let timerVar;

    const _countDown = function () {
        timeLeft--;
        DOMManipulator.updateTimer(timeLeft);
        if(timeLeft === 0){
            resetTimer();
            DOMManipulator.updateTimer(timeLeft);
            gameLogic.changeTurn();
        }
    };

    const setTime = function (time) {
        if(gameLogic.gameState() === false){
            timeSet = time;
            DOMManipulator.setTimer(time);
        };
    };

    const startTimer = function () {
        resetTimer();
        timerVar = window.setInterval(_countDown,1000);
    };

    const stopTimer = function () {
        window.clearInterval(timerVar)
    };

    const resetTimer = function () {
        timeLeft = timeSet;
        DOMManipulator.updateTimer(timeLeft);
    };

    return{
        setTime,
        resetTimer,
        startTimer,
        stopTimer
    }
})();

const DOMManipulator = (() => {

    const updateTurn = function (player) {
        const indicator = document.getElementById("centerCard")
        switch(player){
            case 1:
                indicator.style.borderColor = "var(--accent-two)";
                break;
            case 2:
                indicator.style.borderColor = "var(--accent-three)";
                break;
            default:
                indicator.style.borderColor = "white";
                break;
        }
    }

    const updateScores = function () {
        const scoreOne = document.getElementById("playerOneScore");
        const scoreTwo = document.getElementById("playerTwoScore");
        scoreOne.innerText = players[0].requestHandler(0)[1];
        scoreTwo.innerText = players[1].requestHandler(0)[1];
    };

    const updateTimer = function (time) {
        const timerText = document.getElementById("timerDisplayText");
        const topCenter = document.getElementById("topCenter");
        const messageBox = document.getElementById("messageBox");

        timerText.innerText = time;

        switch(time){
            case 2:
                topCenter.style.backgroundColor = "var(--accent-one-dark)";
                messageBox.style.backgroundColor = "var(--accent-one-darker)";
                break;
            case 1:
                topCenter.style.backgroundColor = "var(--accent-two)";
                messageBox.style.backgroundColor = "var(--accent-two-dark)";
                break;
            default:
                topCenter.style.backgroundColor = "var(--accent-three)";
                messageBox.style.backgroundColor = "var(--accent-three-dark)";
                break;
        };
    };

    const updateStartTimer = function (time) {
        const timerText = document.getElementById("startTimerText");
        timerText.innerText = time;
    };

    const toggleStartTimer = function () {
        const timerDiv = document.getElementById("startTimer");
        timerDiv.classList.toggle("hidden");
    };

    const displayWinner = function (player) {
        const winnerName = document.getElementById("winnerName");
        winnerName.innerText = player.requestHandler(3)[1];
        document.getElementById("endCard").classList.remove("hidden");
        const playerIndex = players.indexOf(player);
        switch(playerIndex){
            case 0:
                winnerName.style.color = "var(--accent-two-dark)";
                break;
            case 1:
                winnerName.style.color = "var(--accent-three-dark)";
                break;
        };
    };

    const resetDOM = function () {
        document.getElementById("playerOneScore").innerText = "0";
        document.getElementById("playerTwoScore").innerText = "0";
        document.getElementById("reset").classList.add("hidden");
        document.getElementById("start").classList.remove("hidden");
        document.getElementById("vsPlayer").classList.remove("hidden");
        document.getElementById("vsAI").classList.add("hidden");
        document.getElementById("playerOneName").disabled = false;
        document.getElementById("playerTwoName").disabled = false;
        document.getElementById("playerOneName").style.color = "var(--foreground)";
        document.getElementById("playerTwoName").style.color = "var(--foreground)";
        document.getElementById("threeSecondButton").classList.add("tButtonOn")
        document.getElementById("fiveSecondButton").classList.remove("tButtonOn")
        document.getElementById("timerSetter").classList.remove("hidden");
        document.getElementById("timerDisplay").classList.add("hidden");
        document.getElementById("topCenter").classList.remove("shrink");
        document.getElementById("messageBox").classList.remove("round");
        document.getElementById("endCard").classList.add("hidden");
    };

    const startDOM = function () {
        document.getElementById("reset").classList.remove("hidden");
        document.getElementById("start").classList.add("hidden");
        document.getElementById("playerOneName").disabled = true;
        document.getElementById("playerTwoName").disabled = true;
        document.getElementById("playerOneName").style.color = "var(--foreground-light)";
        document.getElementById("playerTwoName").style.color = "var(--foreground-light)";
        document.getElementById("timerSetter").classList.add("hidden");
        document.getElementById("timerDisplay").classList.remove("hidden");
        document.getElementById("topCenter").classList.add("shrink");
        document.getElementById("messageBox").classList.add("round");
    };

    const setTimer = function (timer) {
        switch(timer){
            case 3:
                document.getElementById("threeSecondButton").classList.add("tButtonOn")
                document.getElementById("fiveSecondButton").classList.remove("tButtonOn")
                break;
            case 5:
                document.getElementById("fiveSecondButton").classList.add("tButtonOn")
                document.getElementById("threeSecondButton").classList.remove("tButtonOn")
                break;
        }

    }

    const changeDOMMode = function (mode) {
        switch(mode){
            case 1:
                document.getElementById("vsPlayer").classList.add("hidden");
                document.getElementById("vsAI").classList.remove("hidden");
                document.getElementById("playerTwoName").value = "Robobot";
                document.getElementById("playerTwoName").disabled = true;
                break;
            case 0:
                document.getElementById("vsPlayer").classList.remove("hidden");
                document.getElementById("vsAI").classList.add("hidden");
                document.getElementById("playerTwoName").value = "Player 2";
                document.getElementById("playerTwoName").disabled = false;
                break;
        };
    };

    return {
        updateScores,
        resetDOM,
        startDOM,
        changeDOMMode,
        setTimer,
        updateTimer,
        updateTurn,
        updateStartTimer,
        toggleStartTimer,
        displayWinner
    };

})();

const initializer = (() => {

    const _addTileFunctions = function () {
        const tiles = document.querySelectorAll(".tile")
        tiles.forEach(element => {
            element.onclick = () => gameLogic.claimTile([parseInt(element.id[0]),parseInt(element.id[1])]);
        });
    };

    const _addButtonFunctions = function () {
        document.getElementById("start").onclick = () => gameLogic.startTimer();
        document.getElementById("reset").onclick = () => gameLogic.resetGame();
        document.getElementById("vsPlayer").onclick = () => gameLogic.changeMode(1);
        document.getElementById("vsAI").onclick = () => gameLogic.changeMode(0);
        document.getElementById("threeSecondButton").onclick = () => timer.setTime(3);
        document.getElementById("fiveSecondButton").onclick = () => timer.setTime(5);
    };

    const start = function () {
        players = [];
        document.getElementById("playerOneName").value = "Player 1";
        document.getElementById("playerTwoName").value = "Player 2";
        _addTileFunctions();
        _addButtonFunctions();
    };

    return {
        start
    };
})();

initializer.start()