# AutheticationJS
[![Build Status](https://travis-ci.org/joemccann/dillinger.svg?branch=master)](https://travis-ci.org/joemccann/dillinger)
A complete authentication flow with login creation, sending confirmation email, encryption, 2-factor authentication, temporary and permanent blocking

- Create account with validated credentials
- Create password with SaltKey and Hash256

[x] create db connection
[x] validate credentials before save
[] check if validate code expired in 60 seconds
[] save and refresh validate code in database temp
[x] send email of confirmation with validate code
[] redirect to page of confirm code
[] check if validate code is equal to code in request
[x] Create hash and saltKey 
[x] save password-hash and saltKey
