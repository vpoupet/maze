import datetime
import json
import random


def make_maze(width, height):
    vertices = {(0, 0)}
    edges = []
    border = [((0, 0), (1, 0)), ((0, 0), (0, 1))]
    while len(vertices) < width * height:
        x, y = random.choice(border)
        vertices.add(y)
        edges.append((x, y))
        border = [e for e in border if e[1] != y]
        border += [
            (y, (y[0] + di, y[1] + dj)) for di, dj in ((1, 0), (0, 1), (-1, 0), (0, -1))
            if 0 <= y[0] + di < width and 0 <= y[1] + dj < height and (y[0] + di, y[1] + dj) not in vertices]
    return edges


if __name__ == '__main__':
    edges = make_maze(200, 200)
    print(edges)