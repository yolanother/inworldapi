const express = require('express');
const router = express.Router();

const inworld = require ('@inworld/nodejs-sdk')
const status = inworld.status;
const InworldClient = inworld.InworldClient;
const InworldPacket = inworld.InworldPacket;
const url = require('url');
const { request } = require('http');

function getAccess(req) {
    if (!req.headers.authorization) throw 'Unauthorized';
    const authTypeSplit = req.headers.authorization.split(' ');
    if (authTypeSplit[0] !== 'Bearer') throw 'Must use Bearer token';
    const sp = authTypeSplit[1].split(':');

    return {key: sp[0], secret: sp[1]};
}

async function send(req, res) {
    var access = getAccess(req);
    
    const query = url.parse(req.url, true).query;
    try {
        const client = new InworldClient()
            // Get key and secret from the integrations page.
            .setApiKey({
                key: access.key,
                secret: access.secret,
            })
            // Setup a user name.
            // It allows character to call you by name.
            .setUser({fullName: query.user})
            // Setup required capabilities.
            // In this case you can receive character emotions.
            .setConfiguration({
                capabilities: {audio: false, emotions: true},
            })
            // Use a full character name.
            // It should be like workspaces/{WORKSPACE_NAME}/characters/{CHARACTER_NAME}.
            // Or like workspaces/{WORKSPACE_NAME}/scenes/{SCENE_NAME}.
            .setScene(query.scene)
            // Attach handlers
            .setOnError((err) => {
                switch(err.code) {
                    case status.ABORTED:
                        break;
                    case status.CANCELLED:
                        break;
                    default:
                        console.error("Error: ", err);
                        break;
                }
            })
            .setOnMessage((msg) => {
                if(msg.text) {
                    res.write(JSON.stringify(msg) + "\r\n");
                    console.log(msg.text);
                }

                if(msg.isInteractionEnd()) {
                    res.end(JSON.stringify(msg));
                    connection.close();
                }
            });;

        // Finish connection configuration.
        const connection = client.build();
        await connection.sendText(query.m);
    } catch (e) {
        res.statusCode = 400;
        res.end(JSON.stringify({error: e.toString()}));
    }
}

/* GET users listing. */
router.get('/', function(req, res, next) {
    console.log("Headers: " + JSON.stringify(req.headers));
    try {
        send(req, res);
    } catch (e) {
        res.statusCode = 400;
        res.end({error: e.toString()})
    }
});

module.exports = router;