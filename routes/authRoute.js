import {Router} from 'express'
const router = new Router()
import User from'../dao/models/userModel.js'
import jwt from 'jsonwebtoken'
import passport from'passport'

function auth(req, res, next){
    (req.session.admin == true) 
        ? next()
        : res.send('An error ocurred or you are not an admin ')
}

router.post('/register', passport.authenticate('register', {failureRedirect: '/auth/failedregistration'}), async (req, res) => {
    if(!req.user){
        return res.json({error: 'Something went wrong'})
    }
    req.session.user = {_id: req.user._id, email: req.user.email, firstName:  req.user.firstName, lastName: req.user.lastName, password: req.session.password, age: req.user.age, cart: req.user.cart}
    return res.redirect('/user/login')
})

router.get('/failedregistration', async(req, res) => {
    return res.json({error: 'Failed to register'})
})

router.post('/login', (req, res, next) => {
    passport.authenticate('login', { failureRedirect: '/auth/failedlogin' }, async (err, user, info) => {
        if (err) return next(err);
        if (!user) return res.json({ error: 'Invalid credentials' })

        req.session.user = {
            _id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            password: user.password,
            age: user.age,
            cart: user.cart
        }
        console.log(req.session.user)

        try {
            let token = jwt.sign(req.session.user, 'tokenSecreto', { expiresIn: '2000s' })
            console.log({ token, message: 'User logged in' })
            return res.redirect('/index')
        } catch (tokenError) {
            return next(tokenError)
        }
    })(req, res, next)
})

router.get('/failedlogin', async (req, res) => {
    return res.json({ error: 'Failed to login' })
})

router.get('/github', 
    passport.authenticate('github', {scope: ['user: email']})
)

router.get('/github/callback',
    // si falla la auth
    passport.authenticate('github', {failureRedirect: '/user/login'}),
    // si no falla
    (req, res) => {
        req.session.user = req.user
        res.redirect('/index')
    }
)

router.get('/current', (req, res) => {
    res.send(req.session.user)
})

router.get('/privado', auth, (req, res) => {
    res.send('Bienvenido admin!')
})

router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if(err) res.send('Failed logout')
        console.log('User logged out')
        res.redirect('/user/login')
    })
})

router.get('/users', async (req, res) => {
    try{
        const users = await User.find().lean().exec()
        res.send(users)
    }catch(err){
        console.log(err)
    }
})


export default router