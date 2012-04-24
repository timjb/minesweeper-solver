function main () {
  var field = new Field(16, 16, 40);
  var solver = new Solver(field);
  solver.onGuess = function () {
    console.log("Guess");
  };

  /*
  function loop () {
    setTimeout(function () {
      solver.step();
      render();
      if (field.left > 0) { loop(); }
    }, 200);
  }
  */

  var fieldEl = document.getElementById('field');
  function render() {
    fieldEl.innerHTML = solver.render();
  }

  var stepBtn = document.getElementById('step-btn');
  stepBtn.onclick = function () { solver.step(); render(); };

  render();
  //loop();
}

main();