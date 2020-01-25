let processList = document.getElementById("processes-list");
let currentProcess = document.getElementById("current-process-info");
let activeProcessesElem = document.getElementById("active-processes");
let activeMemory = document.getElementById("active-memory");
let memoryState = document.getElementById("state");
let cycleCountElem = document.getElementById("cycle-count");
let cycleCount = parseInt(cycleCountElem.innerHTML);

// Dictionary of all process elements
let processes = [];

// List of active processes (loaded into memory)
let activeProcesses = [];

// List of current Processes
let currentProcessWindow = [];

// Far left window
let processQueue = [];

// List of all memory blocks
let memoryBlocks = [];

let runSimBtn = document.getElementById("run-sim-btn");
let simRunning = false;

window.simProcess = 0;

const animationDelay = 1000;

let blockColors = [
    "#A0332F",
    "#CB7B42",
    "#DCBF53",
    "#93A864",
    "#5E89A8",
    "#524A66",
    "#679186",
    "#264e70",
    "#9ab5c1",
    "#3c9099"
];

function addProcess(process) {
    processList.appendChild(process);
}

// param: Process element
function queueProcess(process) {
    activeProcessesElem.appendChild(process);
}

// Load process into memory block via algorithms (First fit, Best fit, Worst fit)
function loadProcess(process) {

    if (isActive(process)) { return; }

    const algorithms = document.getElementById("algorithms");
    const selectedAlgo = algorithms.options[algorithms.selectedIndex].value;

    const algos = {
        "first-fit": firstFit,
        "best-fit": bestFit,
        "worst-fit": worstFit
    };

    algos[selectedAlgo](process);
}

// Place process into memory block
function allocate(process, memoryBlock) {
    console.log("Loading", process.pid, "into",  memoryBlock.memId);

    memoryBlock.element.style.border = "3px solid green";

    // Create process block element to be loaded into this memory block
    process.block.style.height = (process.size/memoryBlock.size) * 100 + "%";
    let memBlockElem = document.getElementById(memoryBlock.memId);
    memBlockElem.innerHTML = "";

    memBlockElem.style.justifyContent = "start";
    memBlockElem.append(process.block);

    // Display remaining memory after allocation
    let remaining = document.createElement("span");
    remaining.classList.add("label");
    remaining.innerHTML = memoryBlock.memId + ": "
        + (memoryBlock.size - process.size) + "kB remaining";

    memBlockElem.append(remaining);
    memoryBlock.processes.push(process);
    activeProcesses.push(process);
    currentProcessWindow.push([process, memoryBlock]);

    // Remove from active processes window
    process.element.remove();
}

function killProcess(process) {
    process.element.remove();
    process.block.remove();
    activeProcesses = activeProcesses.filter((proc) => proc.pid !== process.pid);
    currentProcessWindow = currentProcessWindow.filter((proc) => proc[0].pid !== process.pid);
    processes = processes.filter((proc) => proc.pid !== process.pid);
}

function firstFit(process) {
    memoryState.classList.remove("inactive");

    const processIndex = parseInt(process.pid.slice(-1));
    const processDelay = processIndex * animationDelay;
    setTimeout(() => { // 1 second per process
        process.element.style = "color: green; font-weight: 700";

        // Iterate memory blocks
        memoryBlocks.some((memoryBlock) => {
            if (memoryBlock.processes.length > 0) {
                process.element.style = "color: red;";
                if (memoryBlock.processes[0].life <= 0) {
                    memoryBlock.processes = [];
                    cleanupMemory(memoryBlock);
                }
            } else {

                if (process.size <= memoryBlock.size // process fits into memory block
                    && memoryBlock.processes.length === 0) { // and no other processes are in memory block
                    
                    allocate(process, memoryBlock);

                    return true; // Exit memory block loop; load next process
                }
            } 

            memoryBlock.element.style.border = "1px solid black";
            loadCurrentProcessState();
        });
    // END iterate memory blocks
    
    // }, processDelay);
    }, 0);

}

function bestFit(process) {
    const processIndex = parseInt(process.pid.slice(-1));
    const processDelay = processIndex * animationDelay;
    setTimeout(() => { // 1 second per process
        process.element.style = "color: green; font-weight: 700";

        let leastRemaining = 99999;
        let bestFitBlock = memoryBlocks[0];

        // Iterate memory blocks
        memoryBlocks.forEach((memoryBlock) => {

            if (memoryBlock.processes.length > 0) {
                process.element.style = "color: red;";
                if (memoryBlock.processes[0].life <= 0) {
                    memoryBlock.processes = [];
                    cleanupMemory(memoryBlock);
                }
            } else {
                let remaining = memoryBlock.size - process.size;
                if (remaining >= 0
                    && remaining < leastRemaining) {
                    leastRemaining = remaining;
                    bestFitBlock = memoryBlock;
                }
                memoryBlock.element.style.border = "1px solid black";
                loadCurrentProcessState();
            }
        });
        if (leastRemaining < 99999) { allocate(process, bestFitBlock); }

    // }, processDelay);
    }, 0);
}

function worstFit(process) {
    console.log("worst-fit");
}

