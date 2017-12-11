const {sessions} = require("../sources.js");

const speakerSchema = `
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
`;

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
        const {Session} = require("./session.js");

        return this._speaker.SessionIds.map(sessionId => {
            return sessions.get(sessionId)
                .then(session => new Session(session));
        });
    }
}

module.exports = {
    speakerSchema,
    Speaker
};
