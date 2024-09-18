import {gql} from '@apollo/client'

export const GET_USER_BY_USER_ID = gql`
    query getUserByUserId($userId: Float!) {
        getUserByUserId(userId: $userId) {
            fullname
            email
            image
            bio
        }
    }
`