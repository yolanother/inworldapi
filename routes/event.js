const express = require('express');
const router = express.Router();

const inworld = require ('@inworld/nodejs-sdk')
const status = inworld.status;
const InworldClient = inworld.InworldClient;
const InworldPacket = inworld.InworldPacket;
const url = require('url');
const { request } = require('http');
const {parseRequest, log, handleRequest} = require("../util");
const {startSession} = require("../inworldsession");

const messageSessions = {};

async function send(req, res) {
    const request = parseRequest(req);
    const access = request.access;
    const query = request.query;

    log("Received request for: " + query.m);

    const client = await startSession(req);
    client.setMessageCallback((msg) => {
        msg.sessionId = client.session;
        if(msg.text) {
            res.write(JSON.stringify(msg) + "\r\n");
            log(msg.text);
        }

        if(msg.isInteractionEnd()) {
            res.end(JSON.stringify(msg));
            client.connection.close();
            if(query.endSession) client.endSession();
        }
    });
    await client.connection.sendCustom(query.e);
}

async function onRequest(req, res, next) {
    await handleRequest(req, res, send);
}

/* GET users listing. */
router.get('/', onRequest);
router.options('/', onRequest);
router.post('/', onRequest);

module.exports = router;