class Game {
    constructor() {
        this.gameState = new GameState();
        this.uiManager = new UIManager(this.gameState);
        this.aStar = new AStar(this.gameState);
        this.mapEditor = new MapEditor();
    }

    initializeGame() {
        // Usar mapa customizado se disponível, senão gerar padrão
        const customMap = this.mapEditor.getCustomMap();
        const map = customMap || MapGenerator.generateMap();
        
        this.gameState.reset();
        this.gameState.setMap(map);
        
        // Sortear quais 3 amigos vão aceitar
        const shuffled = [...Config.FRIENDS].sort(() => 0.5 - Math.random());
        const acceptingFriends = shuffled.slice(0, 3).map(f => f.name);
        this.gameState.setAcceptingFriends(acceptingFriends);

        this.uiManager.log(`🎮 Jogo inicializado! Amigos que vão aceitar: ${acceptingFriends.join(', ')}`);
        if (customMap) {
            this.uiManager.log('🗺️ Usando mapa personalizado');
        }
        
        this.uiManager.initializeCoordinates();
        this.uiManager.updateDisplay();
        this.uiManager.updateFriendsStatus();
        
        this.uiManager.enableStartButton();
        this.uiManager.setGameStatus('Pronto para iniciar');
    }

    async startSearch() {
        if (this.gameState.isRunning) return;
        
        this.gameState.isRunning = true;
        this.uiManager.disableStartButton();
        this.uiManager.setGameStatus('Executando busca A*');
        
        this.uiManager.log('🚀 Iniciando busca A*...');
        
        await this.executeAStarSearch();
    }

    resetGame() {
        this.gameState.isRunning = false;
        this.gameState.reset();
        
        this.uiManager.disableStartButton();
        this.uiManager.setGameStatus('Aguardando inicialização');
        
        this.uiManager.updateDisplay();
        this.uiManager.updateFriendsStatus();
        this.uiManager.clearLog();
        
        this.uiManager.log('🔄 Jogo resetado');
    }

    toggleSpeed() {
        const speedName = this.gameState.toggleSpeed();
        this.uiManager.updateSpeedText(speedName);
    }

    async executeAStarSearch() {
        let totalCost = 0;
        
        while (this.gameState.convincedFriends.length < 3 && this.gameState.isRunning) {
            // Encontrar o próximo amigo mais próximo não visitado
            const availableFriends = this.gameState.getAvailableFriends();
            
            if (availableFriends.length === 0) {
                this.uiManager.log('❌ Não há mais amigos para visitar!');
                break;
            }
            
            // Calcular distâncias e escolher o mais próximo
            const { friend: closestFriend, path: shortestPath } = this.aStar.findClosestFriend(
                this.gameState.barbiePos, 
                availableFriends
            );
            
            if (!closestFriend) {
                this.uiManager.log('❌ Não foi possível encontrar caminho para nenhum amigo!');
                break;
            }
            
            this.uiManager.log(`🎯 Indo visitar ${closestFriend.name} na posição [${closestFriend.pos}]`);
            this.uiManager.log(`📍 Caminho encontrado com custo: ${shortestPath.cost} minutos`);
            
            // Mover ao longo do caminho
            for (let i = 1; i < shortestPath.path.length; i++) {
                if (!this.gameState.isRunning) break;
                
                const prevPos = [...this.gameState.barbiePos];
                this.gameState.moveBarbieToPosition(shortestPath.path[i]);
                
                // Marcar célula anterior como visitada
                this.gameState.addVisitedCell(prevPos);
                
                const terrain = this.gameState.getTerrainAt(this.gameState.barbiePos);
                const stepCost = this.gameState.getTerrainCost(terrain);
                totalCost += stepCost;
                this.gameState.currentCost = totalCost;
                
                this.uiManager.log(`👣 Movendo para [${this.gameState.barbiePos[0]}, ${this.gameState.barbiePos[1]}] - Terreno: ${terrain} (${stepCost} min)`);
                
                this.uiManager.updateDisplay();
                await this.sleep(this.gameState.gameSpeed);
            }
            
            // Tentar convencer o amigo
            this.gameState.visitFriend(closestFriend.name);
            const willAccept = this.gameState.willFriendAccept(closestFriend.name);
            
            if (willAccept) {
                this.gameState.convinceFriend(closestFriend.name);
                this.uiManager.log(`✅ ${closestFriend.name} aceitou participar do concurso!`);
                this.uiManager.animateFriendResponse(closestFriend.name, true);
            } else {
                this.uiManager.log(`❌ ${closestFriend.name} recusou o convite.`);
                this.uiManager.animateFriendResponse(closestFriend.name, false);
            }
            
            this.uiManager.updateFriendsStatus();
            this.uiManager.updateDisplay();
            await this.sleep(this.gameState.gameSpeed * 3); // Pausa mais longa para mostrar a resposta
        }
        
        // Retornar para casa se conseguiu convencer 3 pessoas
        if (this.gameState.isGameComplete()) {
            await this.returnHome(totalCost);
        } else {
            this.uiManager.log(`❌ Missão falhou! Apenas ${this.gameState.convincedFriends.length} pessoas foram convencidas.`);
            this.uiManager.setGameStatus('Missão falhou');
        }
        
        this.gameState.isRunning = false;
        this.uiManager.enableStartButton();
    }

