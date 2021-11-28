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
        //strings which represent individual tiles on a given "column". An empty string represents an empty
        //tile, a tile claimed by Player 1 is indicated by "X" and one claimed by Player 2 is indicated by "O"
        let tiles = [["","",""],["","",""],["","",""]];

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

        const _setTile = function (value,tile) {
            let response = ""
            if (tiles[tile[0]][tile[1]] === "") {
                tiles[tile[0]][tile[1]] = value;
                response = "TILE SET"
                const checkMessage = _checkBoard();
            }
            else {
                response = "TILE NOT EMPTY"
            };

        };

        const _resetLine = function (lineIndex) {
            let matchingLine = lineRef[lineIndex]
            matchingLine.forEach(tile => {
                tiles[tile[0]][tile[1]] = "";
            });
            return "LINE RESET"
        };

        const _resetBoard = function () {
            tiles.forEach(row => {
                row.forEach(tile => {
                    tile = "";
                });
            });
            return "BOARD RESET"
        }

        //Checks every tile in a given line, returns true if they're all the same value to indicate a match,
        //otherwise returns false.
        const _checkTiles = function (line) {
            return line.every((tile) => {
                return tile === line[0];
            });
        };

        //Checks the whole board for matches, returns true if a match is present on the board,
        //otherwise returns false.
        const _checkBoard = function () {
            let response = "MATCH NOT FOUND";
            let matchFound = false;
            let lineIndex = null;

            for(let line of lines){
                matchFound = _checkTiles(line);

                if(matchFound === true){
                    lineIndex = lines.indexOf(line);
                    response = "MATCH FOUND AT " + lineIndex
                    let message = _resetLine(lineIndex);
                    response = response + " " + message;
                    break;
                };
            };
            
            return response;
        };

        //Function to handle requests made to the gameboard and report back. Takes input in the form
        //of an array structured [commandIndex,command]. Command indexes are 0 for a board reset and 1 for
        //player input. For player input, the command is an array structured as [playerValue,[row,column]].
        //returns 
        const requestHandler = function (request) {
            let response = ""
            switch(request[0]){
                case 0:
                    response = _resetBoard();
                    break;
                case 1:
                    response = _setTile(request[1])
                    break;
                default:
                    response = "UNKNOWN COMMAND"
                    break;
            };
            return response;
        };

        return{
          requestHandler  
        };
})();

const gameLogic = (() => {


})();