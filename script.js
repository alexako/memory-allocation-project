let processList = document.getElementById("processes-list");
let currentProcess = document.getElementById("current-process-info");
let activeProcesses = document.getElementById("active-processes");
let activeMemory = document.getElementById("active-memory");
let memoryState = document.getElementById("state");
let cycleCount = document.getElementById("cycle-count");

let runSimBtn = document.getElementById("run-sim-btn");
let simRunning = false;

window.simProcess = 0;

let blockColors = [
  "#ffb4ac",
  "#679186",
  "#264e70",
  "#ffebd3",
  "#ebedc8",
  "#9ab5c1",
  "#3c9099"
];


function addProcess(process) {
  processList.append(process);
}

function loadProcess() {
  let processes = processList.getElementsByTagName("li");
  console.log("processes:", processes);
  let process = processes[0];
  let processEL = document.createElement("div");
  processEl.className = "memory-block memory-block--unallocated";
  processEl.innerHTML = "<span class=\"label\">" + process.innerHTML + "</span>";
  processEl.style.height = 20 + "%";
  processEl.style.backgroundColor = blockColors[Math.floor(Math.random()*blockColors.length)];
  
  let memBlock = document.getElementById("pid-1");
  memBlock.innerHTML = "";
  memBlock.append(processEl);
  
  console.log("Loaded process:", process);
}

function removeProcess(pid) {
  
}

function runSim() {
  
  loadProcess();
  
  return;
  
  if (simRunning) {
    clearInterval(window.simProcess);
    simRunning = false;
    reset();
  }
  
  if (processes.length > 0 && !simRunning) {
    window.simProcess = setInterval(frame, 1000);
    simRunning = true;
    loadProcess();
  } 
  
  runSimBtn.innerHTML = simRunning ? "<i class=\"fas fa-pause\"></i> Stop" : "<i class=\"fas fa-play\"></i> Run";
}

function frame() {
  loadProcess();
  incrementCycleCount();
  updateUI();
}

function updateUI() {
  if (processes.length === 0) {
    let placeholder = document.createElement("li");
    placeholder.innerHTML = "No processes...";
    processList.append(placeholder);
    runSimBtn.disabled = true;
  } else {
    runSimBtn.disabled = false;
  }
}

function createBlocks() {
  activeMemory.innerHTML = "";
  let e = document.getElementById("block-size");
  let blockSize = e.options[e.selectedIndex].value;
  let memSize = 500;
  let numOfBlocks = memSize/blockSize;
  numOfBlocks = (memSize % blockSize !== 0) ? numOfBlocks -= 1 : numOfBlocks;
  
  for (let i = 0; i < numOfBlocks; i++) {

    let blockEl = document.createElement("div");
    blockEl.setAttribute("id", "pid-" + (i+1));
    blockEl.className = "memory-block memory-block--unallocated";
    blockEl.innerHTML = "<span class=\"label\">Unallocated</span>";
    blockEl.style.height = ((100/numOfBlocks) - 0.5) + "%";
    activeMemory.append(block);
  }
}

function reset() {
  cycleCount.innerHTML = 0;
  processList.innerHTML = "";
  createBlocks();
}

function incrementCycleCount() {
  let count = parseInt(cycleCount.innerHTML);
  count += 1;
  cycleCount.innerHTML = count;
}

function createRandomProcesses() {
  processList.innerHTML = '';
  for (let i = 0; i < getRandomInRange(3, 7); i++) {
    let process = document.createElement("li");
    let pid = (i+1).toString();
    process.setAttribute("id", pid);
    process.innerHTML = "PID: " + pid + " - " + Math.round(getRandomInRange(50, 300)) + "kB";
    addProcess(process);
  }
  
  updateUI();
}

function getRandomInRange(min, max) {
    return Math.random() * (max - min) + min;
}

createBlocks();

