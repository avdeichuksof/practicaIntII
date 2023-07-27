import User from '../models/userModel.js'
import Cart from '../models/cartModel.js'

class UserController {
    createUser = async (user) => {
        try{
            const newUser = await User.create(user)
            return newUser 
        }catch(err){
            console.log(err)
        }
    }

    getUsers = async () => {
        try{
            const users = await User.find({})
            return users
        }catch(err){
            console.log(err)
        }
    }

    getUserById = async (id) => {
        try{
            const userFound = await User.findOne({_id: id})
            return userFound
        }catch(err){
            console.log(err, {message: 'User not found'})
        }
    }
    getUserByEmail = async (email) => {
        try{
            const userFound = await User.findOne({email: email})
            return userFound
        }catch(err){
            console.log(err, {message: 'User not found'})
        }
    }

    createUserCart = async () => {
        try{
            const newCart = new Cart()
            await newCart.save()

            return newCart
        }catch(err){
            console.log(err, {message: 'Error creating cart'})
            return null
        }
    }

}

export default UserController