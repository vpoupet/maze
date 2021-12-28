const SCALE = 20;
const WIDTH = 10;

function makeMaze(width, height) {
    const vertices = new Set();
    vertices.add(0);
    const edges = [];
    let border = [[0, 1], [0, height]];     // (x, y) <=> height * x + y
    while (vertices.size < width * height) {
        const [v1, v2] = border[~~(Math.random() * border.length)];
        vertices.add(v2);
        edges.push([v1, v2]);
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
    return {width, height, edges};
}


function drawMaze(maze) {
    const canvas = document.getElementById("canvas");
    const context = canvas.getContext('2d');
    canvas.width = SCALE * maze.width;
    canvas.height = SCALE * maze.height;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.beginPath();
    context.strokeStyle = '#ffffff';
    context.lineCap = "round";
    context.lineWidth = WIDTH;
    for (const e of maze.edges) {
        const x1 = ~~(e[0] / maze.height);
        const y1 = e[0] % maze.height;
        const x2 = ~~(e[1] / maze.height);
        const y2 = e[1] % maze.height;
        context.moveTo(SCALE * x1 + SCALE/2, SCALE * y1 + SCALE/2);
        context.lineTo(SCALE * x2 + SCALE/2, SCALE * y2 + SCALE/2);
    }
    context.stroke();
}


window.addEventListener("load", e => {
    const m = makeMaze(80, 50);
    drawMaze(m);
});