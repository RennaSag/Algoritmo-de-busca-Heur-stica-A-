class UIManager {
    constructor(gameState) {
        this.gameState = gameState;
    }

    initializeCoordinates() {
        // Coordenadas superiores (colunas)
        const topCoords = document.getElementById('topCoords');
        let topHTML = '';
        for (let j = 0; j < Config.GRID_SIZE; j++) {
            const showNumber = (j % 5 === 0) || (j === Config.GRID_SIZE - 1);
            topHTML += `<div class="coord-number">${showNumber ? j : ''}</div>`;
        }
        
        // Coordenadas esquerdas (linhas)
        const leftCoords = document.getElementById('leftCoords');
        let leftHTML = '';
        for (let i = 0; i < Config.GRID_SIZE; i++) {
            const showNumber = (i % 5 === 0) || (i === Config.GRID_SIZE - 1);
            leftHTML += `<div class="coord-number-left">${showNumber ? i : ''}</div>`;
        }
    }

    updateDisplay() {
        const mapElement = document.getElementById('map');
        let html = '';
        
        for (let i = 0; i < Config.GRID_SIZE; i++) {
            for (let j = 0; j < Config.GRID_SIZE; j++) {
                let className = this.gameState.map[i][j];
                let cellContent = '';
                let dataAttributes = '';
                let extraStyles = '';
                
                // Verificar se foi visitada (mostrar rastro)
                if (this.gameState.isVisited([i, j])) {
                    className += ' visited';
                }
                
                // Verificar se é posição da Barbie
                if (i === this.gameState.barbiePos[0] && j === this.gameState.barbiePos[1]) {
                    className = 'barbie';
                    cellContent = '👑';
                }
                // Verificar se é posição de um amigo
                else {
                    const friend = this.gameState.getFriendAt([i, j]);
                    if (friend) {
                        className = 'friend';
                        dataAttributes = `data-friend="${friend.name}"`;
                        
                        if (this.gameState.isFriendConvinced(friend.name)) {
                            className += ' convinced-friend';
                            cellContent = '✅';
                        } else if (this.gameState.isFriendVisited(friend.name)) {
                            className += ' rejected-friend';
                            cellContent = '❌';
                        } else {
                            cellContent = friend.name[0]; // Primeira letra do nome
                        }
                    }
                    // Se não há amigo nem Barbie, mostrar ícone do terreno
                    else {
                        cellContent = this.getTerrainIcon(this.gameState.map[i][j]);
                    }
                }
                
                // Posição inicial (casa)
                if (i === Config.START_POS[0] && j === Config.START_POS[1] && 
                    !(i === this.gameState.barbiePos[0] && j === this.gameState.barbiePos[1])) {
                    cellContent = '🏠';
                    extraStyles = 'background-color: #FFB6C1 !important;';
                }
                
                const terrainName = this.gameState.map[i][j];
                const cost = Config.TERRAIN_COSTS[terrainName];
                const costText = cost === Infinity ? '∞' : cost;
                
                html += `<div class="cell ${className}" ${dataAttributes} style="${extraStyles}">
                    ${cellContent}
                    <div class="cell-info">[${i},${j}] - ${terrainName} (${costText}min)</div>
                </div>`;
            }
            html += '<br>';
        }
        
        mapElement.innerHTML = html;
        
        // Atualizar estatísticas
        this.updateStats();
    }

    // Adicionar ícones visuais para cada tipo de terreno
    getTerrainIcon(terrain) {
        const icons = {
            'asfalto': '🛣️',
            'grama': '🌱',
            'terra': '🟤',
            'paralelepipedo': '🧱',
            'edificio': '🏢'
        };
        return icons[terrain] || '';
    }

    updateStats() {
        document.getElementById('currentPosition').textContent = `[${this.gameState.barbiePos[0]}, ${this.gameState.barbiePos[1]}]`;
        document.getElementById('currentCost').textContent = `${this.gameState.currentCost} min`;
        document.getElementById('convincedCount').textContent = `${this.gameState.convincedFriends.length}/3`;
    }

    updateFriendsStatus() {
        const container = document.getElementById('friendsStatus');
        let html = '';
        
        for (const friend of this.gameState.friends) {
            let status = '';
            let className = '';
            let willAccept = this.gameState.willFriendAccept(friend.name) ? '💖' : '💔';
            
            if (this.gameState.isFriendConvinced(friend.name)) {
                status = '✅ Convencido';
                className = 'convinced';
            } else if (this.gameState.isFriendVisited(friend.name)) {
                status = '❌ Recusou';
                className = 'rejected';
            } else {
                status = `⏳ Não visitado ${willAccept}`;
                className = '';
            }
            
            html += `
                <div class="friend-card ${className}">
                    <strong>${friend.name}</strong><br>
                    <small>[${friend.pos[0]}, ${friend.pos[1]}]</small><br>
                    <span>${status}</span>
                </div>
            `;
        }
        
        container.innerHTML = html;
    }

    setGameStatus(status) {
        document.getElementById('gameStatus').textContent = status;
    }

    enableStartButton() {
        document.getElementById('startBtn').disabled = false;
    }

    disableStartButton() {
        document.getElementById('startBtn').disabled = true;
    }

    updateSpeedText(speedName) {
        document.getElementById('speedText').textContent = speedName;
    }

    log(message) {
        const logElement = document.getElementById('log');
        const timestamp = new Date().toLocaleTimeString();
        logElement.innerHTML += `[${timestamp}] ${message}\n`;
        logElement.scrollTop = logElement.scrollHeight;
    }

    clearLog() {
        document.getElementById('log').innerHTML = '';
    }

    animateFriendResponse(friendName, accepted) {
        const friendElement = document.querySelector(`[data-friend="${friendName}"]`);
        if (friendElement) {
            if (accepted) {
                friendElement.classList.add('convinced-friend');
            } else {
                friendElement.classList.add('rejected-friend');
            }
        }
    }

    showAlert(message) {
        alert(message);
    }

    showPrompt(message) {
        return prompt(message);
    }
}