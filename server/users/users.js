export class User {
    constructor(id, nickname, color, size) {
        this.id = id;
        this.nickname = nickname;
        this.color = color;
        this.size = size;
    }
    static user_join(user) {
        User.list.push(user);
    }
    static get_user(id) {
        let user = User.list.find(user => user.id == id);
        if (user == undefined)
            return null;
        return user;
    }
    static user_leave(id) {
        const index = User.list.findIndex(user => user.id == id);
        if (index != -1)
            return User.list.splice(index, 1)[0];
        else
            return null;
    }
}
User.list = [];
