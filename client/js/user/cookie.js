// Create cookie with user's name and color
create_cookie = (user) => {
    let date = new Date();
    date.setTime(date.getTime() + 24*60*60*1000);
    let value = `name=${ user.name },color=${ user.color }`;
    let expires = "; expires=" + date.toUTCString();
    document.cookie = "user=" + value + expires + "; path=/; secure;";
}

// Get cookie data
get_cookie = () => {
    let s = document.cookie;

    let name = s.substr(0, s.lastIndexOf(",color")).substr(s.indexOf("name=") + 5);
    let color = s.substr(s.lastIndexOf("color=") + 6);
    
    return {
        name: name,
        color: color
    };
}

// Erase user's data
erase_cookie = () => {   
    document.cookie = 'user=; path=/; expires=Thu, 01 Jan 2000 00:00:01 GMT; secure;';
}