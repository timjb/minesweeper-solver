function main () {
  var WIDTH = 16, HEIGHT = 16, MINES = 40;
  var field, solver, lost;

  function byId (id) {
    return document.getElementById(id);
  }

  var fieldEl = byId('field');
  var statusEl = byId('status');

  function reset () {
    field = window.field = new MineSweeper.Field(WIDTH, HEIGHT, MINES);
    solver = window.solver = new MineSweeper.Solver(field);
    lost = null;
    solver.guess = function () {
      statusEl.innerHTML += "Guessing &hellip; ";
      MineSweeper.Solver.prototype.guess.apply(this);
    };
    field.blowUp = function (x, y) {
      lost = [x, y];
      MineSweeper.Solver.prototype.blowUp.apply(this);
    };
    statusEl.innerHTML = "Ready!";
    render();
  }
  function render() {
    fieldEl.innerHTML = solver.render();
    if (lost) {
      var tds = fieldEl.getElementsByTagName('td');
      var td = tds[field.getIndex(lost[0], lost[1])];
      td.className = 'mine';
    }
  }

  function step () {
    if (!lost && field.left > 0) {
      wrap(function () { solver.step(); });
    }
  }

  function run () {
    if (!lost) {
      wrap(function () { solver.solve(); });
    }
  }

  function wrap (fn) {
    statusEl.innerHTML = '';
    try { fn(); } catch (exc) {}
    if (lost) {
      statusEl.innerHTML += "BOOOM!";
    } else if (field.left === 0) {
      statusEl.innerHTML += "Field cleared!";
    } else {
      statusEl.innerHTML += field.left + " cells left.";
    }
    render();
  }

  byId('step-btn').onclick = step;
  byId('run-btn').onclick = run;
  byId('reset-btn').onclick = reset;

  reset();
}

main();
