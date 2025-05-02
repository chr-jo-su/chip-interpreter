var mem = new Uint8Array(4096);
var registers = new Uint8Array(16);
var reg_i = 0;
var pc = 0x200;
var sp = 0x50;
var sound_timer = 0;
var delay_timer = 0;
var opcode_str = "----";
var cpu_running = false;
var tmp_reg = -1; // for opcode 0xFX0A

var audioCtx = new AudioContext();
var oscillator = null;

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
  tmp_reg = -1;
  beeping = false;
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

  if (sound_timer > 0 && !beeping) {
    oscillator = audioCtx.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.value = 800;
    oscillator.connect(audioCtx.destination);
    beeping = true;
    oscillator.start();
  } else if (sound_timer <= 0 && beeping) {
    beeping = false;
    oscillator.stop();
  }

  var full_opcode = (mem[pc] << 8) | mem[pc + 1];
  var x = (full_opcode & 0x0F00) >>> 8;
  var y = (full_opcode & 0x00F0) >>> 4;
  var n = (full_opcode & 0x000F);
  var nnn = (full_opcode & 0x0FFF);
  var kk = (full_opcode & 0x00FF);
  opcode_str = full_opcode.toString(16);
  var opcode = mem[pc] >>> 4; // get first hexit
  pc += 2;

  console.log(`executing opcode ${opcode_str}`);
  switch (opcode) {
    case 0x0:
      if ((full_opcode & 0x00FF) == 0xEE) {
        pc = (mem[sp] << 8) | mem[sp + 1];
        sp -= 2;
      } else {
        clearDisplay();
      }
      break;

    case 0x1:
      pc = nnn;
      break;

    case 0x2:
      sp += 2;
      mem[sp] = (pc & 0xFF00) >>> 8;
      mem[sp + 1] = (pc & 0x00FF);
      pc = nnn;
      break;

    case 0x3:
      if (registers[x] == kk)
        pc += 2;
      break;

    case 0x4:
      if (registers[x] != kk)
        pc += 2;
      break;

    case 0x5:
      if (registers[x] == registers[y])
        pc += 2;
      break;

    case 0x6:
      registers[x] = kk;
      break;

    case 0x7:
      registers[x] = registers[x] + kk;
      break;

    case 0x8:
      switch (full_opcode & 0x000F) {
        case 0x0:
          registers[x] = registers[y];
          break;

        case 0x1:
          registers[x] = registers[x] | registers[y];
          break;

        case 0x2:
          registers[x] = registers[x] & registers[y];
          break;

        case 0x3:
          registers[x] = registers[x] ^ registers[y];
          break;

        case 0x4:
          if (registers[x] + registers[y] > 255)
            registers[0xF] = 1;
          else
            registers[0xF] = 0;
          registers[x] = registers[x] + registers[y];
          break;

        case 0x5:
          if (registers[x] > registers[y])
            registers[0xF] = 1;
          else
            registers[0xF] = 0;
          registers[x] = registers[x] - registers[y];
          break;

        case 0x6:
          registers[0xF] = registers[y] & 0b1;
          registers[x] = registers[y] >>> 1;
          break;

        case 0x7:
          if (registers[y] > registers[x])
            registers[0xF] = 1;
          else
            registers[0xF] = 0;
          registers[x] = registers[y] - registers[x];
          break;

        case 0xE:
          registers[0xF] = (registers[y] & 0b10000000) >>> 7;
          registers[x] = registers[y] << 1;
          break;

        default:
          console.error(`ERROR: opcode ${opcode_str} not implemented`);
          cpu_running = false;
          break;
      }
      break;

    case 0x9:
      if (registers[x] != registers[y])
        pc += 2;
      break;

    case 0xa:
      reg_i = nnn;
      break;

    case 0xb:
      pc = nnn + registers[0];
      break;

    case 0xc:
      registers[x] = Math.floor(Math.random() * 256) & kk;
      break;

    case 0xd:
      drawSprite(registers[x], registers[y], reg_i, n);
      break;

    case 0xe:
      if ((full_opcode & 0x00FF) == 0x9E) {
        if (keyboard_input[registers[x]])
          pc += 2;
      } else {
        if (!keyboard_input[registers[x]])
          pc += 2;
      }
      break;

    case 0xf:
      switch (full_opcode & 0x00FF) {
        case 0x07:
          registers[x] = delay_timer;
          break;

        case 0x0A:
          tmp_reg = x;
          cpu_running = false;
          break;

        case 0x15:
          delay_timer = registers[x];
          break;

        case 0x18:
          sound_timer = registers[x];
          break;

        case 0x1E:
          reg_i = reg_i + registers[x];
          break;

        case 0x29:
          reg_i = 5 * registers[x];
          break;

        case 0x33:
          mem[reg_i] = Math.floor(registers[x] / 100);
          mem[reg_i + 1] = Math.floor((registers[x] % 100) / 10);
          mem[reg_i + 2] = registers[x] % 10;
          break;

        case 0x55:
          for (let i = 0; i <= x; i++)
            mem[reg_i + i] = registers[i];
          reg_i = reg_i + x + 1;
          break;

        case 0x65:
          for (let i = 0; i <= x; i++)
            registers[i] = mem[reg_i + i];
          reg_i = reg_i + x + 1;
          break;

        default:
          console.error(`ERROR: opcode ${opcode_str} not implemented`);
          cpu_running = false;
          break;
      }
      break;

    default:
      console.error(`ERROR: opcode ${opcode_str} not implemented`);
      cpu_running = false;
      break;
  }

  updateDisplay();
  updateStats();
}
setInterval(cycleCPU, 1);
// setInterval(cycleCPU, 1000);

// function waitForInput() {
//   for (let i = 0; i < keyboard_input.length; i++)
//     if (keyboard_input[i]) {
//       registers[tmp_reg] = i;
//       cpu_running = true;
//       clearInterval(waitForInput);
//     }
// }