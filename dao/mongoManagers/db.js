import mongoose from "mongoose"
const URL = 'mongodb+srv://savdeichuk:yXdqDcaeNhm7aDH8@ecommerce.dmrehes.mongodb.net/ecommerce'

export default {
    URL,
    connect: () => {
        return mongoose.connect(URL, {useUnifiedTopology: true, useNewUrlParser: true})
        .then((connect) => {
            console.log('Connected to DB')
        })
        .catch((err) => console.log(err))
    }
}