// Variáveis globais para acesso via HTML
let game;
let mapEditor;

// Inicialização da aplicação
window.onload = function() {
    game = new Game();
    mapEditor = game.mapEditor; // Para compatibilidade com os eventos HTML
    
    game.uiManager.initializeCoordinates();
    game.uiManager.updateDisplay();
    game.uiManager.log('🌟 Sistema carregado! Clique em "Inicializar Jogo" para começar.');
};

// Aguardar carregamento completo antes de expor as variáveis globais
document.addEventListener('DOMContentLoaded', function() {
    // Garantir que as variáveis globais estejam disponíveis após inicialização
    setTimeout(() => {
        window.game = game;
        window.mapEditor = mapEditor;
    }, 100);
});