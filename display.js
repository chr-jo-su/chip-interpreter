const displayCanvas = document.getElementById("displayCanvas");
var display_buffer = new Array(64 * 32).fill(false);

function checkIfBitSet(byte, position) {
  const mask = 1 << position;
  const result = byte & mask;
  return result !== 0;
}

function drawSprite(x, y, addr, n) {
  var pixel_unset = false;
  for (let byte = 0; byte < n; byte++) {
    for (let bit = 0; bit < 8; bit++) {
      let pos_x = (x + bit) % 64;
      let pos_y = (y + byte) % 32;
      display_buffer[pos_x + 64 * pos_y] = display_buffer[pos_x + 64 * pos_y] ^ checkIfBitSet(mem[addr + byte], 7 - bit);
      if (display_buffer[pos_x + 64 * pos_y] == 0)
        pixel_unset = true;
    }
  }

  if (pixel_unset)
    registers[0xF] = 1;
  else
    registers[0xF] = 0;
}

function clearDisplay() {
  displayCanvas.width = 64 * 10;
  displayCanvas.height = 32 * 10;

  for (let i = 0; i < display_buffer.length; i++)
    display_buffer[i] = 0;
}
clearDisplay();

function updateDisplay() {
  if (displayCanvas.getContext) {
    const ctx = displayCanvas.getContext('2d');

    for (let x = 0; x < 64; x++) {
      for (let y = 0; y < 32; y++) {
        if (display_buffer[64 * y + x])
          ctx.fillStyle = 'white';
        else
          ctx.fillStyle = 'black';

        ctx.fillRect(x * 10, y * 10, 10, 10);
      }
    }
  }
}
updateDisplay();