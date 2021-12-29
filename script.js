let maze;
const SCALE = 20;
let canvas;
let context;


class Maze {
    /**
     * Generates a random maze of size width x height
     * @param {number} width
     * @param {number} height
     */
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.showSolution = true;

        this.player = 0;

        const vertices = new Set();
        vertices.add(0);
        this.neighbors = new Array(width * height).fill(0).map(x => []);
        let border = [[0, 1], [0, height]];     // (x, y) <=> height * x + y
        while (vertices.size < width * height) {
            const [v1, v2] = border[~~(Math.random() * border.length)];
            vertices.add(v2);
            this.neighbors[v1].push(v2);
            this.neighbors[v2].push(v1);
            border = border.filter(e => e[1] !== v2);
            const x = ~~(v2 / height);
            const y = v2 % height;
            border = border.concat(
                [{x: x + 1, y: y}, {x: x - 1, y: y}, {x: x, y: y + 1}, {x: x, y: y - 1}]
                    .filter(p =>
                        0 <= p.x && p.x < width
                        && 0 <= p.y && p.y < height
                        && !vertices.has(height * p.x + p.y))
                    .map(p => [v2, height * p.x + p.y])
            );
        }

        // Shuffle some edges to make the solution a bit less direct
        for (let i = 0; i < Math.max(width, height); i++) {
            this.flip();
        }

        canvas.width = SCALE * width;
        canvas.height = SCALE * height;
        context.scale(SCALE, SCALE);
    }

    /**
     * Draws the maze on the canvas
     */
    draw() {
        context.fillRect(0, 0, this.width, this.height);

        context.save();
        context.lineCap = "round";
        context.translate(.5, .5);

        // Draw the maze corridors
        context.beginPath();
        context.strokeStyle = '#ffffff';
        context.lineWidth = .5;
        for (let i = 0; i < this.width * this.height; i++) {
            for (const j of this.neighbors[i]) {
                if (i < j) {
                    const x1 = ~~(i / this.height);
                    const y1 = i % this.height;
                    const x2 = ~~(j / this.height);
                    const y2 = j % this.height;
                    context.moveTo(x1, y1);
                    context.lineTo(x2, y2);
                }
            }
        }
        context.stroke();

        // Draw the solution
        if (this.showSolution) {
            const path = this.findPath(this.player, this.width * this.height - 1);
            context.strokeStyle = '#ff0000';
            context.lineWidth = .25;
            context.beginPath();
            let [x, y] = this.coords(path[0]);
            context.moveTo(x, y);
            for (let p of path) {
                [x, y] = this.coords(p);
                context.lineTo(x, y);
            }
            context.stroke();
        }

        // Draw the player
        context.beginPath();
        const [px, py] = this.coords(this.player);
        context.fillStyle = '#00ff00';
        context.moveTo(px, py);
        context.arc(px, py, .5, 0, 2 * Math.PI);
        context.fill();
        context.restore();
    }

    move(dx, dy) {
        const [x, y] = this.coords(this.player);
        const target = this.vertex(x + dx, y + dy);
        if (this.neighbors[this.player].includes(target)) {
            this.player = target;
            this.draw();
            console.log("moved");
        }
    }

    /**
     * Returns the shortest path from start to end as a list of vertices
     * @param {number} start The starting vertex
     * @param {number} end The ending vertex
     * @returns {[number]} List of vertices to go from start to end (or undefined if no path exists)
     */
    findPath(start, end) {
        const visited = new Set([start]);
        const border = [{node: start, prev: undefined}];
        while (border.length > 0) {
            const link = border.pop();
            if (link.node === end) {
                const path = []
                let current = link;
                while (current !== undefined) {
                    path.unshift(current.node);
                    current = current.prev;
                }
                return path;
            }
            for (const v of this.neighbors[link.node]) {
                if (!visited.has(v)) {
                    visited.add(v);
                    border.unshift({node: v, prev: link});
                }
            }
        }
    }

    /**
     * Returns the vertex index at given coordinates
     * @param {number} x x-coordinate of the vertex
     * @param {number} x y-coordinate of the vertex
     * @returns {number} index of the corresponding vertex
     */
    vertex(x, y) {
        return this.height * x + y;
    }

    /**
     * Returns the coordinates of the given vertex
     * @param {number} n index of the vertex
     * @returns {number[]} x and y-coordinates of the vertex
     */
    coords(n) {
        return [~~(n / this.height), n % this.height];
    }

    /**
     * Toggles display of solution on or off
     */
    toggleSolution() {
        this.showSolution = !this.showSolution;
        this.draw();
    }

    /**
     * Draws a path on the canvas
     * @param {[number]} path list of vertices along the path
     */
    drawPath(path) {
        context.save();
        context.beginPath();
        context.strokeStyle = '#ff0000';
        context.lineCap = "round";
        context.lineWidth = .25;
        context.translate(.5, .5);
        let [x, y] = this.coords(path[0]);
        context.moveTo(x, y);
        for (let p of path) {
            [x, y] = this.coords(p);
            context.lineTo(x, y);
        }
        context.stroke();
        context.restore();
    }

    /**
     * Removes one edge from the solution, and adds another random edge to reconnect the graph
     */
    flip() {
        // Remove a random edge on the solution
        const goal = this.vertex(this.width - 1, this.height - 1);
        const path = this.findPath(0, goal);
        let i = ~~(Math.random() * (path.length - 1));
        let u = path[i];
        let v = path[i + 1];
        this.neighbors[u] = this.neighbors[u].filter(x => x !== v);
        this.neighbors[v] = this.neighbors[v].filter(x => x !== u);

        // Make list of edges that reconnect the graph
        const component = this.getConnexComponent(0);
        const border = [];
        for (const u of component) {
            const [x1, y1] = this.coords(u);
            for (const [x2, y2] of [[x1 - 1, y1], [x1 + 1, y1], [x1, y1 - 1], [x1, y1 + 1]]) {
                if (0 <= x2 && x2 < this.width && 0 <= y2 && y2 < this.height) {
                    const v = this.vertex(x2, y2);
                    if (!component.has(v)) {
                        border.push([u, v]);
                    }
                }
            }
        }
        // Add a random edge from the border to reconnect the graph
        i = ~~(Math.random() * border.length);
        [u, v] = border[i];
        this.neighbors[u].push(v);
        this.neighbors[v].push(u);
        this.draw();
    }

    /**
     * Returns the connex component of the graph containing the given vertex
     * @param {number} vertex index of vertex in the component
     * @returns {Set<number>} set of vertices in the component
     */
    getConnexComponent(vertex) {
        const component = new Set([vertex]);
        const border = [vertex];
        while (border.length > 0) {
            const v = border.pop();
            for (const w of this.neighbors[v]) {
                if (!component.has(w)) {
                    component.add(w);
                    border.unshift(w);
                }
            }
        }
        return component;
    }
}

window.addEventListener("load", e => {
    canvas = document.getElementById('maze');
    context = canvas.getContext('2d');
    maze = new Maze(40, 30);
    maze.draw();
});

window.addEventListener("keydown", e => {
    console.log(e.key);
    switch (e.key) {
        case 's':
            maze.toggleSolution();
            break;
        case 'f':
            maze.flip();
            break;
        case 'ArrowUp':
            maze.move(0, -1);
            break;
        case 'ArrowDown':
            maze.move(0, 1);
            break;
        case 'ArrowLeft':
            maze.move(-1, 0);
            break;
        case 'ArrowRight':
            maze.move(1, 0);
            break;
    }
});