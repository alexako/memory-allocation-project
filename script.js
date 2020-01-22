let processList = document.getElementById("processes-list");
let currentProcess = document.getElementById("current-process-info");
let activeProcesses = document.getElementById("active-processes");
let activeMemory = document.getElementById("active-memory");
let memoryState = document.getElementById("state");
let cycleCount = document.getElementById("cycle-count");


// Dictionary of all process elements
let processes = {};

// Far left window
let processQueue = [];

// Dictionary of all memory blocks
let memoryBlocks = {};

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

// param: Process element
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

// Load process into memory block
function loadProcess(process) {

    const processEl = document.createElement("div");
    processEl.setAttribute("id", "pid-" + process.pid);
    processEl.className = "memory-block memory-block--process";
    processEl.innerHTML = "<span class=\"label\">" + process.element.innerHTML + "</span>";
    processEl.style.backgroundColor = blockColors[Math.floor(Math.random()*blockColors.length)];

    process.block = processEl;

    // TODO: Get selected algo then imp in switch
    firstFit(process);
    bestFit();
    worstFit();
}

function killProcess(process) {
  
}

function firstFit(process) {
    setTimeout(() => {
        process.element.style = "color: green; font-weight: 700;";
        console.group("Loading:", process.pid);
        setTimeout(() => {
            Object.keys(memoryBlocks).some((memId) => {
                //setTimeout(() => {
                    console.log("checking ", memId);
                    const memoryBlock = memoryBlocks[memId];
                    console.log("pSize:", process.size, "mSize:", memoryBlock.size, process.size <= memoryBlock.size);
                    if (process.size <= memoryBlock.size
                        && memoryBlock.processes.length === 0) {

                        process.block.style.height = (process.size/memoryBlock.size) * 100 + "%";
                        let memBlockElem = document.getElementById(memoryBlock.memId);
                        memBlockElem.innerHTML = "";

                        // FIX: This remove class from all elements
                        //memBlockElem.classList.remove("memory-block--unallocated");

                        memBlockElem.style.justifyContent = "start";
                        memBlockElem.append(process.block);
                        memoryBlock.processes.push(process);

                        process.element.remove();
                        return true;
                    }

                    else {
                        console.log("Can't load ", process.pid);
                        process.element.style = "color: red;";
                        //TODO: Return process to queue 
                    }
                    console.groupEnd("Loading:", process.pid);
                //}, 1000);
            });
        }, 500);
        //delete processes[process.pid];
    }, 5000);
  
  console.log("Loaded process:", process);

}

function bestFit() {

}

function worstFit() {

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

// TODO: Add ability to create different sized blocks
function createMemoryBlocks() {

    activeMemory.innerHTML = "";
    const el = document.getElementById("total-memory-size");
    const e = document.getElementById("num-of-blocks");
    const totalMem = parseInt(el.options[el.selectedIndex].value);
    const numOfBlocks = parseInt(e.options[e.selectedIndex].value);

    for (let i = 0; i < numOfBlocks; i++) {
        const memSoFar = Object.keys(memoryBlocks).map((k) => { return memoryBlocks[k].size; })
        const blockSize = (i === numOfBlocks - 1) // Last block fills remaining memory
            ? totalMem - memSoFar.reduce((t, c) => { return t + c; })
            : Math.round((totalMem/numOfBlocks) + getRandomInRange(-40, 40));
        const memId = "memAddr-" + (i+1);
        const blockEl = document.createElement("div");
        blockEl.setAttribute("id", memId);
        blockEl.className = "memory-block memory-block--unallocated";
        blockEl.innerHTML = "<span class=\"label\">Unallocated - " + blockSize + "kB</span>";
        blockEl.style.height = Math.round((blockSize/totalMem) * 100) - 1 + "%";
        activeMemory.append(blockEl);

        let memoryBlock = {
            "memId": memId,
            "size": blockSize,
            "processes": [],
            "element": blockEl
        }

        memoryBlocks[memId] = memoryBlock;
    }
}

function reset() {
    activeProcesses.innerHTML = "";
    cycleCount.innerHTML = 0;
    processList.innerHTML = "";
    createMemoryBlocks();
}

function incrementCycleCount() {
    let count = parseInt(cycleCount.innerHTML);
    count += 1;
    cycleCount.innerHTML = count;
}

function createRandomProcesses() {
    processList.innerHTML = '';
    const el = document.getElementById("total-memory-size");
    const e = document.getElementById("num-of-blocks");
    const totalMem = parseInt(el.options[el.selectedIndex].value);
    const numOfBlocks = parseInt(e.options[e.selectedIndex].value);
    const processCount = Object.keys(processes).length;
    for (let i = processCount; i < processCount + getRandomInRange(4, 8); i++) {
        const pid = "pid-" + (i+1);
        const procSize = Math.round(getRandomInRange(50, (totalMem/numOfBlocks) - 10));
        const processElem = document.createElement("div");
        processElem.setAttribute("id", pid);
        processElem.innerHTML = "PID: " + (i+1) + " - " + procSize + "kB";
        addProcess(processElem);

        let process = {
            "pid": pid,
            "size": procSize,
            "element": processElem,
            "block": "" // Process block element in active memory
        }
        processes[process.pid] = process;
    }
    
    updateUI();
}

function getRandomInRange(min, max) {
    return Math.random() * (max - min) + min;
}

createMemoryBlocks();

