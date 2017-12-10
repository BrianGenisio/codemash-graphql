const fetch = require("node-fetch");
const camelcaseKeys = require('camelcase-keys');

const camelcaseKeysDeep = (x) => camelcaseKeys(x, {deep: true});

const baseURL = "https://cmprod-speakers.azurewebsites.net/api";

class Repo {
    constructor(endpoint) {
        this._endpoint = endpoint;

        setInterval(() => {
            // update the data every hour
            this._dataPromise = undefined;
            this.fetch();
        }, 60 * 60 * 1000);
    }

    fetch(endpoint) {
        if (!this._dataPromise) {
            console.log("Fetching data for", this._endpoint);
            this._dataPromise = fetch(`${baseURL}/${this._endpoint}`)
                .then(r => r.json());
        }

        return this._dataPromise;
    }

    get(id) {
        return this.fetch().then(data => data.find(d => d.Id == id));
    }

    getAll() {
        return this.fetch();
    }
}

module.exports = {
    sessions: new Repo("sessionsdata"),
    speakers: new Repo("speakersdata"),
};
