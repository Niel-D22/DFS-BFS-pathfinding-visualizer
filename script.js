// script.js

import { bfs } from "./algorithms/bfs.js";
import { dfs } from "./algorithms/dfs.js";

// ===============================
// KONFIGURASI GRID
// ===============================
const ROWS = 24;
const COLS = 48;

const DEFAULT_START_POSITION = {
  row: 10,
  col: 8,
};

const DEFAULT_END_POSITION = {
  row: 17,
  col: 39,
};

let startPosition = { ...DEFAULT_START_POSITION };
let endPosition = { ...DEFAULT_END_POSITION };

// ===============================
// ELEMENT HTML
// ===============================
const gridElement = document.getElementById("grid");

const startBtn = document.getElementById("startBtn");
const mazeBtn = document.getElementById("mazeBtn");
const clearPathBtn = document.getElementById("clearPathBtn");
const clearBoardBtn = document.getElementById("clearBoardBtn");

const algorithmSelect = document.getElementById("algorithmSelect");
const speedSelect = document.getElementById("speedSelect");

const wallModeBtn = document.getElementById("wallModeBtn");
const startModeBtn = document.getElementById("startModeBtn");
const endModeBtn = document.getElementById("endModeBtn");

const algorithmLabel = document.getElementById("algorithmLabel");
const modeLabel = document.getElementById("modeLabel");
const visitedCount = document.getElementById("visitedCount");
const pathLength = document.getElementById("pathLength");
const statusLabel = document.getElementById("statusLabel");
const timeCount = document.getElementById("timeCount");
const boardHint = document.getElementById("boardHint");
const toast = document.getElementById("toast");

// ===============================
// STATE APLIKASI
// ===============================
let grid = [];
let isPointerPressed = false;
let isRunning = false;
let wallPaintMode = true;
let activeTool = "wall";

// ===============================
// INIT
// ===============================
init();

function init() {
  grid = createGrid();

  gridElement.style.gridTemplateColumns = `repeat(${COLS}, 24px)`;
  gridElement.style.gridTemplateRows = `repeat(${ROWS}, 24px)`;

  renderGrid();
  updateAlgorithmLabel();
  updateModeButtons();
  updateStats(0, 0, "Ready", 0);
}

// ===============================
// MEMBUAT DATA GRID
// ===============================
function createGrid() {
  const newGrid = [];

  for (let row = 0; row < ROWS; row++) {
    const currentRow = [];

    for (let col = 0; col < COLS; col++) {
      currentRow.push(createNode(row, col));
    }

    newGrid.push(currentRow);
  }

  return newGrid;
}

function createNode(row, col) {
  const isStart = row === startPosition.row && col === startPosition.col;
  const isEnd = row === endPosition.row && col === endPosition.col;

  return {
    row,
    col,
    isStart,
    isEnd,
    isWall: false,
    isVisited: false,
    previousNode: null,
  };
}

// ===============================
// RENDER GRID
// ===============================
function renderGrid() {
  gridElement.innerHTML = "";

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const node = grid[row][col];
      const nodeElement = document.createElement("div");

      nodeElement.id = getNodeId(row, col);
      nodeElement.className = getNodeClass(node);
      nodeElement.innerHTML = getNodeIcon(node);

      nodeElement.addEventListener("pointerdown", (event) => {
        handlePointerDown(event, node);
      });

      nodeElement.addEventListener("pointerenter", (event) => {
        handlePointerEnter(event, node);
      });

      nodeElement.addEventListener("dragstart", (event) => {
        event.preventDefault();
      });

      gridElement.appendChild(nodeElement);
    }
  }
}

function getNodeId(row, col) {
  return `node-${row}-${col}`;
}

function getNodeElement(node) {
  return document.getElementById(getNodeId(node.row, node.col));
}

function getNodeClass(node) {
  let className =
    "node flex items-center justify-center select-none text-[11px] font-bold cursor-pointer";

  if (node.isStart) {
    className += " node-start";
  } else if (node.isEnd) {
    className += " node-end";
  } else if (node.isWall) {
    className += " node-wall";
  } else {
    className += " node-unvisited";
  }

  return className;
}

