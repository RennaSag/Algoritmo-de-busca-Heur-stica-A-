class MapEditor {
    constructor() {
        this.isEditingMap = false;
        this.customMap = null;
        this.isMouseDown = false;  // Novo: controle do mouse
        this.selectedFriend = null;
    }

    openMapEditor() {
        this.isEditingMap = true;
        document.getElementById('mapEditorModal').style.display = 'block';
        this.renderEditorMap();
    }

    closeMapEditor() {
        this.isEditingMap = false;
        document.getElementById('mapEditorModal').style.display = 'none';
    }

    renderEditorMap() {
        const editorMapElement = document.getElementById('editorMap');
        const currentMap = this.customMap || MapGenerator.generateMap();
        let html = '';
        
        // Adicionar eventos de mouse no container
        html = '<div onmousedown="mapEditor.startPainting(event)" onmouseup="mapEditor.stopPainting()" onmouseleave="mapEditor.stopPainting()">';
        
        for (let i = 0; i < Config.GRID_SIZE; i++) {
            for (let j = 0; j < Config.GRID_SIZE; j++) {
                const terrain = currentMap[i][j];
                let cellContent = '';
                
                // Mostrar posições especiais com ícones corretos
                if (i === Config.START_POS[0] && j === Config.START_POS[1]) {
                    cellContent = '🏰'; // Castelo para casa da Barbie
                } else {
                    const friend = Config.FRIENDS.find(f => f.pos[0] === i && f.pos[1] === j);
                    if (friend) {
                        html += `<div class="cell friend" 
                                     draggable="true"
                                     onmousedown="mapEditor.startDragFriend('${friend.name}')"
                                     ondragend="mapEditor.dropFriend(event, ${i}, ${j})"
                                     title="${friend.name} [${i},${j}]">👤</div>`;
                        continue; // Pular o restante do loop para não adicionar outra célula
                    } else {
                        // Adicionar ícones para cada tipo de terreno
                        switch(terrain) {
                            case 'asfalto': cellContent = '🛣️'; break;
                            case 'terra': cellContent = '🟫'; break;
                            case 'grama': cellContent = '🌱'; break;
                            case 'paralelepipedo': cellContent = '🟨'; break;
                            case 'edificio': cellContent = '🏢'; break;
                        }
                    }
                }
                
                html += `<div class="cell ${terrain}" 
                             onmouseover="mapEditor.paintCellIfDragging(${i}, ${j})"
                             onmousedown="mapEditor.paintCell(${i}, ${j})"
                             style="cursor: pointer; font-size: 14px; display: inline-flex; 
                                    align-items: center; justify-content: center;"
                             title="[${i},${j}] - ${terrain}">${cellContent}</div>`;
            }
            html += '<br>';
        }
        
        html += '</div>';
        editorMapElement.innerHTML = html;

        // Prevenir arrasto de texto/imagens
        editorMapElement.addEventListener('dragstart', (e) => e.preventDefault());
    }

    startPainting(event) {
        this.isMouseDown = true;
        // Prevenir seleção de texto
        event.preventDefault();
    }

    stopPainting() {
        this.isMouseDown = false;
    }

    paintCellIfDragging(i, j) {
        if (this.isMouseDown) {
            this.paintCell(i, j);
        }
    }

    paintCell(i, j) {
        if (!this.isEditingMap) return;
        
        const selectedTerrain = document.getElementById('terrainSelector').value;
        
        // Verificações de posição válida
        if (i === Config.START_POS[0] && j === Config.START_POS[1]) {
            return; // Silenciosamente ignora a casa da Barbie durante o arrasto
        }
        
        if (Config.FRIENDS.some(f => f.pos[0] === i && f.pos[1] === j)) {
            return; // Silenciosamente ignora posições de amigos durante o arrasto
        }
        
        if (!this.customMap) {
            this.customMap = window.game && window.game.gameState.map.length > 0
                ? window.game.gameState.map.map(row => [...row])
                : MapGenerator.generateMap();
        }
        
        if (this.customMap[i][j] !== selectedTerrain) {
            this.customMap[i][j] = selectedTerrain;
            this.renderEditorMap();
        }
    }

    saveMapConfig() {
        if (!this.customMap) {
            alert('Nenhum mapa personalizado para salvar!');
            return;
        }
        
        const mapConfig = {
            map: this.customMap,
            timestamp: new Date().toISOString(),
            description: 'Mapa personalizado do Mundo da Barbie'
        };
        
        const jsonString = JSON.stringify(mapConfig, null, 2);
        
        // Tentar salvar no localStorage
        try {
            localStorage.setItem('barbie_custom_map', jsonString);
            alert('Mapa salvo com sucesso no localStorage!');
        } catch (e) {
            // Se localStorage não funcionar, mostrar o JSON
            document.getElementById('mapConfigText').value = jsonString;
            alert('localStorage não disponível. Configuração gerada no campo de texto abaixo - copie para salvar manualmente.');
        }
    }

    loadMapConfig() {
        try {
            const saved = localStorage.getItem('barbie_custom_map');
            if (saved) {
                const mapConfig = JSON.parse(saved);
                this.customMap = mapConfig.map;
                this.renderEditorMap();
                alert('Mapa carregado com sucesso do localStorage!');
            } else {
                alert('Nenhum mapa salvo encontrado no localStorage!');
            }
        } catch (e) {
            alert('Erro ao carregar mapa do localStorage: ' + e.message);
        }
    }

    exportMapConfig() {
        if (!this.customMap) {
            alert('Nenhum mapa personalizado para exportar!');
            return;
        }
        
        const mapConfig = {
            map: this.customMap,
            timestamp: new Date().toISOString(),
            description: 'Mapa personalizado do Mundo da Barbie'
        };
        
        document.getElementById('mapConfigText').value = JSON.stringify(mapConfig, null, 2);
        alert('Configuração exportada! Copie o texto abaixo para salvar em arquivo.');
    }

    importMapConfig() {
        const configText = document.getElementById('mapConfigText').value.trim();
        if (!configText) {
            alert('Cole a configuração do mapa na área de texto!');
            return;
        }
        
        try {
            const mapConfig = JSON.parse(configText);
            if (mapConfig.map && Array.isArray(mapConfig.map)) {
                this.customMap = mapConfig.map;
                this.renderEditorMap();
                alert('Mapa importado com sucesso!');
            } else {
                alert('Formato de configuração inválido!');
            }
        } catch (e) {
            alert('Erro ao importar mapa: ' + e.message);
        }
    }

    startDragFriend(friendName) {
        this.selectedFriend = friendName;
    }

    dropFriend(event, oldI, oldJ) {
        const rect = event.target.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Calcular nova posição baseado no local do drop
        const cellSize = 20; // Ajuste conforme seu CSS
        const newI = Math.floor(y / cellSize);
        const newJ = Math.floor(x / cellSize);

        // Validar nova posição
        if (newI >= 0 && newI < Config.GRID_SIZE && 
            newJ >= 0 && newJ < Config.GRID_SIZE) {
            
            // Verificar se a nova posição não é um edifício
            if (this.customMap[newI][newJ] !== 'edificio') {
                Config.updateFriendPosition(this.selectedFriend, [newI, newJ]);
                this.renderEditorMap();
            } else {
                alert('Não é possível posicionar amigos em edifícios!');
            }
        }
        
        this.selectedFriend = null;
    }

    getCustomMap() {
        return this.customMap;
    }

    clearCustomMap() {
        this.customMap = null;
    }
}