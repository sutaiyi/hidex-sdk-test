const CookieStorage = {
    set: async (key, value, expiresInDays, path = "/", secure = false) => {
        let cookieString = `${encodeURIComponent(key)}=${encodeURIComponent(value)}; path=${path};`;
        if (expiresInDays) {
            const date = new Date();
            date.setTime(date.getTime() + Math.floor(expiresInDays * 24 * 60 * 60 * 1000));
            cookieString += ` expires=${date.toUTCString()};`;
        }
        if (secure && global.location.protocol === "https:") {
            cookieString += " Secure;";
        }
        global.document.cookie = cookieString;
        return true;
    },
    get: async (key) => {
        const cookies = global.document.cookie.split("; ");
        for (const cookie of cookies) {
            const [cookieKey, cookieValue] = cookie.split("=");
            if (decodeURIComponent(cookieKey) === key) {
                return decodeURIComponent(cookieValue);
            }
        }
        return null;
    },
    remove: async (key, path = "/", secure = false) => {
        let cookieString = `${encodeURIComponent(key)}=; path=${path};`;
        if (secure && global.location.protocol === "https:") {
            cookieString += " Secure;";
        }
        global.document.cookie = cookieString;
        return true;
    },
};
export default CookieStorage;
