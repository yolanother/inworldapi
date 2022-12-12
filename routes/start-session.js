const express = require('express');
const router = express.Router();

const inworld = require ('@inworld/nodejs-sdk')
const status = inworld.status;
const InworldClient = inworld.InworldClient;
const InworldPacket = inworld.InworldPacket;

const {startSession} = require ("../inworldsession");
const {log, parseRequest, handleError, handleRequest} = require("../util")

async function send(req, res) {
    var client = await startSession(req);
    var sessionInfo = {sessionId: client.session};
    log('Session started: ', sessionInfo);
    res.end(JSON.stringify(sessionInfo));
}

async function onRequest(req, res, next) {
    await handleRequest(req, res, send);
}

/* GET users listing. */
router.get('/', onRequest);
router.options('/', onRequest);
router.post('/', onRequest);

module.exports = router;