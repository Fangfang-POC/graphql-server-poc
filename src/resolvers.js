const { PubSub, withFilter } = require('graphql-subscriptions');
const pubsub = new PubSub();
const fs = require('fs');
const data = require('./data.json');
const path = require('path');
const { users } = data;

const resolvers = {
    SearchResult: {
        __resolveType(obj, context, info) {
            if (obj.name && obj.age) {
                return 'Human';
            }
            if (obj.weight) {
                return 'Dog';
            }
            if (obj.length) {
                return 'Cat';
            }
            return null;
        },
    },
    Vehicle: {
        __resolveType(obj, context, info) {
            if (obj.wingspan) {
                return 'Airplane';
            }
            if (obj.licensePlate) {
                return 'Car';
            }
            return null;
        }
    },
    Query: {
        rebels: (_, args, context, info) => {
            const { id } = args;
            return {
                id: id,
                name: 'Han Solo',
                ships: {
                    edges: [{
                        cursor: 'cursor:1',
                        node: {
                            id: '1',
                            name: 'X-Wing',
                        }
                    }, {
                        cursor: 'cursor:2',
                        node: {
                            id: '2',
                            name: 'Y-Wing',
                        }
                    }],
                    pageInfo: {
                        hasNextPage: true,
                        hasPreviousPage: false,
                        startCursor: 'cursor:1',
                        endCursor: 'cursor:2',
                    }
                }
            };
        },
        users: (_, args, context, info) => {
            const { offset = 0, limit = users.length } = args;
            console.log('users query', args);
            return { totalCount: users.length, userList: users.slice(offset, offset + limit) };
        },
        user: (parent, args, context, info) => {
            const { id } = args;
            return users.find(user => (user.id) === parseInt(id));
        },
        search: (parent, args, context, info) => {
            return [{
                name: 'Tom',
                age: 18,
            }, {
                name: 'Jerry',
                age: 20,
            }, {
                gender: 'female',
                age: 3,
                weight: 20,
            }, {
                gender: 'male',
                name: 'Jackie',
                length: 20,
            }];
        },
        vehicles(parent, args, context, info) {
            return [{
                maxSpeed: 44,
                wingspan: 103
            }, {
                maxSpeed: 55,
                licensePlate: 'helloLicensePlate'
            }]
        }
    },
    Mutation: {
        addUser: (parent, args, context, info) => {
            const { input } = args;
            const nextId = users[users.length - 1].id + 1;
            users.push({
                id: nextId,
                name: input.name,
                age: input.age,
                username: input.username || input.name + '_' + nextId,
                gender: input.gender || 'MALE',
            });
            //write back to data.json file
            data.users = users;
            const json = JSON.stringify(data, null, 4);

            fs.writeFile(path.resolve(__dirname, 'data.json'), json, 'utf8', () => {
                pubsub.publish('USER_ADDED', { userAdded: { id: nextId, name: input.name, age: input.age } });
                return {
                    id: nextId,
                    name: input.name,
                    age: input.age,
                };
            });
        },
        deleteUser: (parent, args, context, info) => {
            const { id } = args;
            const index = users.findIndex(user => user.id === parseInt(id));
            if (index !== -1) {
                const deletedUser = users.splice(index, 1);
                //write back to data.json file
                data.users = users;
                const json = JSON.stringify(data, null, 4);
                fs.writeFile(path.resolve(__dirname, 'data.json'), json, 'utf8', () => {
                    // pubsub.publish('USER_DELETED', { userDeleted: { id } });
                    return deletedUser;
                });
            }
            return null;
        },
    },
    Subscription: {
        userAdded: {
            subscribe: withFilter(() => {
                return pubsub.asyncIterator('USER_ADDED');
            },
                (payload, variables) => {
                    console.log(payload, variables);
                    return true;
                }
            )
        }
    }
};

module.exports = resolvers;