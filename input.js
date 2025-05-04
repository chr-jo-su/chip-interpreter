var keyboard_input = new Array(16).fill(false);

const key_mapping = {
  '1': 1, '2': 2, '3': 3, '4': 0xC,
  'q': 4, 'w': 5, 'e': 6, 'r': 0xD,
  'a': 7, 's': 8, 'd': 9, 'f': 0xE,
  'z': 0xA, 'x': 0, 'c': 0xB, 'v': 0xF
};

document.addEventListener('keydown', function (event) {
  keyboard_input[key_mapping[event.key]] = true;
  if (tmp_reg != -1) {
    registers[tmp_reg] = key_mapping[event.key];
    tmp_reg = -1;
    cpu_running = true;
  }

});

document.addEventListener('keyup', function (event) {
  keyboard_input[key_mapping[event.key]] = false;
});

