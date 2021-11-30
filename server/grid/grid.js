import * as Utils from '../utils/utils.js';
import { Cell } from './cell.js';
let grid_size = { x: 60, y: 30 };
let grid = [];
export function create_grid() {
    for (let i = 0; i < grid_size.x; i++) {
        grid.push([]);
        for (let j = 0; j < grid_size.y; j++)
            grid[i].push(new Cell("#FFFFFF", '', 0));
    }
}
export function set_cell(change) {
    if (change.i < 0 || change.i >= grid_size.x || change.j < 0 || change.j >= grid_size.y)
        return null;
    grid[change.i][change.j].color = change.color;
    grid[change.i][change.j].user_id = change.user_id;
    grid[change.i][change.j].nb_troops = change.nb_troops;
    return grid[change.i][change.j];
}
export function get_cell(x, y) {
    if (x < 0 || x >= grid_size.x || y < 0 || y >= grid_size.y)
        return null;
    return grid[x][y];
}
export function get_grid() {
    return grid;
}
export function get_random_cell() {
    return { i: Utils.random_int(0, grid_size.x), j: Utils.random_int(0, grid_size.y) };
}
export function are_neighbours(cell_1, cell_2) {
    if (cell_1 == null || cell_2 == null)
        return false;
    if (cell_1.i == cell_2.i && Math.abs(cell_1.j - cell_2.j) == 1)
        return true;
    if (Math.abs(cell_1.i - cell_2.i) == 1) {
        if (cell_1.i % 2 == 0)
            return cell_2.j == cell_1.j || cell_2.j == cell_1.j - 1;
        else
            return cell_2.j == cell_1.j || cell_2.j == cell_1.j + 1;
    }
    return false;
}
export function remove_user_from_grid(user, io) {
    let changes = [];
    for (let i = 0; i < grid_size.x; i++)
        for (let j = 0; j < grid_size.y; j++)
            if (grid[i][j].user_id == user.id) {
                grid[i][j].color = '#ffffff';
                grid[i][j].user_id = '';
                grid[i][j].nb_troops = 0;
                changes.push({
                    i: i,
                    j: j,
                    color: '#ffffff',
                    user_id: '',
                    nb_troops: 0
                });
            }
    io.emit('changes', { changes: changes, is_move: false });
}