function loadCurrentProcessState() {
    currentProcess.innerHTML = Object.keys(activeProcesses).length === 0 && cycleCount === 0
        ? "<div>Click run to start</div>"
        : "";
    for (let entry in currentProcessWindow) {
        let process = currentProcessWindow[entry][0];
        let memoryBlock = currentProcessWindow[entry][1];
        let procedure = document.createElement("div");
        procedure.setAttribute("id", "c" + process.pid);
        procedure.innerHTML = "PID: " + process.pid.split("-")[1]
            + " => Mem Addr: " + memoryBlock.memId.split("-")[1]
            + " Cycles: " + process.life;
        currentProcess.append(procedure);
    }

    if (processes.length === 0 && cycleCount > 0) { 
        currentProcess.innerHTML = "";
        let state = document.createElement("div");
        state.innerHTML = "<div>All processes completed!</div>";
        currentProcess.append(state);
    }
}

function runSim() {
  
    currentProcess.innerHTML = "";
    const numOfProcesses = processes.length;
    const framerate = animationDelay;

    // Queue processes
    processes.forEach((process) => {
        queueProcess(process.element);
    })

    frame();

/*     const interval = setInterval(() => {
        frame();
        if (Object.entries(processes).length <= 0) { clearInterval(interval); }
    }, framerate); */
  
    runSimBtn.innerHTML = simRunning ? "<i class=\"fas fa-pause\"></i> Stop" : "<i class=\"fas fa-play\"></i> Run";
}

function frame() {
    // Load each process unless already active
    processes.forEach((process) => {
        if (isActive(process)) { process.life -= 1; }
        loadProcess(process);
    });

    // Clean up finished processes
    processes.forEach((process) => {
        if (typeof(process) !== 'undefined' && process.life <= 0) { killProcess(process); }
    });

    // Clean up processes in memory
    memoryBlocks.forEach((memoryBlock) => {
        if (memoryBlock.processes.length <= 0 || processes.length === 0) {
            cleanupMemory(memoryBlock);
        }
    })

    incrementCycleCount();
    updateUI();
}

function updateUI() {
    if (processes.length === 0) {
        processList.innerHTML = "";
        let placeholder = document.createElement("div");
        placeholder.innerHTML = "<div>No processes...</div>";
        processList.append(placeholder);
        runSimBtn.disabled = true;
    } else {
        runSimBtn.disabled = false;
    }
    loadCurrentProcessState();
}

function createMemoryBlocks() {

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

        memoryBlocks.push(memoryBlock);
    }
}

function createRandomProcesses() {
    const el = document.getElementById("total-memory-size");
    const e = document.getElementById("num-of-blocks");
    const totalMem = parseInt(el.options[el.selectedIndex].value);
    const numOfBlocks = parseInt(e.options[e.selectedIndex].value);
    const processCount = processes.length;

    // Load existing processes
    processes.forEach((process) => {
        addProcess(process.element);
    });

    for (let i = processCount; i < processCount + getRandomInRange(4, 8); i++) {
        const pid = "pid-" + (i+1);
        const procSize = Math.round(getRandomInRange(50, (totalMem/numOfBlocks) - 10));
        const life = Math.round(getRandomInRange(2, 5)); // Number of cycles needed to complete

        // List element
        const processElem = document.createElement("div");
        processElem.setAttribute("id", pid);
        processElem.innerHTML = "PID: " + (i+1) + " - " + procSize + "kB <br/>" + life + " cycles";

        // Memory Element
        const processEl = document.createElement("div");
        processEl.setAttribute("id", "mem-" + pid);
        processEl.className = "memory-block memory-block--process";
        processEl.innerHTML = "<span class=\"label\">" + processElem.innerHTML + "</span>";
        processEl.style.backgroundColor = blockColors[Math.floor(Math.random()*blockColors.length)];
        
        // Add process to queue
        addProcess(processElem);

        let process = {
            "pid": pid,
            "size": procSize,
            "life": life, // Number of cycles needed to complete
            "element": processElem, // Process list element in queues
            "block": processEl // Process block element in active memory
        }
        processes.push(process);
    }
    
    updateUI();
}

function cleanupMemory(memoryBlock) {
    memoryBlock.processes = [];
    memoryBlock.element.innerHTML = "";
    memoryBlock.element.style.justifyContent = "center";
    memoryBlock.element.style.border = "none";
    let unallocated = document.createElement("span");
    unallocated.innerHTML = "<span class=\"label\">Unallocated - " + memoryBlock.size + "kB</span>";
    memoryBlock.element.append(unallocated);
}

function reset() {
    activeMemory.innerHTML = "";
    activeProcessesElem.innerHTML = "";
    cycleCountElem.innerHTML = 0;
    processList.innerHTML = "";
    currentProcess.innerHTML = "<div>Not running...</div>";
    memoryState.innerHTML = "<div>Not running...</div>";
    memoryBlocks = [];
    processes = [];
    createMemoryBlocks();
}

function incrementCycleCount() {
    cycleCount += 1;
    cycleCountElem.innerHTML = cycleCount;
}

function isActive(process) {
    for (let proc in activeProcesses) {
        if (activeProcesses[proc].pid === process.pid) {
            return true;
        }
    }
    return false;
}

function getRandomInRange(min, max) {
    return Math.random() * (max - min) + min;
}

reset();
