const fetch = require("node-fetch");
const camelcaseKeys = require('camelcase-keys');

const camelcaseKeysDeep = (x) => camelcaseKeys(x, {deep: true});

const baseURL = "https://cmprod-speakers.azurewebsites.net/api";

let allSessions = undefined;
let allSpeakers = undefined;

const sessionsRepo = {
    fetchSessions() {
        if (!allSessions) {
            console.log("Fetching Session Data.");

            allSessions = fetch(`${baseURL}/sessionsdata`)
                .then(r => r.json());
        }

        return allSessions;
    },

    get(id) {
        console.log("Get session", id)
        return this.fetchSessions()
            .then(session => session.find(s => s.Id == id));
    },

    getAll() {
        return this.fetchSessions();
    }
}

const speakersRepo = {
    fetchSpeakers() {
        if (!allSpeakers) {
            console.log("Fetching Speaker Data.");

            allSpeakers = fetch(`${baseURL}/speakersdata`)
                .then(r => r.json());
        }

        return allSpeakers;
    },

    get(id) {
        return this.fetchSpeakers()
            .then(speakers => speakers.find(s => s.Id === id));
    },

    getAll() {
        return this.fetchSpeakers();
    }
}

module.exports = {
    sessions: sessionsRepo,
    speakers: speakersRepo,
};