function getNodeIcon(node) {
  if (node.isStart) {
    return `<i class="fa-solid fa-play text-[11px]"></i>`;
  }

  if (node.isEnd) {
    return `<i class="fa-solid fa-flag-checkered text-[11px]"></i>`;
  }

  return "";
}

function refreshNode(node) {
  const nodeElement = getNodeElement(node);

  if (!nodeElement) return;

  nodeElement.className = getNodeClass(node);
  nodeElement.innerHTML = getNodeIcon(node);
}

// ===============================
// INTERAKSI GRID
// ===============================
function handlePointerDown(event, node) {
  event.preventDefault();

  if (isRunning) {
    showToast("Tunggu sampai visualisasi selesai.");
    return;
  }

  clearPathOnly(false);

  if (activeTool === "start") {
    moveStartNode(node);
    return;
  }

  if (activeTool === "end") {
    moveEndNode(node);
    return;
  }

  if (activeTool === "wall") {
    if (node.isStart || node.isEnd) return;

    isPointerPressed = true;
    wallPaintMode = !node.isWall;

    setWall(node, wallPaintMode);
  }
}

function handlePointerEnter(event, node) {
  event.preventDefault();

  if (!isPointerPressed || isRunning) return;
  if (activeTool !== "wall") return;
  if (node.isStart || node.isEnd) return;

  setWall(node, wallPaintMode);
}

document.addEventListener("pointerup", () => {
  isPointerPressed = false;
});

function setWall(node, value) {
  node.isWall = value;
  node.isVisited = false;
  node.previousNode = null;

  refreshNode(node);
}

// ===============================
// PINDAH START DAN END
// ===============================
function moveStartNode(newNode) {
  if (newNode.isEnd) {
    showToast("Start tidak boleh sama dengan End.");
    return;
  }

  const oldStartNode = grid[startPosition.row][startPosition.col];

  oldStartNode.isStart = false;

  newNode.isWall = false;
  newNode.isStart = true;
  newNode.isVisited = false;
  newNode.previousNode = null;

  startPosition = {
    row: newNode.row,
    col: newNode.col,
  };

  refreshNode(oldStartNode);
  refreshNode(newNode);

  showToast("Start node berhasil dipindahkan.");
}

function moveEndNode(newNode) {
  if (newNode.isStart) {
    showToast("End tidak boleh sama dengan Start.");
    return;
  }

  const oldEndNode = grid[endPosition.row][endPosition.col];

  oldEndNode.isEnd = false;

  newNode.isWall = false;
  newNode.isEnd = true;
  newNode.isVisited = false;
  newNode.previousNode = null;

  endPosition = {
    row: newNode.row,
    col: newNode.col,
  };

  refreshNode(oldEndNode);
  refreshNode(newNode);

  showToast("End node berhasil dipindahkan.");
}

// ===============================
// MODE BUTTON
// ===============================
wallModeBtn.addEventListener("click", () => {
  activeTool = "wall";
  updateModeButtons();
});

startModeBtn.addEventListener("click", () => {
  activeTool = "start";
  updateModeButtons();
});

endModeBtn.addEventListener("click", () => {
  activeTool = "end";
  updateModeButtons();
});

function updateModeButtons() {
  resetModeButton(wallModeBtn);
  resetModeButton(startModeBtn);
  resetModeButton(endModeBtn);

  if (activeTool === "wall") {
    setActiveModeButton(wallModeBtn, "bg-slate-900", "text-white");
    modeLabel.textContent = "Wall";
    boardHint.textContent =
      "Mode Wall aktif. Klik atau drag kotak untuk membuat tembok.";
  }

  if (activeTool === "start") {
    setActiveModeButton(startModeBtn, "bg-green-600", "text-white");
    modeLabel.textContent = "Set Start";
    boardHint.textContent =
      "Mode Set Start aktif. Klik satu kotak untuk memindahkan titik awal.";
  }

  if (activeTool === "end") {
    setActiveModeButton(endModeBtn, "bg-red-600", "text-white");
    modeLabel.textContent = "Set End";
    boardHint.textContent =
      "Mode Set End aktif. Klik satu kotak untuk memindahkan titik tujuan.";
  }
}

function resetModeButton(button) {
  button.className =
    "rounded-lg px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-100";
}

