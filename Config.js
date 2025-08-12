class Config {
    static GRID_SIZE = 42;
    static START_POS = [23, 19];
    
    static TERRAIN_COSTS = {
        asfalto: 1,
        terra: 3,
        grama: 5,
        paralelepipedo: 10,
        edificio: Infinity
    };

    static FRIENDS = [
        { name: 'Suzy', pos: [5, 8] },
        { name: 'Polly', pos: [35, 12] },
        { name: 'Mary', pos: [8, 30] },
        { name: 'Carly', pos: [38, 35] },
        { name: 'Ken', pos: [15, 5] },
        { name: 'Brandon', pos: [25, 38] }
    ];

    static SPEEDS = {
        'Muito Rápida': 50,
        'Rápida': 100,
        'Normal': 200,
        'Lenta': 500
    };

    static SPEED_NAMES = ['Muito Rápida', 'Rápida', 'Normal', 'Lenta'];
}