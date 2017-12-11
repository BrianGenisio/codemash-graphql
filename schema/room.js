const {rooms} = require("../sources.js");

const roomSchema = `
type Room {
    name: String
    sessions: [Session]!
}
`;

class Room {
    constructor(name) {
        this.name = name;
    }

    sessions() {
        const {Session} = require("./session.js");

        return rooms.getSessions(this.name)
            .then(sessions =>
                sessions.map(session => new Session(session)));
    }
}

module.exports = {
    roomSchema,
    Room
};
