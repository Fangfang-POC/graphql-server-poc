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
        rebels: (parent, args, context, info) => {
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
        user: (parent, args, context, info) => {
            return {
                id: args.id,
                name: `Luke Skywalker ${args.id}`,
            }
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
            console.log(input);
            return {
                id: '10000',
                name: input.name,
                age: input.age,
            };
        }
    }
};

// export default resolvers;
module.exports = resolvers;