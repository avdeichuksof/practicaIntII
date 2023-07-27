import CartController from '../dao/mongoManagers/cartController.js'
const CM = new CartController()

const btnAdd = document.getElementById('btnAdd{{this._id}}')
btnAdd.addEventListener('click', (req, res) => {
    let user = req.user
    let cartId = user.cart
    console.log('cartId')
    CM.addToCart(cartId, this._id)
})