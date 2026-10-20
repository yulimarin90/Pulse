import TweetWithAuthor from 'react';

export interface User {
    id: number,
    fullName: string,
    username: string,
    email: string,
}

export interface Tweet {
    id: number,
    userId: number,
    text: string,
    createdAt: number,
}

export interface TweetWithAuthor extends Tweet {
    author: User,
}

export interface RegisterData {
    fullName: string,
    username: string,
    email: string,
    password: string,
}