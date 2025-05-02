const memoryDisplayElement = document.getElementById('memoryDisplay');
const statElement = document.getElementById("statsDisplay");

document.getElementById('loadRomLink').addEventListener('click', function (event) {
  event.preventDefault();
  document.getElementById('romFile').click();
});

document.getElementById('romFile').addEventListener('change', function (event) {
  const file = event.target.files[0];
  if (!file)
    return;

  const reader = new FileReader();

  reader.onload = function (e) {
    const fileBuffer = e.target.result;
    const romData = new Uint8Array(fileBuffer);

    resetCPU();

    for (let i = 0; i < romData.length; i++) {
      if (0x200 + i < mem.length) {
        mem[0x200 + i] = romData[i];
      } else {
        console.error("ERROR: ROM does not fit into memory");
        break;
      }
    }

    storeSprites();
    console.log(`Loaded ${file.name}, ${romData.length} bytes`);
    cpu_running = true;
    event.target.value = null;
  }

  reader.onerror = function (e) {
    console.error("ERROR: could not read file: ", e);
  };

  reader.readAsArrayBuffer(file);
});

function updateMemoryDisplay() {
  let str = "";
  for (let i = 0; i < mem.length; i++) {
    let hex_str = mem[i].toString(16).padStart(2, '0');
    str += hex_str + " ";
    if ((i + 1) % 64 == 0)
      str += "\n";
  }
  memoryDisplayElement.textContent = str;
}
setInterval(updateMemoryDisplay, 1000);
updateMemoryDisplay();

function updateStats() {
  let str =
    `V0: ${registers[0]}
V1: ${registers[1]}
V2: ${registers[2]}
V3: ${registers[3]}
V4: ${registers[4]}
V5: ${registers[5]}
V6: ${registers[6]}
V7: ${registers[7]}
V8: ${registers[8]}
V9: ${registers[9]}
VA: ${registers[10]}
VB: ${registers[11]}
VC: ${registers[12]}
VD: ${registers[13]}
VE: ${registers[14]}
VF: ${registers[15]}
PC: ${pc.toString(16)}
SP: ${sp.toString(16)}
ST: ${sound_timer}
DT: ${delay_timer}
opcode: ${opcode_str}`;

  statElement.textContent = str;
}
updateStats();