    async returnHome(totalCost) {
        this.uiManager.log('🎉 Missão cumprida! Retornando para casa...');
        const returnPath = this.aStar.findPath(this.gameState.barbiePos, Config.START_POS);
        
        if (returnPath) {
            for (let i = 1; i < returnPath.path.length; i++) {
                if (!this.gameState.isRunning) break;
                
                const prevPos = [...this.gameState.barbiePos];
                this.gameState.moveBarbieToPosition(returnPath.path[i]);
                
                // Marcar célula anterior como visitada
                this.gameState.addVisitedCell(prevPos);
                
                const terrain = this.gameState.getTerrainAt(this.gameState.barbiePos);
                const stepCost = this.gameState.getTerrainCost(terrain);
                totalCost += stepCost;
                this.gameState.currentCost = totalCost;
                
                this.uiManager.log(`🏠 Retornando para casa: [${this.gameState.barbiePos[0]}, ${this.gameState.barbiePos[1]}] - ${terrain} (${stepCost} min)`);
                
                this.uiManager.updateDisplay();
                await this.sleep(this.gameState.gameSpeed);
            }
            
            this.uiManager.log(`🏠 Barbie chegou em casa! Custo total: ${totalCost} minutos`);
            this.uiManager.setGameStatus(`Missão concluída! Custo: ${totalCost} min`);
        } else {
            this.uiManager.log('❌ Não foi possível encontrar caminho de volta para casa!');
        }
    }

    loadPresetMap() {
        const presets = {
            'Cidade': MapGenerator.generateCityMap(),
            'Labirinto': MapGenerator.generateMazeMap(),
            'Campo': MapGenerator.generateFieldMap(),
            'Padrão': MapGenerator.generateMap()
        };
        
        const choice = this.uiManager.showPrompt('Escolha um mapa pré-definido:\n1 - Cidade\n2 - Labirinto\n3 - Campo\n4 - Padrão\n\nDigite o número:');
        
        const maps = Object.values(presets);
        const index = parseInt(choice) - 1;
        
        if (index >= 0 && index < maps.length) {
            this.mapEditor.customMap = maps[index];
            const mapNames = Object.keys(presets);
            this.uiManager.log(`🗺️ Mapa "${mapNames[index]}" carregado!`);
            
            // Se o jogo já foi inicializado, atualizar o display
            if (this.gameState.map.length > 0) {
                this.gameState.setMap(this.mapEditor.customMap);
                this.uiManager.updateDisplay();
            }
        } else {
            this.uiManager.showAlert('Opção inválida!');
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}