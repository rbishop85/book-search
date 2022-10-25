const { AuthenticationError } = require("apollo-server-express");
const { User } = require("../models");
const { signToken } = require("../utils/auth");



const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            return await User.findOne({
                $or: [{ _id: context.user ? context.user._id : args.id }, { username: args.username }],
            });
        }
    },

    Mutation: {
        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);
            return { token, user };
        },
        login: async (parent, args) => {
            const user = await User.findOne({ $or: [{ username: args.username }, { email: args.email }] });

            if (!user) {
                throw new AuthenticationError("Can't find this user");
            }

            const correctPw = await user.isCorrectPassword(args.password);

            if (!correctPw) {
                throw new AuthenticationError("Wrong password!");
            }

            const token = signToken(user);

            return { token, user };
        },
        saveBook: async (parent, args, context) => {
            return await User.findOneAndUpdate(
                { _id: context._id },
                { $addToSet: { savedBooks: args } },
                { new: true, runValidators: true }
            )
        },
        removeBook: async (parent, args, context) => {
            return await User.findOneAndUpdate(
                { _id: context._id },
                { $pull: { savedBooks: { bookId: args.bookId } } },
                { new: true }
            )
        }
    }
};

module.exports = resolvers;