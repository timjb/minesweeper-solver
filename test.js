var minesweeper = require('./solver.js');

var WIDTH = 16;
var HEIGHT = 16;
var MINES = 40;

function play () {
  var field = new minesweeper.Field(WIDTH, HEIGHT, MINES);
  var solver = new minesweeper.Solver(field);
  try {
    solver.solve();
  } catch (exc) {
    return false;
  }
  return true;
}

function test (n) {
  var successful = 0;
  for (var i = 0; i < n; i++) {
    if (play()) { successful++; }
  }
  var percentage = Math.round(1000*(successful/n))/10;
  console.log(
    "Percentage of successful games on a " + WIDTH + "x" + HEIGHT +
    " field with " + MINES + " mines: " + percentage + "%."
  );
}

test(10000);