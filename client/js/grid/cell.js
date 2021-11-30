import { Global } from '../properties.js';
import * as Color from '../utils/color.js';
import { User } from '../user/user.js';
export class Cell {
    constructor(i, j, x, y, color, user_id, nb_troops) {
        this.i = i;
        this.j = j;
        this.x = x;
        this.y = y;
        this.color = color;
        this.user_id = user_id;
        this.nb_troops = nb_troops;
    }
    draw(context) {
        context.beginPath();
        for (let i = 0; i < 6; i++)
            context.lineTo(this.x + Math.cos(Global.hexagon_angle * i), this.y + Math.sin(Global.hexagon_angle * i));
        context.closePath();
        context.fillStyle = this.color;
        if (this == Global.cell_from)
            context.fillStyle = Color.change_color(this.color, Global.dark_color_limit, 0.2);
        context.fill();
        context.strokeStyle = Global.border_color;
        context.lineWidth = 0.1;
        context.lineCap = 'round';
        if (this.user_id != '')
            context.strokeStyle = Color.change_color(this.color, Global.dark_color_limit, 0.2);
        context.stroke();
        if (this.nb_troops > 0) {
            context.font = '0.75px Roboto_bold';
            if (User.joined && this.user_id == User.id)
                context.fillStyle = Color.is_color_dark(this.color, Global.dark_color_limit) ? 'white' : 'black';
            else
                context.fillStyle = Color.change_color(this.color, Global.dark_color_limit, 0.4);
            context.textAlign = 'center';
            context.fillText(this.nb_troops.toString(), this.x, this.y + 0.26);
        }
    }
}
