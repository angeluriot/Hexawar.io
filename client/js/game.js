import { Global } from './properties.js';
import * as Grid from './grid/grid.js';
import { render } from './renderer/renderer.js';
import * as Cookie from './user/cookie.js';
import { Camera } from './renderer/camera.js';
import { User } from './user/user.js';
export function load_background(socket) {
    let canvas = document.getElementById('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    Grid.create_grid();
    Camera.init();
    Grid.update_grid_from_server(socket);
    socket.on('change', change => {
        Grid.set_cell(change);
        render();
    });
    socket.on('changes', update => {
        for (let i = 0; i < update.changes.length; i++)
            Grid.set_cell(update.changes[i]);
        if (User.joined && update.is_move && update.changes[0].user_id == User.id && update.changes[1].user_id == User.id)
            Global.cell_from = Grid.get_cell(update.changes[1].i, update.changes[1].j);
        render();
    });
}
export function join_game(socket) {
    socket.on('send_joining_data', data => {
        User.id = data.socket_id;
        let cell = Grid.get_cell(data.spawn.i, data.spawn.j);
        if (cell != null)
            Camera.move(cell.x, cell.y);
        render();
    });
    socket.emit('join_game', User.get_object());
}
export function start_game(socket, nickname, color) {
    let canvas = document.getElementById('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    User.nickname = nickname;
    User.color = color;
    join_game(socket);
    game_events(socket);
    Cookie.create_cookie();
    render();
    socket.on('death', () => {
        setTimeout(() => {
            location.reload();
        }, 1000);
    });
}
export function game_events(socket) {
    move(socket);
}
export function move(socket) {
    function double_click(e) {
        let cell = Grid.get_cell_from_mouse(e.clientX, e.clientY);
        if (cell != null && cell.user_id == User.id) {
            let cell_to = cell;
            let cells_from = Grid.get_neighbours(cell_to);
            for (let i = 0; i < cells_from.length; i++)
                if (cells_from[i].user_id == cell_to.user_id)
                    socket.emit('move', {
                        from: { i: cells_from[i].i, j: cells_from[i].j },
                        to: { i: cell_to.i, j: cell_to.j }
                    });
            render();
        }
    }
    function start_dragging(e) {
        if (!Global.dragging) {
            let cell = Grid.get_cell_from_mouse(e.clientX, e.clientY);
            if (cell != null && cell.user_id == User.id && cell.nb_troops > 1) {
                Global.cell_from = cell;
                Global.drag_from = { x: cell.x, y: cell.y };
                Global.drag_to = Camera.screen_to_canvas(e.clientX, e.clientY);
                Global.dragging = true;
            }
        }
    }
    function when_dragging(e) {
        if (Global.dragging) {
            let cell = Grid.get_cell_from_mouse(e.clientX, e.clientY);
            if (cell != null && Global.cell_from != null && cell != Global.cell_from && Grid.are_neighbours(Global.cell_from, cell)) {
                Global.drag_to = { x: cell.x, y: cell.y };
                Global.show_drag = true;
                render();
            }
            else
                Global.show_drag = false;
            render();
        }
    }
    function finish_dragging(e) {
        if (Global.dragging) {
            let cell = Grid.get_cell_from_mouse(e.clientX, e.clientY);
            if (cell != null && Global.cell_from != null)
                socket.emit('move', {
                    from: { i: Global.cell_from.i, j: Global.cell_from.j },
                    to: { i: cell.i, j: cell.j }
                });
            Global.show_drag = false;
            Global.dragging = false;
            render();
        }
    }
    function move_by_clicking(e) {
        let cell = Grid.get_cell_from_mouse(e.clientX, e.clientY);
        if (cell != null && cell != Global.cell_from) {
            if (cell.user_id == User.id) {
                if (Global.cell_from != null && Grid.are_neighbours(cell, Global.cell_from) && Global.cell_from.nb_troops > 1)
                    socket.emit('move', {
                        from: { i: Global.cell_from.i, j: Global.cell_from.j },
                        to: { i: cell.i, j: cell.j }
                    });
                else {
                    Global.cell_from = cell;
                    render();
                }
            }
            else {
                if (Global.cell_from != null && Grid.are_neighbours(cell, Global.cell_from) && Global.cell_from.nb_troops > 1)
                    socket.emit('move', {
                        from: { i: Global.cell_from.i, j: Global.cell_from.j },
                        to: { i: cell.i, j: cell.j }
                    });
                else {
                    let cells_from = Grid.get_neighbours(cell);
                    let nb_troops = -1;
                    let best_cell = null;
                    for (let i = 0; i < cells_from.length; i++)
                        if (cells_from[i].user_id == User.id && cells_from[i].nb_troops > nb_troops) {
                            nb_troops = cells_from[i].nb_troops;
                            best_cell = cells_from[i];
                        }
                    if (best_cell != null)
                        socket.emit('move', {
                            from: { i: best_cell.i, j: best_cell.j },
                            to: { i: cell.i, j: cell.j }
                        });
                }
            }
        }
    }
    window.addEventListener('dblclick', double_click);
    window.addEventListener('mousedown', e => {
        if (e.buttons == 1) {
            move_by_clicking(e);
            start_dragging(e);
        }
    });
    window.addEventListener('mousemove', when_dragging);
    window.addEventListener('mouseup', finish_dragging);
}
