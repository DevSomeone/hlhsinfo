function makeAuthCode(sessionID, verifyToken) {
    var auth = JSON.stringify({
        cookie: Buffer.from(sessionID).toString('hex'),
        verifyToken: Buffer.from(verifyToken).toString('base64')
    });
    return { authToken: Buffer.from(auth).toString('base64') }
}

function decodeAuthCode(authCode) {
    try {
        var auth = JSON.parse(Buffer.from(authCode, 'base64').toString('utf8'));
    } catch (e) {
        return false;
    }
    return {
        sessionID: Buffer.from(auth.cookie, "hex").toString('utf8'),
        verifyToken: Buffer.from(auth.verifyToken, "base64").toString("utf8")
    }
}

function decodeAuthorization(authCode) {
    var auth = authCode.replace("Bearer ", "");
    return decodeAuthCode(auth);
}

function isNotLogin(document) {
    const { JSDOM } = require('jsdom');
    const dom = new JSDOM(document);
    var d = dom.window.document.querySelector("body>div");
    if (!d || d.innerHTML.indexOf("未登入") === -1) return false;
    return true;
}

module.exports = {
    makeAuthCode,
    decodeAuthCode,
    decodeAuthorization,
    isNotLogin
}