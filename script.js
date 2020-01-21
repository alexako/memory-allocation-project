let processList = document.getElementById("processes-list");
let currentProcess = document.getElementById("current-process-info");
let activeProcesses = document.getElementById("active-processes");
let activeMemory = document.getElementById("active-memory");
let memoryState = document.getElementById("state");
let cycleCount = document.getElementById("cycle-count");

// Dictionary of all process elements
let processes = {};

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
    processList.appendChild(process);
}

function queueProcess(process) {
    activeProcesses.appendChild(process);
}

function runQueue() {
    let processCount = Object.keys(processes).length;
    let count = 0;
    let interval = setInterval(() => {
        count += 1;
        queueProcess(processes["pid-" + count].element);
        loadProcess(processes["pid-" + count]);
        if (count >= processCount) { clearInterval(interval); }
    }, 500);
}

function loadProcess(process) {
    //let processes = processList.getElementsByTagName("li");
    //let process = processes[0];

    // Load process into memory block
    let processEl = document.createElement("div");
    processEl.setAttribute("id", "pid-" + process.pid);
    processEl.className = "memory-block memory-block--process";
    processEl.innerHTML = "<span class=\"label\">" + process.element.innerHTML + "</span>";
    processEl.style.height = Math.round((process.size/500)*100) + "%";
    processEl.style.backgroundColor = blockColors[Math.floor(Math.random()*blockColors.length)];
    
    setTimeout(() => {
        let memBlock = document.getElementById("memAddr-1");
        memBlock.innerHTML = "";
        memBlock.classList.remove("memory-block--unallocated");
        memBlock.append(processEl);

        process.element.remove();
        delete processes[process.pid];
    }, 5000);
  
  console.log("Loaded process:", process);
}

function killProcess(process) {
  
}

function runSim() {
  
    runQueue();
  
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
    blockEl.setAttribute("id", "memAddr-" + (i+1));
    blockEl.className = "memory-block memory-block--unallocated";
    blockEl.innerHTML = "<span class=\"label\">Unallocated</span>";
    blockEl.style.height = ((100/numOfBlocks) - 0.5) + "%";
    activeMemory.append(blockEl);
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
    let processCount = Object.keys(processes).length;
    for (let i = processCount; i < processCount + getRandomInRange(4, 8); i++) {
        let pid = "pid-" + (i+1);
        let procSize = Math.round(getRandomInRange(50, 300))
        let processElem = document.createElement("div");
        processElem.setAttribute("id", pid);
        processElem.innerHTML = "PID: " + (i+1) + " - " + procSize + "kB";
        addProcess(processElem);

        let process = {
            "pid": pid,
            "size": procSize,
            "element": processElem
        }
        processes[process.pid] = process;
    }
    
    updateUI();
}

function getRandomInRange(min, max) {
    return Math.random() * (max - min) + min;
}

createBlocks();

