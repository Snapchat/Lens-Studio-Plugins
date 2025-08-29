export function getRandomString() {
    return (Math.random() + 1).toString(36).substring(7);
};

export function safeFilename(str) {
    return str.replace(/\.$/, 'ꓸ')
        .replace('?', '❓')
        .replace('\\', ' ⃥')
        .replace('/', '⟋')
        .replace('|', '│')
        .replace(':', '꞉')
        .replace('<', 'ᐸ')
        .replace('>', 'ᐳ')
        .replace('>', 'ᐳ')
        .replace('"', 'ᐦ')
        .replace('*', '꘎')
        .substring(0, 40);
};

export function formatDate(inputDate, format) {
    if (!inputDate) return '';

    const padZero = (value) => (value < 10 ? `0${value}` : `${value}`);
    const parts = {
        yyyy: inputDate.getFullYear(),
        MM: padZero(inputDate.getMonth() + 1),
        dd: padZero(inputDate.getDate()),
        HH: padZero(inputDate.getHours()),
        hh: padZero(inputDate.getHours() > 12 ? inputDate.getHours() - 12 : inputDate.getHours()),
        mm: padZero(inputDate.getMinutes()),
        ss: padZero(inputDate.getSeconds()),
        tt: inputDate.getHours() < 12 ? 'AM' : 'PM'
    };

    return format.replace(/yyyy|MM|dd|HH|hh|mm|ss|tt/g, (match) => parts[match]);
}
