let maze;
let showSolution = false;

class Maze {
    /**
     * Generates a random maze of size width x height
     * @param {number} width
     * @param {number} height
     */
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.scale = 20;

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
    }

    /**
     * Draws the maze on the canvas
     */
    draw() {
        const canvas = document.getElementById("maze");
        const context = canvas.getContext('2d');
        canvas.width = this.scale * this.width;
        canvas.height = this.scale * this.height;
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.beginPath();
        context.strokeStyle = '#ffffff';
        context.lineCap = "round";
        context.lineWidth = this.scale / 2;
        for (let i = 0; i < this.width * this.height; i++) {
            for (const j of this.neighbors[i]) {
                if (i < j) {
                    const x1 = ~~(i / this.height);
                    const y1 = i % this.height;
                    const x2 = ~~(j / this.height);
                    const y2 = j % this.height;
                    context.moveTo(this.scale * x1 + this.scale / 2, this.scale * y1 + this.scale / 2);
                    context.lineTo(this.scale * x2 + this.scale / 2, this.scale * y2 + this.scale / 2);
                }
            }
        }
        context.stroke();
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
     * Draws a path on the canvas
     * @param {[number]} path list of vertices along the path
     */
    drawPath(path) {
        const canvas = document.getElementById('maze');
        const context = canvas.getContext('2d');
        context.beginPath();
        context.strokeStyle = '#ff0000';
        context.lineCap = "round";
        context.lineWidth = this.scale / 4;
        let [x, y] = this.coords(path[0]);
        context.moveTo(x * this.scale + this.scale / 2, y * this.scale + this.scale / 2);
        for (let p of path) {
            [x, y] = this.coords(p);
            context.lineTo(x * this.scale + this.scale / 2, y * this.scale + this.scale / 2);
        }
        context.stroke();
    }

    /**
     * Draws the path from top left (0, 0) to bottom right (width - 1, height - 1)
     */
    drawSolution() {
        const path = this.findPath(0, this.vertex(this.width - 1, this.height - 1));
        this.drawPath(path);
    }
}

function toggleSolution() {
    showSolution = !showSolution;
    update();
}

function update() {
    maze.draw();
    if (showSolution) {
        maze.drawSolution();
    }
}

window.addEventListener("load", e => {
    maze = new Maze(40, 30);
    update();
});

window.addEventListener("keypress", e => {
    if (e.key === "s") {
        toggleSolution();
    }
});