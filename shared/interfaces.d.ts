export interface signUpCredentials  {
    username: string
    email: string 
    password: string
    saltKey?: string
}

export interface signInCredentials  {
    id?: string 
    email: string 
    password: string
    saltKey?: string
}