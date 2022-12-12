const express = require('express');
const router = express.Router();

const {endSession} =require ("../inworldsession");
const {handleRequest} = require("../util");

async function send(req, res) {
    await endSession(req);
    res.end();
}

async function onRequest(req, res, next) {
    await handleRequest(req, res, send);
}

/* GET users listing. */
router.get('/', onRequest);
router.options('/', onRequest);
router.post('/', onRequest);

module.exports = router;