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

        this.id = session.Id;
        this.title = session.Title;
        this.sessionType = session.SessionType;
        this.tags = session.Tags;
        this.rooms = session.Rooms;
    }

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

class RootQuery {
    sessions() {
        return sessions.getAll()
            .then(sessions => sessions
                .map(session => new Session(session)))
    }

    speakers() {
        return speakers.getAll()
            .then(speakers => speakers
                .map(speaker => new Speaker(speaker)))
    }
}

const app = express();
app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: new RootQuery(),
    graphiql: true,
}));
app.listen(4000, () => console.log('Now browse to localhost:4000/graphql'));
