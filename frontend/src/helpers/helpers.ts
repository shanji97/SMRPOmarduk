export function parseJwt (token: string) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

export function parseDate(dateString: string) {
    const splitted = dateString.split('T');
    const date = splitted[0].replaceAll('-', '.');
    const time = splitted[1].split('.');
    
    //const hour = time[0].charAt(1);
    //const timeWithAddedHour = time[0].replace(hour, `${Number(hour)+1}`);

    return `${date}, ${time[0]}`;
}
