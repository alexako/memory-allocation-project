let processList = document.getElementById("processes-list");
let currentProcess = document.getElementById("current-process-info");
let activeProcessesElem = document.getElementById("active-processes");
let activeMemory = document.getElementById("active-memory");
let memoryState = document.getElementById("state");
let cycleCount = document.getElementById("cycle-count");


// Dictionary of all process elements
let processes = {};

// List of loaded/active processes
let activeProcesses = [];

// Far left window
let processQueue = [];

// Dictionary of all memory blocks
let memoryBlocks = {};

let runSimBtn = document.getElementById("run-sim-btn");
let simRunning = false;

window.simProcess = 0;

const animationDelay = 1000;

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
    activeProcessesElem.appendChild(process);
}

// Load process into memory block via algorithms (First fit, Best fit, Worst fit)
function loadProcess(process) {

    // TODO: Get selected algo then imp in switch
    firstFit(process);
    bestFit();
    worstFit();

    process.life -= 1;
}

function killProcess(process) {
    process.element.remove();
    process.block.remove();
    activeProcesses = activeProcesses.filter((proc) => { return proc.pid !== process.pid; });
    delete processes[process.pid];
}

// TODO: Add time cycle property to process
function firstFit(process) {
    console.group("Loading:", process.pid);

    memoryState.classList.remove("inactive");

    const processIndex = parseInt(process.pid.slice(-1));
    const numOfBlocks = Object.keys(memoryBlocks).length;
    const processDelay = processIndex * animationDelay;
    setTimeout(() => { // 1 second per process
        process.element.style = "color: green; font-weight: 700";

        // Iterate memory blocks
        Object.keys(memoryBlocks).some((memId, memIndex) => {
            const memoryBlock = memoryBlocks[memId];
            if (process.size <= memoryBlock.size
                && memoryBlock.processes.length === 0) {
                
                memoryBlock.element.style.border = "3px solid green";

                process.block.style.height = (process.size/memoryBlock.size) * 100 + "%";
                let memBlockElem = document.getElementById(memoryBlock.memId);
                memBlockElem.innerHTML = "";

                let procedure = document.createElement("div");
                procedure.innerHTML = "PID: " + process.pid.split("-")[1] + " => Mem Addr: " + memId.split("-")[1];
                currentProcess.append(procedure);

                memBlockElem.style.justifyContent = "start";
                memBlockElem.append(process.block);
                memoryBlock.processes.push(process);
                activeProcesses.push(process);

                process.element.remove();

                return true; // Exit memory block loop; load next process
            }

            else {
                console.log("Can't load ", process.pid);
                process.element.style = "color: red;";
                //TODO: Return process to queue 
            }
            console.groupEnd("Loading:", process.pid);
            memoryBlock.element.style.border = "1px solid black";
        });
    // END iterate memory blocks
    
    }, processDelay);

    console.log("Loaded process:", process);

}

function bestFit() {

}

function worstFit() {

}

function runSim() {
  
    currentProcess.innerHTML = "";
    const numOfProcesses = Object.keys(processes).length;
    const framerate = numOfProcesses * animationDelay;

    for (let pid in processes) {
        queueProcess(processes[pid].element);
    }

    frame();

/*     const interval = setInterval(() => {
        frame();
        if (numOfProcesses <= 0) { clearInterval(interval); }
    }, framerate); */
  
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
    for (let pid in processes) {
        if (!isActive(processes[pid])) { loadProcess(processes[pid]); }
    }

    for (let process in activeProcesses) {
        if (process.life <= 0) { killProcess(process); }
    }

    incrementCycleCount();
    updateUI();
}

function updateUI() {
    if (Object.keys(processes).length === 0) {
        processList.innerHTML = "";
        let placeholder = document.createElement("div");
        placeholder.innerHTML = "No processes...";
        processList.append(placeholder);
        runSimBtn.disabled = true;
    } else {
        runSimBtn.disabled = false;
    }
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

        memoryBlocks[memId] = memoryBlock;
    }
}

function createRandomProcesses() {
    const el = document.getElementById("total-memory-size");
    const e = document.getElementById("num-of-blocks");
    const totalMem = parseInt(el.options[el.selectedIndex].value);
    const numOfBlocks = parseInt(e.options[e.selectedIndex].value);
    const processCount = Object.keys(processes).length;

    // Load existing processes
    for (let pid in processes) {
        addProcess(processes[pid].element);
    }

    for (let i = processCount; i < processCount + getRandomInRange(4, 8); i++) {
        const pid = "pid-" + (i+1);
        const procSize = Math.round(getRandomInRange(50, (totalMem/numOfBlocks) - 10));

        // List element
        const processElem = document.createElement("div");
        processElem.setAttribute("id", pid);
        processElem.innerHTML = "PID: " + (i+1) + " - " + procSize + "kB";

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
            "life": Math.round(getRandomInRange(1, 4)), // Number of cycles needed to complete
            "element": processElem, // Process element in queues
            "block": processEl // Process block element in active memory
        }
        processes[process.pid] = process;
    }
    
    updateUI();
}

function reset() {
    activeProcessesElem.innerHTML = "";
    cycleCount.innerHTML = 0;
    processList.innerHTML = "";
    currentProcess.innerHTML = "Not running...";
    memoryState.innerHTML = "Not running ...";
    memoryBlocks = {};
    processes = {};
    createMemoryBlocks();
}

function incrementCycleCount() {
    let count = parseInt(cycleCount.innerHTML);
    count += 1;
    cycleCount.innerHTML = count;
}

function isActive(process) {
    for (let proc in activeProcesses) {
        if (proc.pid === process.pid) {
            return true;
        }
    }
    return false;
}

function getRandomInRange(min, max) {
    return Math.random() * (max - min) + min;
}

reset();
