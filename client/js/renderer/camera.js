import { Global } from '../properties.js';
import { User } from '../user/user.js';
import { render } from '../renderer/renderer.js';
export class Camera {
    static init() {
        Camera.x = -(Global.grid_boundaries.width / 2.) * Camera.zoom + window.innerWidth / 2.;
        Camera.y = -(Global.grid_boundaries.height / 2.) * Camera.zoom + window.innerHeight / 2.;
        let left = false;
        let right = false;
        let up = false;
        let down = false;
        const camera_speed = 5.;
        function on_move_mouse(e) {
            if (User.joined && !Global.dragging && e.buttons == 4) {
                Camera.x += e.movementX;
                Camera.y += e.movementY;
                render();
            }
            Camera.mouse_pos.x = e.clientX;
            Camera.mouse_pos.y = e.clientY;
        }
        function on_key_down(e) {
            if (e.key == 'ArrowLeft' || e.key == 'q')
                left = true;
            if (e.key == 'ArrowRight' || e.key == 'd')
                right = true;
            if (e.key == 'ArrowUp' || e.key == 'z')
                up = true;
            if (e.key == 'ArrowDown' || e.key == 's')
                down = true;
        }
        function on_key_up(e) {
            if (e.key == 'ArrowLeft' || e.key == 'q')
                left = false;
            if (e.key == 'ArrowRight' || e.key == 'd')
                right = false;
            if (e.key == 'ArrowUp' || e.key == 'z')
                up = false;
            if (e.key == 'ArrowDown' || e.key == 's')
                down = false;
        }
        function update() {
            if (User.joined && !Global.dragging) {
                if (left)
                    Camera.x += camera_speed;
                if (right)
                    Camera.x -= camera_speed;
                if (up)
                    Camera.y += camera_speed;
                if (down)
                    Camera.y -= camera_speed;
                if (left || right || up || down)
                    render();
            }
            requestAnimationFrame(update);
        }
        function on_zoom(e) {
            if (User.joined && !Global.dragging) {
                let temp = Camera.screen_to_canvas(Camera.mouse_pos.x, Camera.mouse_pos.y);
                Camera.zoom *= 1 - e.deltaY / 5000.;
                let pos = Camera.screen_to_canvas(Camera.mouse_pos.x, Camera.mouse_pos.y);
                Camera.x += (pos.x - temp.x) * Camera.zoom;
                Camera.y += (pos.y - temp.y) * Camera.zoom;
                render();
            }
        }
        window.addEventListener('mousemove', on_move_mouse);
        window.addEventListener('keydown', on_key_down);
        window.addEventListener('keyup', on_key_up);
        window.addEventListener('mousewheel', on_zoom);
        requestAnimationFrame(update);
        render();
    }
    static move(x, y) {
        this.x = -x * Camera.zoom + window.innerWidth / 2.;
        this.y = -y * Camera.zoom + window.innerHeight / 2.;
    }
    static apply(context) {
        context.setTransform(this.zoom, 0, 0, this.zoom, this.x, this.y);
    }
    static screen_to_canvas(x, y) {
        let pos = { x: 0, y: 0 };
        pos.x = (x - this.x) / this.zoom;
        pos.y = (y - this.y) / this.zoom;
        return pos;
    }
}
Camera.x = 0;
Camera.y = 0;
Camera.zoom = 50.;
Camera.mouse_pos = { x: 0, y: 0 };
