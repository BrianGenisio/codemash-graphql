const express = require('express');
const graphqlHTTP = require('express-graphql');
const { buildSchema } = require('graphql');

const {sessions, speakers, rooms} = require('./sources.js');

const schema = buildSchema(`
  input PageArguments {
    first: Int
    after: String
  }

  type Room {
      name: String
      sessions: [Session]!
  }

  type Speaker {
    id: ID!
    firstName: String
    lastName: String
    biography: String
    blogUrl: String
    gitHubLink: String
    gravatarUrl: String
    linkedInProfile: String
    twitterLink: String
    sessions: [Session]
  }

  type Session {
    id: ID!
    rooms: [Room]
    title: String
    abstract: String
    sessionType: String
    tags: [String]
    speakers: [Speaker]
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

class Session {
    constructor(session) {
        console.log("session", session)
        this._session = session;

        this.id = session.Id;
        this.title = session.Title;
        this.sessionType = session.SessionType;
        this.tags = session.Tags;
    }

    speakers() {
        return this._session.Speakers.map(speaker => {
            return speakers.get(speaker.Id)
                .then(speaker => new Speaker(speaker));
        });
    }

    rooms() {
        return this._session.Rooms.map(room => new Room(room));
    }
}

class Speaker {
    constructor(speaker) {
        this._speaker = speaker;

        this.id = speaker.Id;
        this.firstName = speaker.FirstName;
        this.lastName = speaker.LastName;
        this.biography = speaker.Biography;
        this.blogUrl = speaker.BlogUrl;
        this.gitHubLink = speaker.GitHubLink;
        this.gravatarUrl = speaker.GravatarUrl;
        this.linkedInProfile = speaker.LinkedInProfile;
        this.twitterLink = speaker.TwitterLink;
    }

    sessions() {
        return this._speaker.SessionIds.map(sessionId => {
            return sessions.get(sessionId)
                .then(session => new Session(session));
        });
    }
}

class Room {
    constructor(name) {
        this.name = name;
    }

    sessions() {
        return rooms.getSessions(this.name)
            .then(sessions =>
                sessions.map(session => new Session(session)));
    }
}

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
    sessions({page}) {
        return sessions.getAll()
            .then(sessions => pageFilter(page, sessions)
                    .map(session => new Session(session)))
    }

    session({id}) {
        return sessions.get(id)
            .then(session => session && new Session(session));
    }

    speakers({page}) {
        return speakers.getAll()
            .then(speakers => pageFilter(page, speakers)
                    .map(speaker => new Speaker(speaker)))
    }

    speaker({id}) {
        return speakers.get(id)
            .then(speaker => speaker && new Speaker(speaker));
    }

    rooms() {
        return rooms.getAll()
            .then(rooms => rooms.map(name => new Room(name)));
    }

    room({name}) {
        return rooms.get(name)
            .then(room => room && new Room(room));
    }
}

const app = express();
app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: new RootQuery(),
    graphiql: true,
}));

app.listen(process.env.PORT ||4000,
    () => console.log('Now browse to localhost:4000/graphql'));
