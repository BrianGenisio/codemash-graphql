const {buildSchema} = require('graphql');

const {sessions, speakers, rooms} = require('../sources.js');
const {speakerSchema, Speaker} = require("./speaker.js");
const {sessionSchema, Session} = require("./session.js");
const {roomSchema, Room} = require("./room.js");

const rootSchema = buildSchema(`
  ${speakerSchema}
  ${sessionSchema}
  ${roomSchema}

  input PageArguments {
    first: Int
    after: String
  }

  type Query {
    sessions(page: PageArguments): [Session]!
    session(id: ID): Session

    speakers(page: PageArguments): [Speaker]!
    speaker(id: ID): Speaker

    rooms: [Room]!
    room(name: String): Room
  }
`);

function pageFilter(pageArguments, items) {
    if (!pageArguments) {
        return items;
    }

    if (pageArguments.after) {
        const itemIndex = items.findIndex(item => item.Id == pageArguments.after);
        if (itemIndex >= 0) {
            items = items.slice(itemIndex + 1);
        }
    }

    if (pageArguments.first) {
        return items.slice(0, pageArguments.first);
    }

    return items;
}

class RootQuery {
    sessions({ page }) {
        return sessions.getAll()
            .then(sessions => pageFilter(page, sessions)
                .map(session => new Session(session)))
    }

    session({ id }) {
        return sessions.get(id)
            .then(session => session && new Session(session));
    }

    speakers({ page }) {
        return speakers.getAll()
            .then(speakers => pageFilter(page, speakers)
                .map(speaker => new Speaker(speaker)))
    }

    speaker({ id }) {
        return speakers.get(id)
            .then(speaker => speaker && new Speaker(speaker));
    }

    rooms() {
        return rooms.getAll()
            .then(rooms => rooms.map(name => new Room(name)));
    }

    room({ name }) {
        return rooms.get(name)
            .then(room => room && new Room(room));
    }
}

module.exports = {
    rootSchema,
    RootQuery
}