function setActiveModeButton(button, bgClass, textClass) {
  button.className = `rounded-lg px-3 py-2 text-xs font-bold transition ${bgClass} ${textClass}`;
}

// ===============================
// START VISUALISASI
// ===============================
startBtn.addEventListener("click", () => {
  if (isRunning) {
    showToast("Visualisasi sedang berjalan.");
    return;
  }

  runVisualization();
});

function runVisualization() {
  clearPathOnly(false);

  const algorithm = algorithmSelect.value;
  const startNode = grid[startPosition.row][startPosition.col];
  const endNode = grid[endPosition.row][endPosition.col];

  const startTime = performance.now();

  let result;

  if (algorithm === "bfs") {
    result = bfs(grid, startNode, endNode);
  } else {
    result = dfs(grid, startNode, endNode);
  }

  const endTime = performance.now();
  const duration = endTime - startTime;

  isRunning = true;
  setButtonsDisabled(true);

  updateStats(result.visitedNodesInOrder.length, 0, "Searching...", duration);

  animateVisitedNodes(
    result.visitedNodesInOrder,
    result.path,
    result.found,
    duration,
  );
}

function animateVisitedNodes(visitedNodesInOrder, path, found, duration) {
  const delay = getAnimationDelay();

  for (let i = 0; i <= visitedNodesInOrder.length; i++) {
    if (i === visitedNodesInOrder.length) {
      setTimeout(() => {
        if (found) {
          updateStats(
            visitedNodesInOrder.length,
            Math.max(path.length - 1, 0),
            "Path Found",
            duration,
          );

          animatePath(path);
        } else {
          updateStats(
            visitedNodesInOrder.length,
            0,
            "Path Not Found",
            duration,
          );
          finishVisualization();
          showToast("Jalur tidak ditemukan.");
        }
      }, delay * i);

      return;
    }

    setTimeout(() => {
      const node = visitedNodesInOrder[i];

      if (node.isStart || node.isEnd) return;

      const nodeElement = getNodeElement(node);

      if (!nodeElement) return;

      nodeElement.classList.add("node-visited");
    }, delay * i);
  }
}

function animatePath(path) {
  const delay = getAnimationDelay() * 2.5;

  if (path.length === 0) {
    finishVisualization();
    return;
  }

  for (let i = 0; i < path.length; i++) {
    setTimeout(() => {
      const node = path[i];

      if (!node.isStart && !node.isEnd) {
        const nodeElement = getNodeElement(node);

        if (nodeElement) {
          nodeElement.classList.remove("node-visited");
          nodeElement.classList.add("node-path");
        }
      }

      if (i === path.length - 1) {
        finishVisualization();
        showToast("Visualisasi selesai.");
      }
    }, delay * i);
  }
}

function finishVisualization() {
  isRunning = false;
  setButtonsDisabled(false);
}

// ===============================
// GENERATE MAZE
// ===============================
mazeBtn.addEventListener("click", () => {
  if (isRunning) {
    showToast("Tunggu sampai visualisasi selesai.");
    return;
  }

  generateRandomMaze();
});

function generateRandomMaze() {
  clearBoard(false);

  updateStats(0, 0, "Generating Maze...", 0);

  isRunning = true;
  setButtonsDisabled(true);

  const wallNodes = [];
  const safeCorridor = createSafeCorridorKeys();

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const node = grid[row][col];
      const key = getPositionKey(row, col);

      if (node.isStart || node.isEnd) continue;
      if (safeCorridor.has(key)) continue;
      if (isNearStartOrEnd(node)) continue;

      const isBorder =
        row === 0 || col === 0 || row === ROWS - 1 || col === COLS - 1;

      const randomWall = Math.random() < 0.23;
      const patternWall =
        row % 4 === 0 && col % 6 !== 0 && Math.random() < 0.42;

      if (isBorder || randomWall || patternWall) {
        wallNodes.push(node);
      }
    }
  }

  if (wallNodes.length === 0) {
    isRunning = false;
    setButtonsDisabled(false);
    updateStats(0, 0, "Ready", 0);
    return;
  }

  for (let i = 0; i < wallNodes.length; i++) {
    setTimeout(() => {
      const node = wallNodes[i];

      node.isWall = true;
      refreshNode(node);

      if (i === wallNodes.length - 1) {
        isRunning = false;
        setButtonsDisabled(false);
        updateStats(0, 0, "Ready", 0);
        showToast("Maze berhasil dibuat.");
      }
    }, 4 * i);
  }
}

