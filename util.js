const url = require('url');

function log(...message) {
    console.log(`[${new Date().toString()}] `, ...message);
}

function parseRequest(req) {
    if (!req.headers.authorization) throw 'Unauthorized';
    const authTypeSplit = req.headers.authorization.split(' ');
    if (authTypeSplit[0] !== 'Bearer') throw 'Must use Bearer token';
    const sp = authTypeSplit[1].split(':');

    const query = url.parse(req.url, true).query;
    return {
        access: {key: sp[0], secret: sp[1], clientToken: sp[2]},
        clientId: query.clientId,
        session: query.sessionId,
        scene: query.scene,
        query: query};
}

function handleError(res, e) {
    log(e);
    res.statusCode = 400;
    switch(e) {
        case 'Unauthorized':
            res.statusCode = 403;
    }
    res.end(JSON.stringify({error: e.toString()}));
}


function createUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

exports.log = log;
exports.parseRequest = parseRequest;
exports.handleError = handleError;
exports.createUUID = createUUID;