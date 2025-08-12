class GameState {
    constructor() {
        this.reset();
    }

    reset() {
        this.map = [];
        this.friends = [...Config.FRIENDS];
        this.acceptingFriends = [];
        this.barbiePos = [...Config.START_POS];
        this.convincedFriends = [];
        this.visitedFriends = [];
        this.currentCost = 0;
        this.path = [];
        this.visitedCells = new Set();
        this.isRunning = false;
        this.gameSpeed = Config.SPEEDS['Normal'];
        this.speedIndex = 2; // Normal
    }

    setMap(map) {
        this.map = map;
    }

    addVisitedCell(pos) {
        this.visitedCells.add(`${pos[0]},${pos[1]}`);
    }

    isVisited(pos) {
        return this.visitedCells.has(`${pos[0]},${pos[1]}`);
    }

    setAcceptingFriends(friends) {
        this.acceptingFriends = friends;
    }

    moveBarbieToPosition(pos) {
        this.barbiePos = [...pos];
    }

    addCost(cost) {
        this.currentCost += cost;
    }

    visitFriend(friendName) {
        if (!this.visitedFriends.includes(friendName)) {
            this.visitedFriends.push(friendName);
        }
    }

    convinceFriend(friendName) {
        if (!this.convincedFriends.includes(friendName)) {
            this.convincedFriends.push(friendName);
        }
    }

    getFriend(name) {
        return this.friends.find(f => f.name === name);
    }

    getFriendAt(pos) {
        return this.friends.find(f => f.pos[0] === pos[0] && f.pos[1] === pos[1]);
    }

    getAvailableFriends() {
        return this.friends.filter(friend => 
            !this.visitedFriends.includes(friend.name)
        );
    }

    willFriendAccept(friendName) {
        return this.acceptingFriends.includes(friendName);
    }

    isFriendConvinced(friendName) {
        return this.convincedFriends.includes(friendName);
    }

    isFriendVisited(friendName) {
        return this.visitedFriends.includes(friendName);
    }

    isGameComplete() {
        return this.convincedFriends.length >= 3;
    }

    getTerrainAt(pos) {
        if (pos[0] >= 0 && pos[0] < Config.GRID_SIZE && 
            pos[1] >= 0 && pos[1] < Config.GRID_SIZE) {
            return this.map[pos[0]][pos[1]];
        }
        return null;
    }

    getTerrainCost(terrain) {
        return Config.TERRAIN_COSTS[terrain] || Infinity;
    }

    toggleSpeed() {
        this.speedIndex = (this.speedIndex + 1) % Config.SPEED_NAMES.length;
        const speedName = Config.SPEED_NAMES[this.speedIndex];
        this.gameSpeed = Config.SPEEDS[speedName];
        return speedName;
    }
}