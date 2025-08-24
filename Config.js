class Config {
    static GRID_SIZE = 42;
    static START_POS = [22, 18];
    
    static TERRAIN_COSTS = {
        asfalto: 1,
        terra: 3,
        grama: 5,
        paralelepipedo: 10,
        edificio: Infinity
    };

    static FRIENDS = [
        { name: 'Suzy', pos: [4, 12] },
        { name: 'Polly', pos: [9, 8] },
        { name: 'Mary', pos: [5, 34] },
        { name: 'Carly', pos: [36, 36] },
        { name: 'Ken', pos: [35, 14] },
        { name: 'Brandon', pos: [23, 37] }
    ];

    static SPEEDS = {
        'Muito Rápida': 50,
        'Rápida': 100,
        'Normal': 200,
        'Lenta': 500
    };

    static SPEED_NAMES = ['Muito Rápida', 'Rápida', 'Normal', 'Lenta'];
}