function createSafeCorridorKeys() {
  const keys = new Set();

  let row = startPosition.row;
  let col = startPosition.col;

  keys.add(getPositionKey(row, col));

  while (col !== endPosition.col) {
    col += col < endPosition.col ? 1 : -1;
    addSafeArea(keys, row, col);
  }

  while (row !== endPosition.row) {
    row += row < endPosition.row ? 1 : -1;
    addSafeArea(keys, row, col);
  }

  return keys;
}

function addSafeArea(keys, row, col) {
  for (let r = row - 1; r <= row + 1; r++) {
    for (let c = col - 1; c <= col + 1; c++) {
      if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
        keys.add(getPositionKey(r, c));
      }
    }
  }
}

function getPositionKey(row, col) {
  return `${row}-${col}`;
}

function isNearStartOrEnd(node) {
  const distanceFromStart =
    Math.abs(node.row - startPosition.row) +
    Math.abs(node.col - startPosition.col);

  const distanceFromEnd =
    Math.abs(node.row - endPosition.row) + Math.abs(node.col - endPosition.col);

  return distanceFromStart <= 2 || distanceFromEnd <= 2;
}

// ===============================
// CLEAR PATH
// ===============================
clearPathBtn.addEventListener("click", () => {
  if (isRunning) {
    showToast("Tunggu sampai visualisasi selesai.");
    return;
  }

  clearPathOnly(true);
});

function clearPathOnly(showMessage = true) {
  for (const row of grid) {
    for (const node of row) {
      node.isVisited = false;
      node.previousNode = null;

      const nodeElement = getNodeElement(node);

      if (!nodeElement) continue;

      nodeElement.classList.remove("node-visited");
      nodeElement.classList.remove("node-path");

      refreshNode(node);
    }
  }

  updateStats(0, 0, "Ready", 0);

  if (showMessage) {
    showToast("Path berhasil dibersihkan.");
  }
}

// ===============================
// CLEAR BOARD
// ===============================
clearBoardBtn.addEventListener("click", () => {
  if (isRunning) {
    showToast("Tunggu sampai visualisasi selesai.");
    return;
  }

  clearBoard(true);
});

function clearBoard(showMessage = true) {
  grid = createGrid();
  renderGrid();
  updateStats(0, 0, "Ready", 0);

  if (showMessage) {
    showToast("Board berhasil dibersihkan.");
  }
}

// ===============================
// DROPDOWN
// ===============================
algorithmSelect.addEventListener("change", () => {
  updateAlgorithmLabel();
  clearPathOnly(false);
});

function updateAlgorithmLabel() {
  if (algorithmSelect.value === "bfs") {
    algorithmLabel.textContent = "BFS";
  } else {
    algorithmLabel.textContent = "DFS";
  }
}

// ===============================
// HELPER UI
// ===============================
function updateStats(visited, path, status, time) {
  visitedCount.textContent = visited;
  pathLength.textContent = path;
  statusLabel.textContent = status;
  timeCount.textContent = `${time.toFixed(2)} ms`;
}

function getAnimationDelay() {
  const speed = speedSelect.value;

  if (speed === "fast") return 5;
  if (speed === "slow") return 35;

  return 15;
}

function setButtonsDisabled(value) {
  const controls = [
    startBtn,
    mazeBtn,
    clearPathBtn,
    clearBoardBtn,
    algorithmSelect,
    speedSelect,
    wallModeBtn,
    startModeBtn,
    endModeBtn,
  ];

  controls.forEach((control) => {
    control.disabled = value;

    if (value) {
      control.classList.add("opacity-60", "cursor-not-allowed");
    } else {
      control.classList.remove("opacity-60", "cursor-not-allowed");
    }
  });
}

let toastTimeout = null;

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove("hidden");

  clearTimeout(toastTimeout);

  toastTimeout = setTimeout(() => {
    toast.classList.add("hidden");
  }, 2200);
}
