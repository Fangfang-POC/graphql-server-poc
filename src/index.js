const express = require('express');
const { createServer } = require('http');
const { ApolloServerPluginDrainHttpServer } = require("apollo-server-core");
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { WebSocketServer } = require('ws');
const { useServer } = require('graphql-ws/lib/use/ws');
const cookieParser = require('cookie-parser');
const { uppercaseDirectiveTransformer } = require('./directiveTransformers');

const { ApolloServer, gql } = require('apollo-server-express');
const resolvers = require('./resolvers');
const typeDefs = gql(require('./typeDefs'));

const app = express();
const httpServer = createServer(app);

const schema = makeExecutableSchema({ typeDefs, resolvers });

const wsServer = new WebSocketServer({ server: httpServer, path: '/subscriptions' });
// Hand in the schema we just created and have the
// WebSocketServer start listening
const serverCleanup = useServer({ schema }, wsServer);

const server = new ApolloServer({
    schema: uppercaseDirectiveTransformer(schema, 'uppercase'),
    introspection: true,
    graphqlPath: '/graphql',
    plugins: [
        // Proper shutdown for the HTTP server.
        ApolloServerPluginDrainHttpServer({ httpServer }),
        // Proper shutdown for the WebSocket server.
        {
            async serverWillStart() {
                return {
                    async drainServer() {
                        await serverCleanup.dispose();
                    },
                };
            },
        },
    ]
});

const corsOptions = {
    origin: [
        "http://localhost:6060",
        "http://localhost:6068",
        "https://studio.apollographql.com"
    ],
    credentials: true,
}
app.use(cookieParser());
app.use((req, res, next) => {
    let cookie = req.cookies.myCookieName;
    if (cookie === undefined) {
        // no: set a new cookie
        let randomNumber = Math.random().toString();
        randomNumber = randomNumber.substring(2, randomNumber.length);
        const maxAge = 1000 * 60 * 10; //10 minutes
        res.cookie('myCookieName', randomNumber, { maxAge: maxAge, httpOnly: true });
        console.log('cookie created successfully');
    }
    else {
        // yes, cookie was already present 
        console.log('cookie exists', cookie);
    }
    next();
})

server.start().then(() => {
    server.applyMiddleware({
        app,
        cors: corsOptions,
        // session: sessionOptions
    });
});

const PORT = 4000;
// Now that our HTTP server is fully set up, we can listen to it.
httpServer.listen(PORT, () => {
    console.log(
        `Server is now running on http://localhost:${PORT}${server.graphqlPath}`,
    );
});




async function startApolloServer(typeDefs, resolvers, introspection = false) {
    const server = new ApolloServer({
        cors: true,
        typeDefs,
        resolvers,
        introspection,
    });
    const { url } = await server.listen(4000);
    console.log(`🚀  Server ready at ${url}`);
}
