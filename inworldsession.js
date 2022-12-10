const {parseRequest, log, createUUID, handleError} = require('./util');

const inworld = require ('@inworld/nodejs-sdk')
const status = inworld.status;
const InworldClient = inworld.InworldClient;
const InworldPacket = inworld.InworldPacket;

global.sessions = {}

class InworldSession {
    constructor(key, secret, scene) {
        this.access = {key: key, secret: secret};
        this.scene = scene;
        this.session = undefined;
        this.client = undefined;
        this.connection = undefined;
        this.onMessage = undefined;
        this.onAborted = undefined;
        this.onCancelled = undefined;
        this.onError = undefined;
    }

    setMessageCallback = function(messageCallback) {
        this.onMessage = messageCallback;
    }

    setErrorCallback = function(errorCallback) {
        this.onError = errorCallback;
    }

    setAbortedCallback = function(abortedCallback) {
        this.onAborted = abortedCallback;
    }

    setCancelledCallback = function(cancelledCallback) {
        this.onCancelled = cancelledCallback;
    }

    handleMessage = function(msg) {
        if(this.onMessage !== undefined) this.onMessage(msg);
    }

    handleError = function(err) {
        switch(err.code) {
            case status.ABORTED:
                if(this.onAborted) this.onAborted();
                break;
            case status.CANCELLED:
                if(this.onCancelled) this.onCancelled();
                break;
            default:
                if(this.onError) this.onError();
                console.error("Error: ", err);
                break;
        }
    }

    startSession = async function(user, messageCallback=undefined, errorCallback=undefined, abortedCallback=undefined, cancelledCallback=undefined) {
        const self = this;
        self.setMessageCallback(messageCallback);
        self.setErrorCallback(errorCallback);
        self.setAbortedCallback(abortedCallback);
        self.setCancelledCallback(cancelledCallback);
        if(this.client) return;
        const client = this.client = new InworldClient()
            // Get key and secret from the integrations page.
            .setApiKey({
                key: this.access.key,
                secret: this.access.secret,
            })
            // Setup a user name.
            // It allows character to call you by name.
            .setUser({fullName: user})
            // Setup required capabilities.
            // In this case you can receive character emotions.
            .setConfiguration({
                capabilities: {audio: false, emotions: true},
            })
            // Use a full character name.
            // It should be like workspaces/{WORKSPACE_NAME}/characters/{CHARACTER_NAME}.
            // Or like workspaces/{WORKSPACE_NAME}/scenes/{SCENE_NAME}.
            .setScene(this.scene)
            // Attach handlers
            .setOnError((error) => self.handleError(error))
            .setOnMessage((msg) => self.handleMessage(msg));
        const token = await client.generateSessionToken();
        this.connection = client.build();
        const session = token.getSessionId();
        log("Created session: " + session, session);
        this.session = session;
        return session;
    }

    stopSession = function() {
        this.connection.close();
    }
}
async function startSession(req) {
    var request = parseRequest(req);
    var session = undefined;
    if(request.session) {
        session = global.sessions[request.session];
        log("Session resumed.")
    }

    if(!session) {
        session = new InworldSession(request.access.key, request.access.secret, request.scene);
        await session.startSession(request.user);
        global.sessions[session.session] = session;
    }

    return session;
}

exports.startSession = startSession;
