export interface signUpCredentials  {
    username: string
    email: string 
    password: string
    saltKey?: string
}

export interface signInCredentials  {
    email: string 
    password: string
    saltKey?: string
}