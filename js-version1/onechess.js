var Matrix = function(arr) {
    this.data = arr;
    this.row = arr.length;
    this.column = arr.length ? arr[0].length : 0;
};
Matrix.prototype.multiply = function(matrix) {
    if (this.column == matrix.row) {
        var row = this.row,
            column = matrix.column,
            arr = [];
        for (var i = 0; i < row; i++) {
            arr[i] = [];
            for (var j = 0; j < column; j++) {
                var sum = 0;
                for (var n = 0; n < this.column; n++) {
                    sum += (this.data[i][n] * matrix.data[n][j]);
                }
                arr[i][j] = sum;
            }
        }
        return new Matrix(arr);
    }
};
var Board = function(row, column) {
    this.data = [];
    this.row = row;
    this.column = column;
    this.depth = 0;
    for (var i = 0; i < row; i++) {
        this.data[i] = [];
        for (var j = 0; j < column; j++) {
            this.data[i][j] = Board.NONE;
        }
    }
};
Board.prototype.toString = function() {
    return this.data.map(function(data) {
        return data.toString();
    }).join('\n');
};
Board.prototype.put = function(row, column, type) {
    this.data[row][column] = type;
    this.currentRow = row;
    this.currentColumn = column;
    return this;
};
Board.prototype.setData = function(data) {
    for (var i = 0; i < this.row; i++) {
        for (var j = 0; j < this.column; j++) {
            this.data[i][j] = data[i][j];
        }
    }
    return this;
};
Board.prototype.availableBoards = function(type) {
    var availableBoards = [];
    for (var i = 0; i < this.row; i++) {
        for (var j = 0; j < this.column; j++) {
            if (this.data[i][j] == Board.NONE) {
                var board = new Board(this.row, this.column);
                board.setData(this.data);
                board.put(i, j, type);
                board.nextRow = i;
                board.nextColumn = j;
                availableBoards.push(board);
            }
        }
    }
    return availableBoards;
};
Board.prototype.rotate = function() {
    var board = new Board(this.row, this.column),
        dx = Math.floor(this.column / 2),
        dy = Math.floor(this.row / 2);
    for (var i = 0; i < this.row; i++) {
        for (var j = 0; j < this.column; j++) {
            var type = this.data[i][j];
            var matrix = new Matrix([
                [i, j, 1]
            ]);
            var translateMatrix1 = new Matrix([
                [1, 0, 0],
                [0, 1, 0],
                [-dx, -dy, 1]
            ]);
            var translateMatrix2 = new Matrix([
                [1, 0, 0],
                [0, 1, 0],
                [dx, dy, 1]
            ]);
            var rotateMatrix = new Matrix([
                [0, -1, 0],
                [1, 0, 0],
                [0, 0, 1]
            ]);
            var res = matrix.multiply(translateMatrix1).multiply(rotateMatrix).multiply(translateMatrix2);
            board.put(res.data[0][0], res.data[0][1], type);
        }
    }
    return board;
};

Board.prototype.hash = function(sourceRadix, targetRadix) {
    var str = this.data.map(function(arr) {
        return arr.join('');
    }).join('');
    return parseInt(str, sourceRadix).toString(targetRadix);
};
Board.prototype.evaluate = function() {
    var maxW = minW = 0,
        maxCount, minCount, noneCount;
    for (var i = 0; i < this.row; i++) {
        maxCount = minCount = noneCount = 0;
        for (var j = 0; j < this.column; j++) {
            var type = this.data[i][j];
            if (type == Board.MAX) {
                maxCount++;
            } else {
                if (type == Board.MIN) {
                    minCount++;
                } else {
                    noneCount++;
                }
            }
        }
        if (maxCount == this.column) {
            return Infinity;
        } else {
            if (minCount == this.column) {
                return -Infinity;
            } else {
                if (!maxCount) {
                    minW++;
                }
                if (!minCount) {
                    maxW++;
                }
            }
        }
    }
    for (var i = 0; i < this.column; i++) {
        maxCount = minCount = noneCount = 0;
        for (var j = 0; j < this.row; j++) {
            var type = this.data[j][i];
            if (type == Board.MAX) {
                maxCount++;
            } else {
                if (type == Board.MIN) {
                    minCount++;
                } else {
                    noneCount++;
                }
            }
        }
        if (maxCount == this.row) {
            return Infinity;
        } else {
            if (minCount == this.row) {
                return -Infinity;
            } else {
                if (!maxCount) {
                    minW++;
                }
                if (!minCount) {
                    maxW++;
                }
            }
        }
    }
    maxCount = minCount = noneCount = 0;
    for (var i = 0; i < this.column; i++) {
        var type = this.data[i][i];
        if (type == Board.MAX) {
            maxCount++;

        } else {
            if (type == Board.MIN) {
                minCount++;
            } else {
                noneCount++;
            }
        }
    }
    if (maxCount == this.row) {
        return Infinity;
    } else {
        if (minCount == this.row) {
            return -Infinity;
        } else {
            if (!maxCount) {
                minW++;
            }
            if (!minCount) {
                maxW++;
            }
        }
    }
    maxCount = minCount = noneCount = 0;
    for (var i = 0; i < this.column; i++) {
        var type = this.data[i][this.column - i - 1];
        if (type == Board.MAX) {
            maxCount++;
        } else {
            if (type == Board.MIN) {
                minCount++;
            } else {
                noneCount++;
            }
        }
    }
    if (maxCount == this.row) {
        return Infinity;
    } else {
        if (minCount == this.row) {
            return -Infinity;
        } else {
            if (!maxCount) {
                minW++;
            }
            if (!minCount) {
                maxW++;
            }
        }
    }
    return maxW - minW;
};
var max = function(currentBoard, depth) {
    var w;
    if (depth == 0) {
        w = currentBoard.evaluate();
        return {
            w: w
        };
    } else {
        var boards = currentBoard.availableBoards(Board.MAX);
        // console.log('搜索MAX' + boards.length + '个棋局');
        var maxF = -Infinity,
            maxBoard;
        boards.forEach(function(board) {
            board.f = min(board, depth - 1).w;
            if (board.f > maxF) {
                maxF = board.f;
                maxBoard = board;
            }
        });
        if (maxBoard) {
            w = maxF;
            currentBoard.put(maxBoard.nextRow, maxBoard.nextColumn, Board.MAX);
            return {
                w: w,
                is_ended: false,
                is_win: w == Infinity ? true : false
            }
        } else {
            w = currentBoard.evaluate();
            return {
                w: w,
                is_ended: true,
                is_win: w == Infinity ? true : false
            }
        }
    }
};
var min = function(currentBoard, depth) {
    var w;
    if (depth == 0) {
        w = currentBoard.evaluate();
        return {
            w: w
        };
    } else {
        var boards = currentBoard.availableBoards(Board.MIN);
        // console.log('搜索MIN' + boards.length + '个棋局');
        var minF = Infinity,
            minBoard;
        boards.forEach(function(board) {
            board.f = max(board, depth - 1).w;
            if (board.f < minF) {
                minF = board.f;
                minBoard = board;
            }
        });
        if (minBoard) {
            w = minF;
            currentBoard.put(minBoard.nextRow, minBoard.nextColumn, Board.MIN);
            return {
                w: w,
                is_ended: false,
                is_win: w == -Infinity ? true : false
            }
        } else {
            w = currentBoard.evaluate();
            return {
                w: w,
                is_ended: true,
                is_win: w == -Infinity ? true : false
            }
        }
    }
};
Board.NONE = 0;
Board.MAX = 1;
Board.MIN = 2;