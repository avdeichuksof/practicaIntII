import User from '../models/userModel.js'

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

    getUserById(id) {
        try{
            const userFound = User.findOne({_id: id})
            return userFound
        }catch(err){
            console.log(err, {message: 'User not found'})
        }
    }
    getUserByEmail(email) {
        try{
            const userFound = User.findOne({email: email})
            return userFound
        }catch(err){
            console.log(err, {message: 'User not found'})
        }
    }
}

export default UserController