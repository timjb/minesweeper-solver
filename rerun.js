var minesweeper = require('./solver');

var WIDTH = 16;
var HEIGHT = 16;
var MINES = 40;

function testRun (mines, guesses) {
  var field = new minesweeper.Field(WIDTH, HEIGHT, MINES);
  field.mines = mines;
  var solver = new minesweeper.Solver(field);
  solver.guess = function () {
    if (guesses.length === 0) {
      console.log(solver.renderAscii());
      throw new Error("abort");
    }
    var pos = guesses.shift();
    solver.uncover(pos[0], pos[1]);
  };
  solver.solve();
  console.log(solver.renderAscii());
}

process.on('uncaughtException', function () {}); // silence

var t = true, f = false;
testRun(
  [f,f,t,f,f,f,f,f,f,f,f,t,t,f,t,f,f,f,f,t,f,f,f,f,f,f,t,f,f,f,t,f,f,f,f,f,f,f,f,f,f,f,f,f,f,f,f,f,f,f,f,t,f,f,f,f,f,f,f,f,f,f,t,f,f,f,f,t,f,f,f,t,t,f,f,f,f,f,t,f,f,f,f,f,f,f,f,f,f,t,f,f,f,f,t,f,f,f,f,f,f,f,f,f,f,f,f,f,f,f,f,f,f,f,t,t,f,f,f,f,f,f,f,f,t,f,f,f,f,f,f,f,f,f,t,f,f,t,f,f,f,f,t,f,t,f,f,f,f,f,f,f,f,f,f,f,f,f,f,f,f,f,f,t,f,f,t,f,f,t,f,t,f,f,f,t,f,t,f,t,f,f,f,t,f,f,f,f,f,f,f,f,f,f,t,f,f,f,f,f,t,f,f,f,f,t,f,t,f,f,f,f,f,f,f,f,f,f,t,f,f,f,f,f,f,f,f,f,f,t,f,f,t,f,f,f,f,f,f,f,t,f,f,f,f,f,f,f,f,f,f,t,f,t,f,f],
  [[9,3],[10,4],[9,2],[0,13],[4,1]]
);