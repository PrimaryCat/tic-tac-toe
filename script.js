const player = () => {

};

const gameBoard = (() => {

        let tiles = [["","",""],["","",""],["","",""]];

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

    const _checkTiles = function (line) {
        return line.every((tile) => {
            return tile === line[0];
        });
    };

    const _checkMatch = function (lines) {
        let gameEnd = false;

        for(let line of lines){
            gameEnd = _checkTiles(line);

            if(gameEnd === true){
                break;
            };
        };
        
        return gameEnd;
    };

})();