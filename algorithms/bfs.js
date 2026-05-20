// algorithms/bfs.js

export function bfs(grid, startNode, endNode) {
  const visitedNodesInOrder = [];
  const queue = [];

  startNode.isVisited = true;
  queue.push(startNode);

  let head = 0;

  while (head < queue.length) {
    const currentNode = queue[head];

    head++;

    if (currentNode.isWall) continue;

    visitedNodesInOrder.push(currentNode);

    if (isSameNode(currentNode, endNode)) {
      return {
        visitedNodesInOrder,
        path: getPath(endNode),
        found: true,
      };
    }

    const neighbors = getUnvisitedNeighbors(currentNode, grid);

    for (const neighbor of neighbors) {
      neighbor.isVisited = true;
      neighbor.previousNode = currentNode;
      queue.push(neighbor);
    }
  }

  return {
    visitedNodesInOrder,
    path: [],
    found: false,
  };
}

function getUnvisitedNeighbors(node, grid) {
  const neighbors = [];
  const { row, col } = node;

  if (row > 0) neighbors.push(grid[row - 1][col]);
  if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);
  if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
  if (col > 0) neighbors.push(grid[row][col - 1]);

  return neighbors.filter((neighbor) => {
    return !neighbor.isVisited && !neighbor.isWall;
  });
}

function getPath(endNode) {
  const path = [];
  let currentNode = endNode;

  while (currentNode !== null) {
    path.unshift(currentNode);
    currentNode = currentNode.previousNode;
  }

  return path;
}

function isSameNode(nodeA, nodeB) {
  return nodeA.row === nodeB.row && nodeA.col === nodeB.col;
}
