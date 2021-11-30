let players = [];
let currentPlayer = 0;

const player = function(name) {
    let score = 0;

    //An array of all possible 3-tile long lines where a match can occur.
    const responseMessages = [
        "SCORE GOT",
        "SCORE INCREASED",
        "SCORE RESET",
        "UNKNOWN COMMAND",
        "NAME GOT"
    ];

    //Function to handle requests made to the player and report back. Takes input in the form
    //of an integer. Command indexes are 0 for to get current score, 1 to increase score by 1, 2 to reset
    //score to 0 and 3 to get player name. Returns a response code structured [responseArgs,...].
    const requestHandler = function (command) {
        let response;

        switch(command){
            case 0:
                response = [0,score];
                break;
            case 1:
                response = [1];
                score++;
                break;
            case 2:
                response = [2];
                break;
            case 3:
                response = [4,name];
                break;
            default:
                response = [3];
                break;
        };

        return response;
    };

    return {
        requestHandler,
        responseMessages
    };
};

const gameBoard = (() => {
        //The gameboard consists of three arrays representing rows, each "row" consisting of three empty
        //strings which represent individual tiles on a given "column". 0 represents an empty
        //tile, a tile claimed by Player 1 is indicated by 1 and one claimed by Player 2 is indicated by 2.
        let tiles = [[0,0,0],[0,0,0],[0,0,0]];

        //An array of all the row and column data for each legal 3-tile long lines where a match can occur.
        //Not the cleanest solution, but works for a small number of lines such as this one.
        const lineRef = [
              [[0,0],[0,1],[0,2]],
              [[1,0],[1,1],[1,2]],
              [[2,0],[2,1],[2,2]],
              [[0,0],[1,0],[2,0]],
              [[0,1],[1,1],[2,1]],
              [[0,2],[1,2],[2,2]],
              [[0,0],[1,1],[2,2]],
              [[0,2],[1,1],[2,0]],
        ];

        //An array of all possible response messages.
        const responseMessages = [
            "TILE SET",
            "TILE NOT EMPTY",
            "LINE RESET",
            "BOARD RESET",
            "MATCH NOT FOUND",
            "MATCH FOUND",
            "UNKNOWN COMMAND",
            "STATUS GOT"
        ];

        const _checkTie = function (array) {
            const arrayReducer = (prevArray, nextArray) => prevArray.concat(nextArray);
            let reducedArray = array.reduce(arrayReducer);
            if(reducedArray.includes(0)){
                return false;
            }
            else{
                return true;
            };
        };

        //Function to claim tiles. "Value" is player index in the players list, tile is the coordinates of
        //a given tile. The function checks if the game is currently in a tied state, if so, it lets a player
        //claim an already claimed tile.
        const _setTile = function (value,tile) {
            let response = [];
            let tied = _checkTie(tiles);
            if(tied === false){
                if (tiles[tile[0]][tile[1]] === 0) {
                    tiles[tile[0]][tile[1]] = value;
                    const tileElem = document.getElementById(`${tile[0]}${tile[1]}`);
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
                    response.push(0);
                    const checkMessage = _checkBoard();
                    response.push(checkMessage);
                }
                else {
                    response.push(1);
                };
            }
            else{
                if (tiles[tile[0]][tile[1]] !== value){
                    const tileElem = document.getElementById(`${tile[0]}${tile[1]}`);
                    tileElem.classList = ["tile"];
                    tiles[tile[0]][tile[1]] = value;
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
                    response.push(0);
                    const checkMessage = _checkBoard();
                    response.push(checkMessage);
                }
                else {
                    response.push(1);
                }
            };
            return response;
        };

        const _resetLine = function (lineIndex) {
            let matchingLine = lineRef[lineIndex]
            matchingLine.forEach(tile => {
                tiles[tile[0]][tile[1]] = 0;
                const tileElem = document.getElementById(`${tile[0]}${tile[1]}`);
                tileElem.classList = ["tile"];
            });
            return 2;
        };

        const _resetBoard = function () {
            for(let x = 0; x < 3; x++){
                for(let y = 0; y < 3; y++){
                    const tileElem = document.getElementById(`${x}${y}`);
                    tileElem.classList = ["tile"];
                    tiles[x][y] = 0;
                };
            };
            return [3];
        };

        //Checks every tile in a given line, returns true if they're all the same value to indicate a match,
        //otherwise returns false. Doesn't report all empties as a match.
        const _checkTiles = function (line) {
            if(line[0] !== 0){
                return line.every((tile) => {
                    return tile === line[0];
                });
            }
            else {
                return false;
            };
        };

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

    const _createPlayers = function () {
        let playerOne = player(document.getElementById("playerOneName").value);
        players.push(playerOne);
        let playerTwo = player(document.getElementById("playerTwoName").value);
        players.push(playerTwo);
    }

    const claimTile = function (tile) {
        let response = gameBoard.requestHandler([1,[currentPlayer,tile]]);

        if(response.length > 1 && response[1].slice(-1)[0] === 2){
            playerResponse = players[currentPlayer-1].requestHandler(1);
            DOMManipulator.updateScores();
        };

        if(response[0] === 0){
            changeTurn();
        };
    };

    const changeTurn = function () {
        if(currentPlayer === 1){
            currentPlayer = 2;
        }
        else if(currentPlayer === 2){
            currentPlayer = 1;
        };
    };

    const startGame = function () {
        document.getElementById("reset").classList.remove("hidden");
        document.getElementById("start").classList.add("hidden");
        document.getElementById("playerOneName").disabled = true;
        document.getElementById("playerTwoName").disabled = true;
        players = [];
        _createPlayers();
        currentPlayer = 1;
        gameRunning = true;
    };

    const resetGame = function () {
        document.getElementById("playerOneName").value = "Player 1";
        document.getElementById("playerOneScore").innerText = "0";
        document.getElementById("playerTwoScore").innerText = "0";
        document.getElementById("reset").classList.add("hidden");
        document.getElementById("start").classList.remove("hidden");
        document.getElementById("vsPlayer").classList.remove("hidden");
        document.getElementById("vsAI").classList.add("hidden");
        document.getElementById("playerTwoName").value = "Player 2";
        document.getElementById("playerOneName").disabled = false;
        document.getElementById("playerTwoName").disabled = false;
        currentPlayer = 0;
        gameMode = 0;
        gameBoard.requestHandler([0]);
        players.forEach(player => {
            player.requestHandler(2)
        });
        gameRunning = false;
    };

    const changeMode = function (mode) {
        if(gameRunning === false){
            switch(mode){
                case 0:
                    document.getElementById("vsPlayer").classList.add("hidden");
                    document.getElementById("vsAI").classList.remove("hidden");
                    document.getElementById("playerTwoName").value = "Robobot";
                    document.getElementById("playerTwoName").disabled = true;
                    break;
                case 1:
                    document.getElementById("vsPlayer").classList.remove("hidden");
                    document.getElementById("vsAI").classList.add("hidden");
                    document.getElementById("playerTwoName").value = "Player 2";
                    document.getElementById("playerTwoName").disabled = false;
                    break;
                default:
                    break;
            };
        };
    };

    return{
        claimTile,
        startGame,
        resetGame,
        changeMode,
        changeTurn
    };

})();

