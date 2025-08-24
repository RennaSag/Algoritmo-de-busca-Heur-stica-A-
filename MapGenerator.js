class MapGenerator {
    static generateMap() {
        const map = Array(Config.GRID_SIZE).fill().map(() => Array(Config.GRID_SIZE).fill('grama'));
        
        // Adicionar estradas (asfalto)
        for (let i = 0; i < Config.GRID_SIZE; i++) {
            if (i % 8 === 0) {
                for (let j = 0; j < Config.GRID_SIZE; j++) {
                    map[i][j] = 'asfalto';
                }
            }
            if (i % 8 === 7) {
                for (let j = 0; j < Config.GRID_SIZE; j++) {
                    map[j][i] = 'asfalto';
                }
            }
        }

        // Adicionar paralelepípedo em algumas áreas
        for (let i = 10; i < 20; i++) {
            for (let j = 10; j < 20; j++) {
                if (Math.random() > 0.7) {
                    map[i][j] = 'paralelepipedo';
                }
            }
        }

        // Adicionar terra em algumas áreas
        for (let i = 25; i < 35; i++) {
            for (let j = 25; j < 35; j++) {
                if (Math.random() > 0.6) {
                    map[i][j] = 'terra';
                }
            }
        }

        // Adicionar alguns edifícios
        const buildings = [
            [12, 12], [13, 12], [12, 13], [13, 13],
            [30, 8], [31, 8], [30, 9], [31, 9],
            [6, 25], [7, 25], [6, 26], [7, 26]
        ];

        buildings.forEach(([x, y]) => {
            if (x < Config.GRID_SIZE && y < Config.GRID_SIZE) {
                map[x][y] = 'edificio';
            }
        });

        return map;
    }

    static generateCityMap() {
        const map = Array(Config.GRID_SIZE).fill().map(() => Array(Config.GRID_SIZE).fill('grama'));
        
        // Criar ruas principais (asfalto)
        for (let i = 0; i < Config.GRID_SIZE; i += 6) {
            for (let j = 0; j < Config.GRID_SIZE; j++) {
                map[i][j] = 'asfalto';
                if (i + 1 < Config.GRID_SIZE) map[i + 1][j] = 'asfalto';
            }
        }
        
        for (let j = 0; j < Config.GRID_SIZE; j += 8) {
            for (let i = 0; i < Config.GRID_SIZE; i++) {
                map[i][j] = 'asfalto';
                if (j + 1 < Config.GRID_SIZE) map[i][j + 1] = 'asfalto';
            }
        }
        
        // Adicionar edifícios em blocos
        for (let i = 2; i < Config.GRID_SIZE - 2; i += 6) {
            for (let j = 3; j < Config.GRID_SIZE - 3; j += 8) {
                for (let di = 0; di < 3; di++) {
                    for (let dj = 0; dj < 4; dj++) {
                        if (i + di < Config.GRID_SIZE && j + dj < Config.GRID_SIZE) {
                            map[i + di][j + dj] = 'edificio';
                        }
                    }
                }
            }
        }
        
        // Adicionar paralelepípedo ao redor dos edifícios
        for (let i = 0; i < Config.GRID_SIZE; i++) {
            for (let j = 0; j < Config.GRID_SIZE; j++) {
                if (map[i][j] === 'grama') {
                    let nearBuilding = false;
                    for (let di = -1; di <= 1; di++) {
                        for (let dj = -1; dj <= 1; dj++) {
                            const ni = i + di, nj = j + dj;
                            if (ni >= 0 && ni < Config.GRID_SIZE && nj >= 0 && nj < Config.GRID_SIZE) {
                                if (map[ni][nj] === 'edificio') {
                                    nearBuilding = true;
                                }
                            }
                        }
                    }
                    if (nearBuilding && Math.random() > 0.3) {
                        map[i][j] = 'paralelepipedo';
                    }
                }
            }
        }
        
        return map;
    }

    static validateFriendPositions(map) {
        // Verifica se cada amigo está em uma posição válida
        Config.FRIENDS.forEach(friend => {
            const [x, y] = friend.pos;
            
            // Verifica se está em um edifício
            if (map[x][y] === 'edificio') {
                // Encontra a célula válida mais próxima
                const newPos = this.findNearestValidPosition(map, x, y);
                friend.pos = newPos;
            }
        });
    }

    static findNearestValidPosition(map, x, y) {
        const maxDistance = 5; // Procura em um raio de 5 células
        
        for (let d = 1; d <= maxDistance; d++) {
            for (let i = -d; i <= d; i++) {
                for (let j = -d; j <= d; j++) {
                    const newX = x + i;
                    const newY = y + j;
                    
                    // Verifica se a posição é válida
                    if (newX >= 0 && newX < Config.GRID_SIZE &&
                        newY >= 0 && newY < Config.GRID_SIZE &&
                        map[newX][newY] !== 'edificio') {
                        return [newX, newY];
                    }
                }
            }
        }
        return [x, y]; // Retorna posição original se não encontrar alternativa
    }

    static generateMazeMap() {
        const map = Array(Config.GRID_SIZE).fill().map(() => 
            Array(Config.GRID_SIZE).fill('grama'));
        
        // Criar corredores
        const createPath = (x, y) => {
            map[x][y] = 'asfalto';
            const directions = [[0, 2], [2, 0], [0, -2], [-2, 0]];
            directions.sort(() => Math.random() - 0.5);
            
            for (const [dx, dy] of directions) {
                const nx = x + dx, ny = y + dy;
                const mx = x + dx/2, my = y + dy/2;
                
                if (nx > 0 && nx < Config.GRID_SIZE-1 && ny > 0 && ny < Config.GRID_SIZE-1 && map[nx][ny] === 'grama') {
                    map[mx][my] = 'asfalto';
                    createPath(nx, ny);
                }
            }
        };
        
        createPath(1, 1);
        
        // Adicionar alguns terrenos variados nos corredores
        for (let i = 0; i < Config.GRID_SIZE; i++) {
            for (let j = 0; j < Config.GRID_SIZE; j++) {
                if (map[i][j] === 'asfalto') {
                    const rand = Math.random();
                    if (rand > 0.8) map[i][j] = 'terra';
                    else if (rand > 0.6) map[i][j] = 'grama';
                    else if (rand > 0.4) map[i][j] = 'paralelepipedo';
                }
            }
        }
        
        // Adiciona validação após gerar o mapa
        this.validateFriendPositions(map);
        
        return map;
    }

    static generateFieldMap() {
        const map = Array(Config.GRID_SIZE).fill().map(() => Array(Config.GRID_SIZE).fill('grama'));
        
        // Adicionar algumas estradas
        for (let i = 0; i < Config.GRID_SIZE; i += 10) {
            for (let j = 0; j < Config.GRID_SIZE; j++) {
                map[i][j] = 'asfalto';
            }
        }
        
        for (let j = 0; j < Config.GRID_SIZE; j += 12) {
            for (let i = 0; i < Config.GRID_SIZE; i++) {
                map[i][j] = 'asfalto';
            }
        }
        
        // Adicionar terra em algumas áreas (campos arados)
        for (let i = 5; i < 15; i++) {
            for (let j = 5; j < 25; j++) {
                if (Math.random() > 0.3) map[i][j] = 'terra';
            }
        }
        
        for (let i = 25; i < 35; i++) {
            for (let j = 15; j < 35; j++) {
                if (Math.random() > 0.4) map[i][j] = 'terra';
            }
        }
        
        // Algumas construções rurais
        const buildings = [
            [8, 8], [8, 9], [9, 8], [9, 9],
            [30, 30], [30, 31], [31, 30], [31, 31],
            [15, 35], [15, 36], [16, 35], [16, 36]
        ];
        
        buildings.forEach(([x, y]) => {
            if (x < Config.GRID_SIZE && y < Config.GRID_SIZE) {
                map[x][y] = 'edificio';
            }
        });
        
        return map;
    }
}