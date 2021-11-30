import { Global } from '../properties.js';
import { Cell } from './cell.js';
import { render } from '../renderer/renderer.js';
import { User } from '../user/user.js';
import { Camera } from '../renderer/camera.js';
export function create_grid() {
    let x = 0;
    let y = 0;
    let y_offset = 0;
    for (let i = 0; i < Global.grid_size.x; i++) {
        Global.grid.push([]);
        y = 0;
        y_offset = i % 2 ? Math.sin(Global.hexagon_angle) : 0;
        for (let j = 0; j < Global.grid_size.y; j++) {
            Global.grid[i].push(new Cell(i, j, x, y + y_offset, "#FFFFFF", '', 0));
            y += Math.sin(Global.hexagon_angle) * 2;
        }
        x += 1 + Math.cos(Global.hexagon_angle);
    }
    Global.grid_boundaries.width = x;
    Global.grid_boundaries.height = y + y_offset;
}
export function draw_grid(context) {
    context.font = '0.75px Roboto_bold';
    context.fillStyle = '#000000';
    context.textAlign = 'center';
    context.fillText("load", -10000, -10000);
    if (User.joined) {
        for (let i = 0; i < Global.grid_size.x; i++)
            for (let j = 0; j < Global.grid_size.y; j++)
                if (Global.grid[i][j].user_id == '')
                    Global.grid[i][j].draw(context);
        for (let i = 0; i < Global.grid_size.x; i++)
            for (let j = 0; j < Global.grid_size.y; j++)
                if (Global.grid[i][j].user_id != '')
                    Global.grid[i][j].draw(context);
    }
    else {
        if (Global.cell_from != null && Global.cell_from.user_id != User.id)
            Global.cell_from = null;
        for (let i = 0; i < Global.grid_size.x; i++)
            for (let j = 0; j < Global.grid_size.y; j++)
                if (Global.grid[i][j].user_id == '')
                    Global.grid[i][j].draw(context);
        for (let i = 0; i < Global.grid_size.x; i++)
            for (let j = 0; j < Global.grid_size.y; j++)
                if (Global.grid[i][j].user_id != '' && Global.grid[i][j].user_id != User.id)
                    Global.grid[i][j].draw(context);
        for (let i = 0; i < Global.grid_size.x; i++)
            for (let j = 0; j < Global.grid_size.y; j++)
                if (Global.grid[i][j].user_id == User.id)
                    Global.grid[i][j].draw(context);
    }
}
export function get_cell(x, y) {
    if (x < 0 || x >= Global.grid_size.x || y < 0 || y >= Global.grid_size.y)
        return null;
    return Global.grid[x][y];
}
export function set_cell(change) {
    if (change.i < 0 || change.i >= Global.grid_size.x || change.j < 0 || change.j >= Global.grid_size.y)
        return null;
    Global.grid[change.i][change.j].color = change.color;
    Global.grid[change.i][change.j].user_id = change.user_id;
    Global.grid[change.i][change.j].nb_troops = change.nb_troops;
    return Global.grid[change.i][change.j];
}
export function get_cell_from_mouse(x, y) {
    let mouse_pos = Camera.screen_to_canvas(x, y);
    let distance = 100000;
    let index = { x: 0, y: 0 };
    for (let i = 0; i < Global.grid_size.x; i++)
        for (let j = 0; j < Global.grid_size.y; j++) {
            let temp = Math.sqrt(Math.pow(mouse_pos.x - Global.grid[i][j].x, 2) + Math.pow(mouse_pos.y - Global.grid[i][j].y, 2));
            if (temp < distance) {
                distance = temp;
                index = { x: i, y: j };
            }
        }
    if (distance > 1.)
        return null;
    return Global.grid[index.x][index.y];
}
export function update_grid_from_server(socket) {
    socket.on('grid_to_client', server_grid => {
        for (let i = 0; i < Global.grid_size.x; i++)
            for (let j = 0; j < Global.grid_size.y; j++) {
                Global.grid[i][j].color = server_grid[i][j].color;
                Global.grid[i][j].user_id = server_grid[i][j].user_id;
                Global.grid[i][j].nb_troops = server_grid[i][j].nb_troops;
            }
        render();
    });
    socket.emit('ask_for_grid');
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
export function get_neighbours(cell) {
    let temp = [];
    let neighbours = [];
    temp.push(get_cell(cell.i - 1, cell.j + (((cell.i + 1) % 2 == 0) ? 1 : 0)));
    temp.push(get_cell(cell.i, cell.j - 1));
    temp.push(get_cell(cell.i - 1, cell.j - (((cell.i + 1) % 2 != 0) ? 1 : 0)));
    temp.push(get_cell(cell.i, cell.j + 1));
    temp.push(get_cell(cell.i + 1, cell.j + (((cell.i + 1) % 2 == 0) ? 1 : 0)));
    temp.push(get_cell(cell.i + 1, cell.j - (((cell.i + 1) % 2 != 0) ? 1 : 0)));
    for (let i = 0; i < temp.length; i++) {
        let cell = temp[i];
        if (cell != null)
            neighbours.push(cell);
    }
    return neighbours;
}
