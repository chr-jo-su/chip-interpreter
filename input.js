var keyboard_input = new Array(16).fill(false);;

document.addEventListener('keydown', function (event) {
  keyboard_input[parseInt(event.key, 16)] = true;
  if (tmp_reg != -1) {
    registers[tmp_reg] = Math.max(0, Math.min(parseInt(event.key, 16), 15));
    tmp_reg = -1;
    cpu_running = true;
  }
});

document.addEventListener('keyup', function (event) {
  keyboard_input[parseInt(event.key, 16)] = false;
});

