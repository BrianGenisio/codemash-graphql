const express = require('express');
const graphqlHTTP = require('express-graphql');
const { buildSchema } = require('graphql');

const {sessions, speakers} = require('./sources.js');

const schema = buildSchema(`
  input PageArguments {
    first: Int
    after: String
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
    rooms: [String]
    title: String
    abstract: String
    sessionType: String
    tags: [String]
    speakers: [Speaker]
  }

  type Query {
    sessions(page: PageArguments): [Session]!
    speakers(page: PageArguments): [Speaker]!
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

    speakers({page}) {
        return speakers.getAll()
            .then(speakers => pageFilter(page, speakers)
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
