const express = require('express');
const router = express.Router();

const inworld = require ('@inworld/nodejs-sdk')
const status = inworld.status;
const InworldClient = inworld.InworldClient;
const InworldPacket = inworld.InworldPacket;

const {startSession} = require ("../inworldsession");
const {log, parseRequest, handleError} = require("../util")

/* GET users listing. */
router.get('/', async function(req, res, next) {
    try {
        res.setHeader('Content-Type', 'application/json; charset=UTF-8');

        var client = await startSession(req);
        var sessionInfo = {sessionId: client.session};
        log('Session started: ', sessionInfo);
        res.end(JSON.stringify(sessionInfo));
    } catch (e) {
        handleError(res, e);
    }
});

module.exports = router;