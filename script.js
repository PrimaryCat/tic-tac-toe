const player = (name,color,value) => {
    let score = 0;

    const getScore = function () {
        return score;
    };

    const increaseScore = function () {
        score++;
    };

    const resetScore = function () {
        score = 0;
    }

    return {
        getScore,
        increaseScore,
        resetScore
    };
};

const gameBoard = (() => {
        //The gameboard consists of three arrays representing rows, each "row" consisting of three empty
        //strings which represent individual tiles on a given "column". 0 represents an empty
        //tile, a tile claimed by Player 1 is indicated by 1 and one claimed by Player 2 is indicated by 2.
        let tiles = [[0,0,0],[0,0,0],[0,0,0]];

        //An array of all possible 3-tile long lines where a match can occur.
        const lines = [
            //Horizontal Lines
            tiles[0],tiles[1],tiles[2],
            //Vertical Lines
            [tiles[0][0],tiles[1][0],tiles[2][0]],
            [tiles[0][1],tiles[1][1],tiles[2][1]],
            [tiles[0][2],tiles[1][2],tiles[2][2]],
            //Diagonal Lines
            [tiles[0][0],tiles[1][1],tiles[2][2]],
            [tiles[0][2],tiles[1][1],tiles[2][0]],
        ];

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
            "UNKNOWN COMMAND"
        ];

        const _setTile = function (value,tile) {
            let response = [];
            if (tiles[tile[0]][tile[1]] === "") {
                tiles[tile[0]][tile[1]] = value;
                response.push(0);
                const checkMessage = _checkBoard();
                response += checkMessage;
            }
            else {
                response.push(1);
            };
            return response;
        };

        const _resetLine = function (lineIndex) {
            let matchingLine = lineRef[lineIndex]
            matchingLine.forEach(tile => {
                tiles[tile[0]][tile[1]] = 0;
            });
            return 2;
        };

        const _resetBoard = function () {
            tiles.forEach(row => {
                row.forEach(tile => {
                    tile = 0;
                });
            });
            return [3];
        }

        //Checks every tile in a given line, returns true if they're all the same value to indicate a match,
        //otherwise returns false.
        const _checkTiles = function (line) {
            return line.every((tile) => {
                return [tile === line[0],tile];
            });
        };

        //Checks the whole board for matches, returns true if a match is present on the board,
        //otherwise returns false.
        const _checkBoard = function () {
            let response = [];
            let matchFound = false;
            let lineIndex = null;

            for(let line of lines){
                matchFound = _checkTiles(line)[0];

                if(matchFound === true){
                    lineIndex = lines.indexOf(line);
                    response.push(5);
                    let message = _resetLine(lineIndex);
                    response.push(message);
                    response.push(matchFound[1])
                    break;
                }
                else {
                    response.push(4);
                }
            };
            
            return response;
        };

        //Function to handle requests made to the gameboard and report back. Takes input in the form
        //of an array structured [commandIndex,command]. Command indexes are 0 for a board reset and 1 for
        //player input. For player input, the command is an array structured as [playerValue,[row,column]].
        //returns a response code structured [responseArgs,...].
        const requestHandler = function (request) {
            let response;
            switch(request[0]){
                case 0:
                    response = _resetBoard();
                    break;
                case 1:
                    response = _setTile(request[1]);
                    break;
                default:
                    response = [6];
                    break;
            };
            return response;
        };

        return{
          requestHandler,
          responseMessages
        };
})();

const gameLogic = (() => {


})();