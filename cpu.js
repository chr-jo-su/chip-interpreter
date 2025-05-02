var mem = new Uint8Array(4096);
var registers = new Uint8Array(16);
var reg_i = 0;
var pc = 0x200;
var sp = 0x50;
var sound_timer = 0;
var delay_timer = 0;
var opcode_str = "----";
var cpu_running = false;

function resetCPU() {
  reg_i = 0;
  pc = 0x200;
  sp = 0x50;
  sound_timer = 0;
  delay_timer = 0;
  opcode_str = "";
  cpu_running = false;
  for (let i = 0; i < mem.length; i++)
    mem[i] = 0;
  for (let i = 0; i < registers.length; i++)
    registers[i] = 0;
}

// preloaded sprite data at 0x000
function storeSprites() {
  const sprites = [
    0xF0, 0x90, 0x90, 0x90, 0xF0, // 0
    0x20, 0x60, 0x20, 0x20, 0x70, // 1
    0xF0, 0x10, 0xF0, 0x80, 0xF0, // 2
    0xF0, 0x10, 0xF0, 0x10, 0xF0, // 3
    0x90, 0x90, 0xF0, 0x10, 0x10, // 4
    0xF0, 0x80, 0xF0, 0x10, 0xF0, // 5
    0xF0, 0x80, 0xF0, 0x90, 0xF0, // 6
    0xF0, 0x10, 0x20, 0x40, 0x40, // 7
    0xF0, 0x90, 0xF0, 0x90, 0xF0, // 8
    0xF0, 0x90, 0xF0, 0x10, 0xF0, // 9
    0xF0, 0x90, 0xF0, 0x90, 0x90, // A
    0xE0, 0x90, 0xE0, 0x90, 0xE0, // B
    0xF0, 0x80, 0x80, 0x80, 0xF0, // C
    0xE0, 0x90, 0x90, 0x90, 0xE0, // D
    0xF0, 0x80, 0xF0, 0x80, 0xF0, // E
    0xF0, 0x80, 0xF0, 0x80, 0x80  // F
  ];


  for (let i = 0; i < sprites.length; i++)
    mem[i] = sprites[i];
}

function decrementTimers() {
  if (sound_timer > 0)
    sound_timer--;
  if (delay_timer > 0)
    delay_timer--;
}

function cycleCPU() {
  if (!cpu_running)
    return;

  decrementTimers();

  opcode_str = ((mem[pc] << 8) | mem[pc + 1]).toString(16);
  var opcode = mem[pc] >>> 4; // get first hexit
  switch (opcode) {

    default:
      console.error(`ERROR: opcode ${opcode_str} not implemented`);
      cpu_running = false;
      break;
  }

  updateDisplay();
  updateStats();
}
setInterval(cycleCPU, 16.6);