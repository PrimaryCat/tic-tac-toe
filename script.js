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
            domLogic.claimTile(player.value,tile);
            return true;
        };
        return false;
    };

    const resetLine = function (refIndex){
        const reference = lineRef[refIndex];
        reference.forEach(tile => {
            gameBoard[tile] = 0;
            domLogic.claimTile(0,tile);
        });
    };

    const reset = function (){
        for(let tile = 0; tile < 9; tile++){
            gameBoard[tile] = 0;
            domLogic.claimTile(0,tile);
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

const gameLogic = (() => {

    //Player functions and variables.
    let players = [];
    let currentPlayer;

    const createPlayers = function (){
        const playerNames = domLogic.getNames();
        const playerOne = player(playerNames[0],1,1,1);
        players.push(playerOne);
        const playerTwo = player(playerNames[1],2,-1,0);
        players.push(playerTwo);
    };

    //Game mode functions and variables.
    let gameMode = "human";

    const changeMode = function (mode){
        if(gameRunning !== true){
            gameMode = mode;
            domLogic.changeMode(mode);
        };
    };
    
    //Game flow functions and variables.
    let gameRunning = false;

    const start = function (){
        players = [];
        createPlayers();
        currentPlayer = players[0];
        domLogic.displayTurn(currentPlayer.value);
        domLogic.start();
        turnTimer.start();
    };

    const reset = function (){
        gameRunning = false;
        currentPlayer = null;
        gameMode = "human";
        boardLogic.reset();
        turnTimer.reset();
        domLogic.reset();
    };

    const end = function (){
        const endCondition = {gameWon: false, winner: null};

        players.forEach(player => {
            if(player.score === 5){
                endCondition.gameWon = true;
                endCondition.winner = player;
            };
        });

        if(endCondition.gameWon === true){
            currentPlayer = null;
            gameRunning = false;
            domLogic.displayTurn(0);
            turnTimer.stop();
            domLogic.displayWinner(endCondition.winner.value);
        };
    };

    //Turn order functions and variables.
    
    const takeTurn = function (tile){
        let tileClaimed = boardLogic.claimTile(currentPlayer,tile);

        if (tileClaimed === true){
            let matchMade = boardLogic.checkMatch();
            if (matchMade === true){
                currentPlayer.score = currentPlayer.score++;
                domLogic.updateScore(currentPlayer.value);
            };

            currentPlayer = players[currentPlayer.opponent];
            domLogic.displayTurn(currentPlayer.value);
            turnTimer.resetTurn();
            end();
        };
    };
    
    //Timer functions and variables.
    let startTimerVar;
    let startTimer;

    const _countDown = function (){
        startTimer--;
        if (startTimer === 0){
            window.clearInterval(startTimerVar);
            domLogic.toggleStartTimer();
            start();
        };
        domLogic.updateStartTimer(startTimer);
    };

    const createStartTimer = function (){
        if (gameRunning === false){
            gameRunning = true;
            window.clearInterval(startTimerVar);
            domLogic.toggleStartTimer();
            startTimer = 3;
            domLogic.updateStartTimer();
            startTimerVar = window.setInterval(_countDown,1000)
        };
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