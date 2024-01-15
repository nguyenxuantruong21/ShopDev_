const { CREATED, SuccessResponse } = require("../core/success.response");
const CartService = require("../services/cart.service");

class CartController {

  // add to cart
  addToCart = async (req, res, next) => {
    new SuccessResponse({
      message: 'Create new Cart Success',
      metadata: await CartService.addToCart(req.body)
    }).send(res)
  }

  // update to cart
  updateToCart = async (req, res, next) => {
    new SuccessResponse({
      message: 'Update Cart Success',
      metadata: await CartService.updateCart(req.body)
    }).send(res)
  }

  // delete
  deleteToCart = async (req, res, next) => {
    new SuccessResponse({
      message: 'Delete Cart Success',
      metadata: await CartService.deleteUserCart(req.body)
    }).send(res)
  }

  // delete
  getlistToCart = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get list Cart Success',
      metadata: await CartService.getListCart(req.query)
    }).send(res)
  }

}

module.exports = new CartController()
