import {gql} from "apollo-server-express";

export const typeDefs = gql`
    type Post {
        id: ID!
        title: String!
        body: String
        userId: ID!
    }
    
    type Query {
        posts: [Post]
    }
`