import { Global } from '../properties.js';
import * as Grid from '../grid/grid.js';
import { Camera } from './camera.js';
export function render() {
    let canvas = document.getElementById('canvas');
    let context = canvas.getContext('2d');
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = Global.background_color;
    context.fillRect(0, 0, canvas.width, canvas.height);
    Camera.apply(context);
    Grid.draw_grid(context);
    if (Global.show_drag) {
        context.beginPath();
        context.lineTo(Global.drag_from.x, Global.drag_from.y);
        context.lineTo(Global.drag_to.x, Global.drag_to.y);
        context.strokeStyle = 'black';
        context.lineWidth = 0.1;
        context.lineCap = 'round';
        context.stroke();
    }
}
