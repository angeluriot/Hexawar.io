import { User } from '../user/user.js';
export function load_cookie_data(name_input, color_picker, color_div) {
    let cookie = get_cookie();
    if (cookie.nickname != "") {
        name_input.value = cookie.nickname;
        color_picker.value = cookie.color;
        color_div.style.backgroundColor = cookie.color;
    }
}
export function create_cookie() {
    let date = new Date(2032, 1, 1);
    let value = `nickname=${User.nickname},color=${User.color}`;
    let expires = "; expires=" + date.toUTCString();
    document.cookie = "user=" + value + expires + "; path=/;";
}
export function get_cookie() {
    let s = document.cookie;
    let nickname = s.substr(0, s.lastIndexOf(",color")).substr(s.indexOf("nickname=") + 9);
    let color = s.substr(s.lastIndexOf("color=") + 6);
    return {
        nickname: nickname,
        color: color
    };
}
export function erase_cookie() {
    document.cookie = 'user=; path=/; expires=Thu, 01 Jan 2000 00:00:01 GMT;';
}
