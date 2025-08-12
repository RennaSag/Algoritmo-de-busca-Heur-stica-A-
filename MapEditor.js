class MapEditor {
    constructor() {
        this.isEditingMap = false;
        this.customMap = null;
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
        
        for (let i = 0; i < Config.GRID_SIZE; i++) {
            for (let j = 0; j < Config.GRID_SIZE; j++) {
                const terrain = currentMap[i][j];
                let cellContent = '';
                
                // Mostrar posições especiais
                if (i === Config.START_POS[0] && j === Config.START_POS[1]) {
                    cellContent = '🏠';
                } else {
                    const friend = Config.FRIENDS.find(f => f.pos[0] === i && f.pos[1] === j);
                    if (friend) {
                        cellContent = friend.name[0];
                    }
                }
                
                html += `<div class="cell ${terrain}" onclick="mapEditor.paintCell(${i}, ${j})" style="cursor: pointer; font-size: 10px; display: inline-flex; align-items: center; justify-content: center; color: white; text-shadow: 1px 1px 1px rgba(0,0,0,0.8);" title="[${i},${j}] - ${terrain}">${cellContent}</div>`;
            }
            html += '<br>';
        }
        
        editorMapElement.innerHTML = html;
    }

    paintCell(i, j) {
        if (!this.isEditingMap) return;
        
        const selectedTerrain = document.getElementById('terrainSelector').value;
        
        // Não permitir pintar sobre casa da Barbie ou amigos
        if (i === Config.START_POS[0] && j === Config.START_POS[1]) {
            alert('Não é possível modificar a Casa da Barbie!');
            return;
        }
        
        if (Config.FRIENDS.some(f => f.pos[0] === i && f.pos[1] === j)) {
            alert('Não é possível modificar a posição de um amigo!');
            return;
        }
        
        if (!this.customMap) {
            // Clonar o mapa atual ou gerar um novo
            if (window.game && window.game.gameState.map.length > 0) {
                this.customMap = window.game.gameState.map.map(row => [...row]);
            } else {
                this.customMap = MapGenerator.generateMap();
            }
        }
        
        this.customMap[i][j] = selectedTerrain;
        this.renderEditorMap();
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

    getCustomMap() {
        return this.customMap;
    }

    clearCustomMap() {
        this.customMap = null;
    }
}