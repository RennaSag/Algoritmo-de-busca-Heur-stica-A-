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
        this.uiManager.setGameStatus('Executando busca A* otimizada');
        
        this.uiManager.log('🚀 Iniciando busca A* inteligente...');
        this.uiManager.log('🧠 Calculando rota ótima para visitar todos os amigos...');
        
        await this.executeOptimizedAStarSearch();
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

    // Nova implementação com A* otimizado
    async executeOptimizedAStarSearch() {
        // Primeiro, encontrar a melhor rota usando A* para visitar todos os amigos
        const optimalRoute = this.findOptimalRoute();
        
        if (!optimalRoute) {
            this.uiManager.log('❌ Não foi possível encontrar uma rota válida!');
            this.gameState.isRunning = false;
            this.uiManager.enableStartButton();
            return;
        }

        this.uiManager.log(`🎯 Rota ótima encontrada! Custo estimado: ${optimalRoute.totalCost} minutos`);
        this.uiManager.log(`📋 Ordem de visitação: ${optimalRoute.friendsOrder.join(' → ')}`);

        let totalCost = 0;
        let currentPos = [...this.gameState.barbiePos];

        // Executar a rota ótima
        for (let friendIndex = 0; friendIndex < optimalRoute.friendsOrder.length; friendIndex++) {
            if (!this.gameState.isRunning) break;

            const friendName = optimalRoute.friendsOrder[friendIndex];
            const friend = this.gameState.getFriend(friendName);
            
            this.uiManager.log(`🎯 Indo visitar ${friendName} na posição [${friend.pos}]`);
            
            // Encontrar caminho até o amigo
            const pathToFriend = this.aStar.findPath(currentPos, friend.pos);
            
            if (!pathToFriend) {
                this.uiManager.log(`❌ Não foi possível encontrar caminho para ${friendName}!`);
                continue;
            }

            this.uiManager.log(`📍 Caminho encontrado com custo: ${pathToFriend.cost} minutos`);
            
            // Mover ao longo do caminho
            for (let i = 1; i < pathToFriend.path.length; i++) {
                if (!this.gameState.isRunning) break;
                
                const prevPos = [...currentPos];
                currentPos = [...pathToFriend.path[i]];
                this.gameState.moveBarbieToPosition(currentPos);
                
                // Marcar célula anterior como visitada
                this.gameState.addVisitedCell(prevPos);
                
                const terrain = this.gameState.getTerrainAt(currentPos);
                const stepCost = this.gameState.getTerrainCost(terrain);
                totalCost += stepCost;
                this.gameState.currentCost = totalCost;
                
                this.uiManager.log(`👣 [${currentPos[0]}, ${currentPos[1]}] - ${terrain} (+${stepCost} min, total: ${totalCost} min)`);
                
                this.uiManager.updateDisplay();
                await this.sleep(this.gameState.gameSpeed);
            }
            
            // Tentar convencer o amigo
            this.gameState.visitFriend(friendName);
            const willAccept = this.gameState.willFriendAccept(friendName);
            
            if (willAccept) {
                this.gameState.convinceFriend(friendName);
                this.uiManager.log(`✅ ${friendName} aceitou participar do concurso! (${this.gameState.convincedFriends.length}/3)`);
                this.uiManager.animateFriendResponse(friendName, true);
            } else {
                this.uiManager.log(`❌ ${friendName} recusou o convite.`);
                this.uiManager.animateFriendResponse(friendName, false);
            }
            
            this.uiManager.updateFriendsStatus();
            this.uiManager.updateDisplay();
            await this.sleep(this.gameState.gameSpeed * 3);

            // Verificar se já conseguiu 3 amigos
            if (this.gameState.convincedFriends.length >= 3) {
                this.uiManager.log('🎉 Conseguiu convencer 3 amigos! Interrompendo busca...');
                break;
            }
        }
        
        // Retornar para casa
        if (this.gameState.convincedFriends.length >= 3) {
            await this.returnHome(totalCost, currentPos);
        } else {
            this.uiManager.log(`❌ Missão falhou! Apenas ${this.gameState.convincedFriends.length} pessoas foram convencidas.`);
            this.uiManager.setGameStatus(`Missão falhou - ${this.gameState.convincedFriends.length}/3 convencidos`);
        }
        
        this.gameState.isRunning = false;
        this.uiManager.enableStartButton();
    }

    // Encontrar a rota ótima usando A* com análise de permutações
    findOptimalRoute() {
        const allFriends = [...this.gameState.friends];
        const startPos = [...this.gameState.barbiePos];
        
        // Calcular todas as permutações possíveis de visitação
        const permutations = this.generatePermutations(allFriends);
        let bestRoute = null;
        let minCost = Infinity;

        this.uiManager.log(`🔍 Analisando ${permutations.length} rotas possíveis...`);

        for (const permutation of permutations) {
            const routeCost = this.calculateRouteCost(startPos, permutation);
            
            if (routeCost !== null && routeCost < minCost) {
                minCost = routeCost;
                bestRoute = {
                    friendsOrder: permutation.map(f => f.name),
                    totalCost: routeCost,
                    friends: permutation
                };
            }
        }

        if (bestRoute) {
            this.uiManager.log(`✨ Melhor rota encontrada com custo ${bestRoute.totalCost} minutos`);
        }

        return bestRoute;
    }

    // Gerar todas as permutações possíveis de amigos
    generatePermutations(friends) {
        if (friends.length <= 1) return [friends];
        
        const result = [];
        for (let i = 0; i < friends.length; i++) {
            const current = friends[i];
            const remaining = friends.slice(0, i).concat(friends.slice(i + 1));
            const permutations = this.generatePermutations(remaining);
            
            for (const perm of permutations) {
                result.push([current, ...perm]);
            }
        }
        
        return result;
    }

    // Calcular o custo total de uma rota específica
    calculateRouteCost(startPos, friendsSequence) {
        let currentPos = [...startPos];
        let totalCost = 0;
        
        // Custo para visitar todos os amigos na sequência
        for (const friend of friendsSequence) {
            const pathResult = this.aStar.findPath(currentPos, friend.pos);
            if (!pathResult) {
                return null; // Rota impossível
            }
            
            totalCost += pathResult.cost;
            currentPos = [...friend.pos];
        }
        
        // Custo para retornar para casa
        const returnPath = this.aStar.findPath(currentPos, Config.START_POS);
        if (!returnPath) {
            return null; // Impossível retornar
        }
        
        totalCost += returnPath.cost;
        
        return totalCost;
    }

    async returnHome(totalCost, currentPos) {
        this.uiManager.log('🎉 Missão cumprida! Calculando rota de retorno...');
        const returnPath = this.aStar.findPath(currentPos, Config.START_POS);
        
        if (returnPath) {
            this.uiManager.log(`🏠 Retornando para casa - Custo do retorno: ${returnPath.cost} minutos`);
            
            for (let i = 1; i < returnPath.path.length; i++) {
                if (!this.gameState.isRunning) break;
                
                const prevPos = [...currentPos];
                currentPos = [...returnPath.path[i]];
                this.gameState.moveBarbieToPosition(currentPos);
                
                // Marcar célula anterior como visitada
                this.gameState.addVisitedCell(prevPos);
                
                const terrain = this.gameState.getTerrainAt(currentPos);
                const stepCost = this.gameState.getTerrainCost(terrain);
                totalCost += stepCost;
                this.gameState.currentCost = totalCost;
                
                this.uiManager.log(`🏠 Retornando: [${currentPos[0]}, ${currentPos[1]}] - ${terrain} (+${stepCost} min)`);
                
                this.uiManager.updateDisplay();
                await this.sleep(this.gameState.gameSpeed);
            }
            
            this.uiManager.log(`🏠 Barbie chegou em casa! Custo total final: ${totalCost} minutos`);
            this.uiManager.log(`🏆 MISSÃO CONCLUÍDA COM SUCESSO! ${this.gameState.convincedFriends.length} amigos convencidos`);
            this.uiManager.setGameStatus(`✅ Concluído! ${totalCost} min - ${this.gameState.convincedFriends.length}/3 amigos`);
        } else {
            this.uiManager.log('❌ Não foi possível encontrar caminho de volta para casa!');
            this.uiManager.setGameStatus('❌ Erro no retorno');
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