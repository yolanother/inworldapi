const express = require('express');
const router = express.Router();

const inworld = require ('@inworld/nodejs-sdk')
const status = inworld.status;
const InworldClient = inworld.InworldClient;
const InworldPacket = inworld.InworldPacket;

require ("../inworldsession");
const {parseRequest, log, handleError} = require("../util");

/* GET users listing. */
router.get('/', function(req, res, next) {
    try {
        res.setHeader('Content-Type', 'application/json; charset=UTF-8');
        res.setHeader('Transfer-Encoding', 'chunked');

        res.end();
    } catch (e) {
        handleError(res, e);
    }
});

module.exports = router;