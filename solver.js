var MineSweeper = (function () {
  function repeat (el, times) {
    var arr = [];
    for (var i = 0; i < times; i++) {
      arr[i] = el;
    }
    return arr;
  }

  function randomInt (n) {
    return Math.floor(Math.random() * n);
  }

  function range (s, e) {
    var arr = [];
    while (s <= e) { arr.push(s++); }
    return arr;
  }

  function forEachNeighbor (x, y, width, height, fn) {
    function call (x, y) {
      if (x >= 0 && x < width && y >= 0 && y < height) {
        fn(x, y);
      }
    }

    call(x-1, y-1);
    call(x,   y-1);
    call(x+1, y-1);
    call(x-1, y);
    call(x+1, y);
    call(x-1, y+1);
    call(x,   y+1);
    call(x+1, y+1);
  }

  function Field (width, height, minesCount) {
    this.width = width;
    this.height = height;
    this.minesCount = minesCount;
    this.left = width*height - minesCount;

    this.mines = repeat(false, width*height);
    this.covered = repeat(true, width*height);
    this.distributeMines(minesCount);
  }

  Field.prototype.distributeMines = function (n) {
    while (n > 0) {
      var i;
      do {
        i = randomInt(this.width*this.height);
      } while (this.mines[i]);
      this.mines[i] = true;
      n--;
    }
  };

  Field.prototype.getIndex = function (x, y) {
    return y*this.width + x;
  };

  Field.prototype.isCovered = function (x, y) {
    return this.covered[this.getIndex(x, y)];
  };

  Field.prototype.uncover = function (x, y) {
    var self = this;

    function isMine(x, y) { return self.mines[self.getIndex(x, y)]; }

    var i = this.getIndex(x, y);
    if (this.covered[i]) {
      this.covered[i] = false;
      this.left--;
    }

    if (isMine(x, y)) {
      throw new Error("KAAAWUMMMMM!");
    }

    var count = 0;
    forEachNeighbor(x, y, this.width, this.height, function (x, y) {
      if (isMine(x, y)) { count++; }
    });
    return count;
  };


  function Solver (field) {
    this.field = field;
    this.width = field.width;
    this.height = field.height;
    this.frontier = [];
    var n = this.width*this.height;

    this.cells = [];
    for (var i = 0; i < n; i++) {
      this.cells[i] = [];
    }
    this.createConstraint(field.minesCount, range(0, n-1));
  }

  Solver.prototype.onGuess = function () {};

  function Constraint (mines, cells) {
    this.mines = mines;
    this.cells = cells;
  }

  Solver.prototype.createConstraint = function (mines, cells, uncoverImmediately) {
    if (mines === 0) {
      if (uncoverImmediately) {
        this.uncoverImmediately(cells);
      } else {
        this.uncoverLater(cells);
      }
    }

    var constraint = new Constraint(mines, cells);
    for (var i = 0, l = cells.length; i < l; i++) {
      this.cells[cells[i]].push(constraint);
    }
    var overlapping = this.getOverlappingConstraints(constraint);
    for (i = 0, l = overlapping.length; i < l; i++) {
      if (this.unifyConstraints(constraint, overlapping[i])) { break; }
    }
  };

  Solver.prototype.removeConstraint = function (constraint) {
    for (var i = 0, l = constraint.cells.length; i < l; i++) {
      var cell = this.cells[constraint.cells[i]];
      var index = cell.indexOf(constraint);
      cell.splice(index, 1);
    }
  };

  Solver.prototype.getOverlappingConstraints = function (constraint) {
    var arr = [];
    for (var i = 0, l = constraint.cells.length; i < l; i++) {
      var cell = this.cells[constraint.cells[i]];
      for (var j = 0, k = cell.length; j < k; j++) {
        if (cell[j] === constraint) { continue; }
        if (arr.indexOf(cell[j]) === -1) { arr.push(cell[j]); }
      }
    }
    return arr;
  };

  Solver.prototype.unifyConstraints = function (a, b) {
    if (a.cells.length < b.cells.length) {
      var tmp = a;
      a = b;
      b = tmp;
    }

    var inA = [];
    var inB = [];
    var inAB = [];

    for (var i = 0, l = a.cells.length; i < l; i++) {
      if (b.cells.indexOf(a.cells[i]) !== -1) {
        inAB.push(a.cells[i]);
      } else {
        inA.push(a.cells[i]);
      }
    }

    for (i = 0, l = b.cells.length; i < l; i++) {
      if (inAB.indexOf(b.cells[i]) === -1) { inB.push(b.cells[i]); }
    }

    var aMore = a.mines - b.mines;
    if (aMore === inA.length) {
      this.removeConstraint(a);
      this.removeConstraint(b);
      this.createConstraint(aMore, inA);
      this.createConstraint(b.mines, inAB);
      this.createConstraint(0, inB);
      return true;
    }
    if (inB.length === 0) {
      this.removeConstraint(a);
      this.createConstraint(aMore, inA);
      // Re-add b
      this.removeConstraint(b);
      this.createConstraint(b.mines, b.cells);
      return true;
    }
    return false;
  };

  Solver.prototype.uncoverImmediately = function (cells) {
    for (var i = 0, l = cells.length; i < l; i++) {
      var pos = this.fromIndex(cells[i]);
      var j = this.frontier.indexOf(cells[i]);
      if (j !== -1) { this.frontier.splice(j, 1); }
      this.uncover(pos[0], pos[1]);
    }
  };

  Solver.prototype.uncoverLater = function (cells) {
    for (var i = 0, l = cells.length; i < l; i++) {
      if (this.field.mines[cells[i]]) { throw new Error("Mined field added to frontier list" + cells[i]); }
      if (this.field.covered[cells[i]] && this.frontier.indexOf(cells[i]) === -1) {
        this.frontier.unshift(cells[i]);
      }
    }
  };

  Solver.prototype.uncover = function (x, y) {
    var mines = this.field.uncover(x, y);

    var index = this.field.getIndex(x, y);
    this.createConstraint(0, [index]);

    var neighbors = [];
    var self = this;
    forEachNeighbor(x, y, this.width, this.height, function (x, y) {
      if (self.field.isCovered(x, y)) {
        var index = self.field.getIndex(x, y);
        neighbors.push(index);
      }
    });
    this.createConstraint(mines, neighbors, mines === 0);
  };

  Solver.prototype.randomCell = function () {
    this.onGuess();
    var x, y;
    do {
      x = randomInt(this.width);
      y = randomInt(this.height);
    } while (!this.field.isCovered(x, y));
    return [x, y];
  };

  Solver.prototype.fromIndex = function (i) {
    return [i % this.width, Math.floor(i/this.width)];
  };

  Solver.prototype.step = function () {
    var pos = this.frontier.length > 0 ? this.fromIndex(this.frontier.shift())
                                       : this.randomCell();
    this.uncover(pos[0], pos[1]);
  };

  Solver.prototype.solve = function () {
    while (this.field.left > 0) { this.step(); }
  };

  Solver.prototype.render = function () {
    var self = this;
    function isFlagged (x, y) {
      var constraints = self.cells[self.field.getIndex(x, y)];
      for (var i = 0, l = constraints.length; i < l; i++) {
        var constraint = constraints[i];
        if (constraint.cells.length === constraint.mines) { return true; }
      }
      return false;
    }

    var html = '';
    html += '<table>';
    for (var y  = 0; y < this.height; y++) {
      html += '<tr>';
      for (var x = 0; x < this.width; x++) {
        html += '<td>';
        if (!this.field.isCovered(x, y)) {
          html += this.field.uncover(x, y);
        } else if (isFlagged(x, y)) {
          html += '<span class="flag">M</span>';
        }
        html += '</td>';
      }
      html += '</tr>';
    }
    html += '</table>';
    return html;
  };

  return {
    Field: Field,
    Solver: Solver
  };

})();

if (typeof module === 'object') {
  module.exports = MineSweeper;
}