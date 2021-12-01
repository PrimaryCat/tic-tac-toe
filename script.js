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
            gameRunning = false;
            domLogic.displayTurn(0);
            turnTimer.stop();
            domLogic.displayWinner(endCondition.winner);
            currentPlayer = null;
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

            changeTurn();
            end();
        };
    };

    const changeTurn = function () {
        currentPlayer = players[currentPlayer.opponent];
        domLogic.displayTurn(currentPlayer.value);
        turnTimer.resetTurn();
    }
    
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

const turnTimer = (() => {
    let timeSet = 3;
    let timeLeft = 0;
    let timeVar;

    const _countDown = function (){
        timeLeft--;
        domLogic.updateTurnTimer(timeLeft);
        if (timeLeft === 0){
            resetTurn();
            domLogic.updateTurnTimer(timeLeft);
            gameLogic.changeTurn();
        };
    };

    const set = function (time) {
        if (gameLogic.gameRunning === false){
            timeSet = time;
            domLogic.setTurnTimer(time);
        };
    };

    const start = function (){
        resetTurn();
        timerVar = window.setInterval(_countDown,1000);
    };

    const stop = function (){
        window.clearInterval(timerVar);
    };

    const resetTurn = function (){
        timeLeft = timeSet;
        domLogic.updateTurnTimer(timeLeft);
    };

    const reset = function (){
        stop();
        set(3);
        resetTurn();
    };

})();

const domLogic = (() => {

    //Get necessary DOM elements.
    const centerCard = document.getElementById("centerCard");
    //Player elements.
    const scoreOne = document.getElementById("playerOneScore");
    const nameOne = document.getElementById("playerOneName");
    const scoreTwo = document.getElementById("playerTwoScore");
    const nameTwo = document.getElementById("playerTwoName");
    //Turn timer elements.
    const turnTimerText = document.getElementById("timerDisplayText");
    const topCenter = document.getElementById("topCenter");
    const messageBox = document.getElementById("messageBox");
    const turnTimerSetter = document.getElementById("timerSetter");
    const turnTimerDisplay = document.getElementById("timerDisplay");
    //Start timer elements.
    const startTimerText = document.getElementById("startTimerText");
    const startTimerDiv = document.getElementById("startTimer")
    //End card elements.
    const endCard = document.getElementById("endCard");
    const winnerName = document.getElementById("winnerName");
    //Buttons.
    const resetButton = document.getElementById("reset");
    const startButton = document.getElementById("start");
    const humanButton = document.getElementById("vsPlayer");
    const aiButton = document.getElementById("vsAI");
    const tsButton = document.getElementById("threeSecondButton");
    const fsButton = document.getElementById("fiveSecondButton");

    const displayTurn = function (playerValue){
        switch(playerValue){
            case 1:
                centerCard.style.borderColor = "var(--accent-two)";
                break;
            case 2:
                centerCard.style.borderColor = "var(--accent-three)";
                break;
            default:
                centerCard.style.borderColor = "white";
                break;
        }
    };

    const updateScore = function (playerValue){
        switch(playerValue){
            case 1:
                scoreOne.innerText = players[0].score;
                break;
            case 2:
                scoreTwo.innerText = players[1].score;
                break;
            default:
                scoreOne.innerText = 0;
                scoreTwo.innerText = 0;
                break;
        };
    };

    const updateTurnTimer = function (time){
        turnTimerText.innerText = time;
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

    const setTurnTimer = function (timer) {
        switch(timer){
            case 3:
                tsButton.classList.add("tButtonOn")
                fsButton.classList.remove("tButtonOn")
                break;
            case 5:
                fsButton.classList.add("tButtonOn")
                tsButton.classList.remove("tButtonOn")
                break;
        };
    };

    const updateStartTimer = function (time) {
        startTimerText.innerText = time;
    };

    const toggleStartTimer = function () {
        startTimerDiv.classList.toggle("hidden");
    };

    const displayWinner = function (player) {
        winnerName.innerText = player.name;
        endCard.classList.remove("hidden");
        switch(player.value){
            case 1:
                winnerName.style.color = "var(--accent-two-dark)";
                break;
            case 2:
                winnerName.style.color = "var(--accent-three-dark)";
                break;
        };
    };

    const changeMode = function (mode) {
        switch(mode){
            case "ai":
                humanButton.classList.add("hidden");
                aiButton.classList.remove("hidden");
                nameTwo.value = "Robobot";
                nameTwo.disabled = true;
                break;
            case "human":
                humanButton.classList.remove("hidden");
                aiButton.classList.add("hidden");
                nameTwo.value = "Player 2";
                nameTwo.disabled = false;
                break;
        };
    };

    const reset = function () {
        updateScore(0);
        resetButton.classList.add("hidden");
        startButton.classList.remove("hidden");
        humanButton.classList.remove("hidden");
        aiButton.classList.add("hidden");
        nameOne.disabled = false;
        nameOne.style.color = "var(--foreground)";
        nameTwo.disabled = false;
        nameTwo.style.color = "var(--foreground)";
        tsButton.classList.add("tButtonOn")
        fsButton.classList.remove("tButtonOn")
        turnTimerSetter.classList.remove("hidden");
        turnTimerDisplay.classList.add("hidden");
        topCenter.classList.remove("shrink");
        messageBox.classList.remove("round");
        endCard.classList.add("hidden");
        displayTurn(0);
    };

    const start = function () {
        resetButton.classList.remove("hidden");
        startButton.classList.add("hidden");
        nameOne.disabled = true;
        nameOne.style.color = "var(--foreground-light)";
        nameTwo.disabled = true;
        nameTwo.style.color = "var(--foreground-light)";
        turnTimerSetter.classList.add("hidden");
        turnTimerDisplay.classList.remove("hidden");
        topCenter.classList.add("shrink");
        messageBox.classList.add("round");
    };

    const claimTile = function (value,tile){
        const tileElem = document.getElementById(`${tile}`);
        let className;
        switch(value){
            case 1:
                className = "playerOneSelect";
                break;
            case 2:
                className = "playerTwoSelect";
                break;
        };
        tileElem.classList.add(className);
    };

    const getNames = function (){
        return [nameOne.value, nameTwo.value]
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