const timer = (() => {
    let timeSet = 0;
    let timeLeft = 0;

    const _countDown = function () {

    };

    const setTime = function (time) {
        timeSet = time;
    };

    return{
        setTime,
    }
})();

const DOMManipulator = (() => {

    const updateScores = function () {
        const scoreOne = document.getElementById("playerOneScore");
        const scoreTwo = document.getElementById("playerTwoScore");

        scoreOne.innerText = players[0].requestHandler(0)[1];
        scoreTwo.innerText = players[1].requestHandler(0)[1];
    };

    return {
        updateScores
    };

})();

const initializer = (() => {

    const _addTileFunctions = function () {
        const tiles = document.querySelectorAll(".tile")
        tiles.forEach(element => {
            element.onclick = () => gameLogic.claimTile([parseInt(element.id[0]),parseInt(element.id[1])]);
        });
        document.getElementById("start").onclick = () => gameLogic.startGame();
        document.getElementById("reset").onclick = () => gameLogic.resetGame();
        document.getElementById("vsPlayer").onclick = () => gameLogic.changeMode(0);
        document.getElementById("vsAI").onclick = () => gameLogic.changeMode(1);
    };

    const start = function () {
        players = [];
        document.getElementById("playerOneName").value = "Player 1";
        document.getElementById("playerTwoName").value = "Player 2";
        _addTileFunctions();
    };

    return {
        start
    };
})();

initializer.start()