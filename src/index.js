var https = require('https');
var express = require('express');
var fs = require('fs');
var path = require('path');
var cors = require('cors');
var { ApolloServerPluginDrainHttpServer } = require("apollo-server-core");
var { makeExecutableSchema } = require('@graphql-tools/schema');
var { WebSocketServer } = require('ws');
var { useServer } = require('graphql-ws/lib/use/ws');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var { uppercaseDirectiveTransformer } = require('./directiveTransformers');

var { ApolloServer, gql } = require('apollo-server-express');
var resolvers = require('./resolvers');
const { request } = require('http');
var typeDefs = gql(require('./typeDefs'));

var app = express();
var httpServer = https.createServer({
    key: fs.readFileSync(path.resolve('sslcert/key.pem')),
    cert: fs.readFileSync(path.resolve('sslcert/cert.pem')),
}, app);

var corsOptions = {
    origin: [
        "https://localhost:6060",
        "https://localhost:6068",
        "https://192.168.0.102:6060",
        "https://127.0.0.1:6060",
        "https://studio.apollographql.com"
    ],
    credentials: true,
}

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


server.start().then(() => {
    server.applyMiddleware({
        app,
        cors: corsOptions,
    });
});
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(bodyParser.json());
const cookieValue = 'UserIsAuthenticated';
const cookieName = 'AuthToken';
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'admin') {
        var maxAge = 1000 * 60 * 60 * 24; //1 day
        //for cookie intended for 3rd-party, set 'sameSite: "none"'
        res.cookie(cookieName, cookieValue, { maxAge: maxAge, httpOnly: false, sameSite: 'none', secure: true });
        res.status(200).send({
            success: true,
            message: 'Login Successful'
        });
    }
    else {
        res.status(401).send({
            success: false,
            message: 'Invalid Credentials'
        });
    }
});
app.use((req, res, next) => {
    let cookie = req.cookies[`${cookieName}`];
    if (cookie === cookieValue) {
        console.log('User is authenticated');
        next();
    }
    else {
        console.log('User is not authenticated');
        res.status(401).send({
            success: false,
            message: 'User not authenticated',
        });
    }
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
