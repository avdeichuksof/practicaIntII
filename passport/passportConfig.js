import passport from 'passport'
import local from 'passport-local'
import GitHubStrategy from 'passport-github2'
import UserController from '../dao/mongoManagers/userController.js'
import { createHash, isValidPassword } from '../utils/bcrypt.js'
import dotenv from 'dotenv'
import fetch from 'node-fetch'
import User from '../dao/models/userModel.js'
import Cart from '../dao/models/cartModel.js'

dotenv.config()
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET

const LocalStrategy = local.Strategy
const UserManager = new UserController()

const initPassport = async () => {
    passport.use('register',
        new LocalStrategy({ 
            passReqToCallback: true, 
            usernameField: 'email' },
            async (req, username, password, done) => {
                try {
                    let userData = req.body

                    // buscamos si existe el user en la DB
                    const userFound = await UserManager.getUserByEmail(username)
                    if (userFound) {
                        console.log('User already exists')
                        return done(null, false)
                    }
                    
                    /* const newCart = await UserManager.createUserCart()
                    if (!newCart) return done('Error creating cart') */
                    
                    // seteamos el rol
                    const role = (userData.email === 'adminCoder@coder.com' && userData.password === 'admin1234') ? 'admin' : 'user'
                    
                    // creamos carrito 
                    const newCart = new Cart()

                    // si no existe lo creamos
                    const newUser = {
                        email: username,
                        firstName: userData.firstName,
                        lastName: userData.lastName,
                        password: createHash(userData.password),
                        cart: await newCart.save(),
                        age: userData.age,
                        role: role
                    }

                    

                    // guardamos
                    let userCreated = await UserManager.createUser(newUser)
                    console.log({ message: 'User registered', userCreated })
                    done(null, userCreated)
                } catch (err) {
                    return done('Error creating user' + err)
                }
            }
        )
    )

    passport.use('login',
    new LocalStrategy({ usernameField: 'email' },
            async (username, password, done) => {
                try {
                    // buscamos user
                    const userFound = await UserManager.getUserByEmail(username)
                    // si no existe
                    if (!userFound) {
                        console.log('User not found')
                        return done(null, false)
                    }
                    // validamos password
                    if (!isValidPassword(password, userFound.password)) {
                        console.log('Invalid password')
                        return done(null, false)
                    }
                    // validamos session de admin
                    if (userFound.email == 'adminCoder@coder.com' && userFound.password == 'admin1234') {
                        req.session.admin = true
                    }
                    // si sale todo bien
                    return done(null, userFound)
                } catch (err) {
                    return done(err)
                }
            }
        )
    )

    passport.use('github',
        new GitHubStrategy({
            clientID: GITHUB_CLIENT_ID,
            clientSecret: GITHUB_CLIENT_SECRET,
            callbackURL: 'http://localhost:8080/auth/github/callback',
        },
            async (accessToken, _, profile, done) => {
                // email config
                try {
                    const res = await fetch('https://api.github.com/user/emails', {
                        headers: {
                            Accept: 'application/vnd.github+json',
                            Authorization: 'Bearer ' + accessToken,
                            'X-Github-Api-Version': '2022-11-28',
                        },
                    })

                    const emails = await res.json()
                    console.log('tu res es:' + emails)
                    
                    const emailDetail = emails.find((email) => email.verified == true)
                    
                    if(!emailDetail){
                        return done(new Error('Cannot get a valid email for this user'))
                    }
                    
                    profile.email = emailDetail.email
                    // end

                    // buscamos el usuario y si no existe lo creamos
                    let user = await User.findOne({email: profile.email});

                    if (!user) {
                        const newUser = {
                            firstName: profile._json.firstName || profile._json.login || 'noname',
                            lastName: 'nolast',
                            email: profile.email,
                            password: ' ',
                            age: 'noage'
                        }

                        if (profile.email === 'adminCoder@coder.com' && profile.password === 'admin1234') {
                            profile.role = 'admin';
                        } else {
                            profile.role = 'user';
                        }

                        let userCreated = await UserManager.createUser(newUser);
                        console.log({ message: 'User registered', userCreated });
                        done(null, userCreated);
                    } else {
                        return done(null, user);
                    }
                } catch (err) {
                    return done(err);
                }
            }
        )
    )

        // se activa cuando se crea el user y lo serializa
        passport.serializeUser((user, done) => {
            done(null, user._id)
        }),
        // deserializa cuando nos querramos loguear y da paso a la estrategia de login
        passport.deserializeUser(async (id, done) => {
            let user = await User.findById(id)
            done(null, user)
        })
}

export default initPassport
