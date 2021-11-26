const player = () => {

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

        const getLines = function () {
            return lines;
        };

        const setTile = function (row,column,value) {
            tiles[row][column] = value;
        };

        return{
            getLines,
            setTile
        }
})();

const gameLogic = (() => {

    //Checks every tile in a given line, returns true if they're all the same value to indicate a match,
    //otherwise returns false.
    const _checkTiles = function (line) {
        return line.every((tile) => {
            return tile === line[0];
        });
    };

    //Checks the whole board for matches, returns true if a match is present on the board,
    //otherwise returns false.
    const _checkBoard = function (lines) {
        let matchFound = false;

        for(let line of lines){
            matchFound = _checkTiles(line);

            if(matchFound === true){
                break;
            };
        };
        
        return matchFound;
    };

})();