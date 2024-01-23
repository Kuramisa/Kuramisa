export default `#graphql
scalar Client
scalar Staff

scalar Guild
scalar Role
scalar Emoji

scalar Channel
scalar Message

scalar User
scalar Member

scalar Object

scalar Ticket

scalar Warn
scalar Report

scalar Data

type Query {
    login(code: String!): String!
    
    clientUser: User!


    guild(guildId: String!, fetchDb: Boolean): Guild!
    guilds(fetchDb: Boolean, page: Int, perPage: Int): Data!

    role(guildId: String!, roleId: String!): Role!
    roles(guildId: String!): [Role]!

    channel(guildId: String!, channelId: String!): Channel!
    channels(guildId: String!): [Channel]!

    message(
        guildId: String!
        channelId: String!
        messageId: String!
    ): Message!
    messages(guildId: String!, channelId: String!, page: Int, perPage: Int): Data!

    emoji(guildId: String!, emojiId: String!): Emoji!
    emojis(guildId: String!): [Emoji]!

    tickets(guildId: String!, page: Int, perPage: Int): Data!
    ticket(guildId: String!, ticketId: String!): Ticket!
    ticketTranscript(guildId: String!, ticketId: String!): Ticket
    memberTickets(guildId: String!, memberId: String!): [Ticket]!

    user(userId: String!, fetchDb: Boolean): User!
    userCard(userId: String!): User!
    users(fetchDb: Boolean, page: Int, perPage: Int): Data!
    userGuilds(auth: String!, fetchDb: Boolean, page: Int, perPage: Int): Data!

    member(guildId: String!, memberId: String!, fetchDb: Boolean): Member! @rateLimit(limit: 5, duration: 60)
    members(guildId: String!, fetchDb: Boolean, page: Int, perPage: Int): Data!

    warns(guildId: String!, userId: String!, page: Int, perPage: Int): Data!
    reports(guildId: String!, userId: String!, page: Int, perPage: Int): Data!
    
    weapons: Data!
    weapon(weaponUuid: String!, withSkins: Boolean): Data!


    skins(weaponUuid: String!, sortAlphabetically: Boolean): Data!

    store(auth: String!): Data!
}

type Mutation {
    authUser(auth: String!): User!
    warnUser(guildId: String!, userId: String!, reason: String): Warn!
    reportUser(guildId: String!, userId: String!, reason: String): Report!
}
`;
