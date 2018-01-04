const {speakers} = require("../sources.js");

const sessionSchema = `
type Session {
    id: ID!
    rooms: [Room]
    title: String
    abstract: String
    sessionType: String
    tags: [String]
    sessionStartTime: String
    sessionEndTime: String
    speakers: [Speaker]
  }
`;

class Session {
    constructor(session) {
        this._session = session;

        this.id = session.Id;
        this.abstract = session.Abstract;
        this.title = session.Title;
        this.sessionType = session.SessionType;
        this.tags = session.Tags;
        this.sessionStartTime = session.SessionStartTime;
        this.sessionEndTime = session.SessionEndTime;
    }

    speakers() {
        const {Speaker} = require("./speaker.js");

        return this._session.Speakers.map(speaker => {
            return speakers.get(speaker.Id)
                .then(speaker => new Speaker(speaker));
        });
    }

    rooms() {
        const {Room} = require("./room.js");

        const rooms = this._session.Rooms || [];
        return rooms.map(room => new Room(room));
    }
}

module.exports = {
    sessionSchema,
    Session,
};
