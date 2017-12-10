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

        this.fetch();
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

const sessionsRepo = new Repo("sessionsdata");
const speakersRepo = new Repo("speakersdata");

class RoomsRepo {
    getAll() {
        return sessionsRepo.getAll()
            .then(sessions => {
                const roomMap = sessions.reduce((accum, session) => {
                    const rooms = session.Rooms || [];
                    rooms.forEach(room => accum[room] = true);
                    return accum;
                }, {});

                return Object.keys(roomMap);
            });
    }

    get(name) {
        return this.getAll().then(rooms => {
            return rooms.find(room => room === name);
        });
    }

    getSessions(roomName) {
        return sessionsRepo.getAll()
            .then(sessions => {
                return sessions.filter(session => {
                    const rooms = session.Rooms || [];
                    return rooms.includes(roomName);
                });
            })
    }
}

const roomsRepo = new RoomsRepo();

module.exports = {
    sessions: sessionsRepo,
    speakers: speakersRepo,
    rooms: roomsRepo,
};
