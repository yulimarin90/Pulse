
export interface User {
    id: number,
    fullName: string,
    username: string,
    email: string,
    bio?: string,
    location?: string,
    website?: string,
    // yyyy-mm-dd
    birthDate?: string,
    // Photos are stored as small data URLs
    avatarUrl?: string,
    bannerUrl?: string, 
    verified?: boolean,
}

// What the "Edit profile" screen can change. The username and the email cannot be changed.
export type ProfileChanges = Partial<Pick<User, 'fullName' | 'bio' | 'location' | 'website' | 'birthDate' | 'avatarUrl' | 'bannerUrl'>>;

export interface Tweet {
    id: number,
    userId: number,
    text: string,
    createdAt: number,
    mediaUrl?: string;    
    mediaType?: 'image' | 'video'; 
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