const url = require('url');

function log(...message) {
    console.log(`[${new Date().toString()}] `, ...message);
}

function parseRequest(req) {
    const query = url.parse(req.url, true).query;
    let auth;
    if(req.body && req.body.auth) {
        auth = req.body.auth.split(':');
        if(auth) console.log("Auth via post body");
    }

    if(!auth) {
        if (query['auth']) {
            auth = query['auth'].split(':');
        } else {
            if (!req.headers.authorization) throw 'Unauthorized';
            const authTypeSplit = req.headers.authorization.split(' ');
            if (authTypeSplit[0] !== 'Bearer') throw 'Must use Bearer token';
            auth = authTypeSplit[1].split(':');
        }
    }

    return {
        access: {key: auth[0], secret: auth[1], clientToken: auth[2]},
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

async function handleRequest(req, res, send) {
    try {
        res.setHeader('Content-Type', 'application/json; charset=UTF-8');
        res.setHeader('Transfer-Encoding', 'chunked');
        await send(req, res);
    } catch (e) {
        handleError(res, e)
    }
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
exports.handleRequest = handleRequest;
exports.createUUID = createUUID;