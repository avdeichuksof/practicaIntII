import mongoose from "mongoose"

const UserSchema = new mongoose.Schema({
    firstName:{
        type: String,
        required:true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    age: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    cart: {
        // cuando se crea el user, crear un carrito vacío
        // como el population con productos
        type: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Cart'
        }
    },
    role: {
        type: String,
        required: true
    }
})

const User = mongoose.model('User', UserSchema)
export default User