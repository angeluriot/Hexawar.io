export class User {
    static get_object() {
        return {
            id: User.id,
            nickname: User.nickname,
            color: User.color
        };
    }
}
User.id = '';
User.nickname = '';
User.color = '';
User.joined = false;
