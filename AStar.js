class AStar {
    constructor(gameState) {
        this.gameState = gameState;
    }

    heuristic(pos1, pos2) {
        return Math.abs(pos1[0] - pos2[0]) + Math.abs(pos1[1] - pos2[1]);
    }

    getNeighbors(pos) {
        const [x, y] = pos;
        const neighbors = [];
        const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
        
        for (const [dx, dy] of directions) {
            const newX = x + dx;
            const newY = y + dy;
            
            if (newX >= 0 && newX < Config.GRID_SIZE && newY >= 0 && newY < Config.GRID_SIZE) {
                const terrain = this.gameState.getTerrainAt([newX, newY]);
                if (terrain !== 'edificio') {
                    neighbors.push([newX, newY]);
                }
            }
        }
        
        return neighbors;
    }

    findPath(start, goal) {
        const openSet = [{ pos: start, g: 0, f: this.heuristic(start, goal), parent: null }];
        const closedSet = new Set();
        
        while (openSet.length > 0) {
            // Encontrar nó com menor f
            openSet.sort((a, b) => a.f - b.f);
            const current = openSet.shift();
            
            const posKey = `${current.pos[0]},${current.pos[1]}`;
            if (closedSet.has(posKey)) continue;
            closedSet.add(posKey);
            
            // Verificar se chegou ao objetivo
            if (current.pos[0] === goal[0] && current.pos[1] === goal[1]) {
                const path = [];
                let node = current;
                while (node) {
                    path.unshift([...node.pos]);
                    node = node.parent;
                }
                return { path, cost: current.g };
            }
            
            // Explorar vizinhos
            for (const neighborPos of this.getNeighbors(current.pos)) {
                const neighborKey = `${neighborPos[0]},${neighborPos[1]}`;
                if (closedSet.has(neighborKey)) continue;
                
                const terrain = this.gameState.getTerrainAt(neighborPos);
                const moveCost = this.gameState.getTerrainCost(terrain);
                const g = current.g + moveCost;
                const h = this.heuristic(neighborPos, goal);
                const f = g + h;
                
                const existing = openSet.find(node => 
                    node.pos[0] === neighborPos[0] && node.pos[1] === neighborPos[1]
                );
                
                if (!existing || g < existing.g) {
                    const newNode = {
                        pos: neighborPos,
                        g: g,
                        f: f,
                        parent: current
                    };
                    
                    if (existing) {
                        const index = openSet.indexOf(existing);
                        openSet[index] = newNode;
                    } else {
                        openSet.push(newNode);
                    }
                }
            }
        }
        
        return null; // Caminho não encontrado
    }

    findClosestFriend(currentPos, availableFriends) {
        let closestFriend = null;
        let shortestPath = null;
        let minCost = Infinity;
        
        for (const friend of availableFriends) {
            const pathResult = this.findPath(currentPos, friend.pos);
            if (pathResult && pathResult.cost < minCost) {
                minCost = pathResult.cost;
                closestFriend = friend;
                shortestPath = pathResult;
            }
        }
        
        return { friend: closestFriend, path: shortestPath };
    }
}