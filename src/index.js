var https = require('https');
var express = require('express');
var fs = require('fs');
var path = require('path');
var { ApolloServerPluginDrainHttpServer } = require("apollo-server-core");
var { makeExecutableSchema } = require('@graphql-tools/schema');
var { WebSocketServer } = require('ws');
var { useServer } = require('graphql-ws/lib/use/ws');
var cookieParser = require('cookie-parser');
var { uppercaseDirectiveTransformer } = require('./directiveTransformers');

var { ApolloServer, gql } = require('apollo-server-express');
var resolvers = require('./resolvers');
var typeDefs = gql(require('./typeDefs'));

var app = express();
var httpServer = https.createServer({
    key: fs.readFileSync(path.resolve('sslcert/key.pem')),
    cert: fs.readFileSync(path.resolve('sslcert/cert.pem')),
}, app);

var schema = makeExecutableSchema({ typeDefs, resolvers });

var wsServer = new WebSocketServer({ server: httpServer, path: '/subscriptions' });
// Hand in the schema we just created and have the
// WebSocketServer start listening
var serverCleanup = useServer({ schema }, wsServer);

var server = new ApolloServer({
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

var corsOptions = {
    origin: [
        "https://127.0.0.1:6060",
        "https://localhost:6060",
        "https://localhost:6068",
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
        var maxAge = 1000 * 60 * 10; //10 minutes
        //for cookie intended for 3rd-party, set 'sameSite: "none"'
        res.cookie('myCookieName', randomNumber, { maxAge: maxAge, httpOnly: false, sameSite: 'none', secure: true});
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

var PORT = 4000;
// Now that our HTTP server is fully set up, we can listen to it.
httpServer.listen(PORT, () => {
    console.log(
        `Server is now running on https://localhost:${PORT}${server.graphqlPath}`,
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
