const { SuccessResponse } = require('../core/success.response')
const CheckoutService = require('../services/checkout.service')

class CheckoutController {
  checkoutReview = async (req, res, next) => {
    new SuccessResponse({
      message: 'Checkout review successfully',
      metadata: await CheckoutService.checkOutReview(req.body)
    }).send(res)
  }
}

module.exports = new CheckoutController()
