const express = require('express');
const graphqlHTTP = require('express-graphql');
const { buildSchema } = require('graphql');

const {sessions, speakers} = require('./sources.js');

const schema = buildSchema(`
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
    rooms: [String]
    title: String
    abstract: String
    sessionType: String
    tags: [String]
    speakers: [Speaker]
  }

  type Query {
    sessions: [Session]!
    speakers: [Speaker]!
  }
`);

class Session {
    constructor(session) {
        this._session = session;
    }

    id() { return this._session.Id; }
    title() { return this._session.Title; }
    abstract() { return this._session.Abstract; }
    sessionType() { return this._session.SessionType;}
    tags() { return this._session.Tags; }
    rooms() { return this._session.Rooms; }

    speakers() {
        return this._session.Speakers.map(speaker => {
            return speakers.get(speaker.Id)
                .then(speaker => new Speaker(speaker));
        });
    }
}

class Speaker {
    constructor(speaker) {
        this._speaker = speaker;
    }

    id() { return this._speaker.Id; }
    firstName() { return this._speaker.FirstName; }
    lastName() { return this._speaker.LastName; }
    biography() { return this._speaker.Biography; }
    blogUrl() { return this._speaker.BlogUrl; }
    gitHubLink() { return this._speaker.GitHubLink; }
    gravatarUrl() { return this._speaker.GravatarUrl; }
    linkedInProfile() { return this._speaker.LinkedInProfile; }
    twitterLink() { return this._speaker.TwitterLink; }

    sessions() {
        console.log(this._speaker)
        return this._speaker.SessionIds.map(sessionId => {
            return sessions.get(sessionId)
                .then(session => new Session(session));
        });
    }
}

const root = {
    sessions: () => sessions.getAll()
        .then(sessions => sessions.map(session => new Session(session))),

    speakers: () => speakers.getAll()
        .then(speakers => speakers.map(speaker => new Speaker(speaker))),
};

const app = express();
app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
}));
app.listen(4000, () => console.log('Now browse to localhost:4000/graphql'));
