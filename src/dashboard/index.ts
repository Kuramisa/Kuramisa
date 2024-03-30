import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { rateLimitDirective } from "graphql-rate-limit-directive";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";

import express from "express";
import helmet from "helmet";
import http from "http";
import cors, { type CorsRequest } from "cors";
import bodyParser from "body-parser";

import Auth from "./Auth";

import resolvers from "./gql/resolvers";
import typeDefs from "./gql/typeDefs";
import { container } from "@sapphire/framework";

const app = express();
app.use(helmet());

const httpServer = http.createServer(app);

const { rateLimitDirectiveTypeDefs, rateLimitDirectiveTransformer } =
    rateLimitDirective();

let schema = makeExecutableSchema({
    typeDefs: [rateLimitDirectiveTypeDefs, typeDefs],
    resolvers
});

schema = rateLimitDirectiveTransformer(schema);

export default class Dashboard extends ApolloServer {
    readonly auth: Auth;

    constructor() {
        super({
            schema,
            csrfPrevention: true,
            plugins: [ApolloServerPluginDrainHttpServer({ httpServer })]
        });

        this.auth = new Auth();
    }

    async init() {
        await this.start();

        app.use(
            "/",
            cors<CorsRequest>({
                origin: ["https://kuramisa.com", "http://localhost:5173"],
                credentials: true
            }),
            bodyParser.json(),
            expressMiddleware(this, {
                context: async ({ req }) => ({
                    req,
                    server: this
                })
            })
        );

        httpServer.listen({ port: process.env.PORT });

        container.logger.info(`Server ready at port: ${process.env.PORT}`);
    }
}
