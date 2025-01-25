export function formatDuration(dur) {
    let str = '', d = Math.round(dur);
    if (d >= 60 * 60) {
        str += (Math.floor(d / 3600) + ':');
        d = d % 60;
    }
    if (d >= 60) {
        if (Math.floor(d / 60) < 10)
            str += '0';
        str += (Math.floor(d / 60) + ':');
        d = d % 60;
    }
    if (Math.floor(d) < 10)
        str += '0';
    str += (Math.floor(d).toString());

    if (str.length < 3) {
        str = '00:' + str;
    }

    return str;
}