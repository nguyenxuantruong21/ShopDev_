const { SuccessResponse } = require("../core/success.response");
const DiscountService = require("../services/discount.service");


class DiscountController {
  createDiscountCodes = async (req, res, next) => {
    new SuccessResponse({
      message: 'Successfull Code Generations',
      metadata: await DiscountService.createDiscountCode({
        ...req.body,
        shopId: req.user.userId
      })
    }).send(res)
  }

  getAllDiscountCodes = async (req, res, next) => {
    new SuccessResponse({
      message: 'Successfull Code Found',
      metadata: await DiscountService.getAllDiscountCodesByShop({
        ...req.query,
        shopId: req.user.userId
      })
    }).send(res)
  }

  getDiscountAmount = async (req, res, next) => {
    new SuccessResponse({
      message: 'Successfull Code Found',
      metadata: await DiscountService.getDiscountAmount({
        ...req.body,
      })
    }).send(res)
  }

  getAllDiscountCodeWithProduct = async (req, res, next) => {
    new SuccessResponse({
      message: 'Successfull Code Found',
      metadata: await DiscountService.getAllDiscountCodesWithProduct({
        ...req.query
      })
    }).send(res)
  }

  deleteDiscountCode = async (req, res, next) => {
    new SuccessResponse({
      message: 'Delete Discount Successfully',
      metadata: await DiscountService.deleteDiscountCode({
        ...req.params,
        shopId: req.user.userId
      })
    }).send(res)
  }


  cancelDiscountCode = async (req, res, next) => {
    new SuccessResponse({
      message: 'Cancel Discount Successfully',
      metadata: await DiscountService.cancelDiscountCode({
        ...req.params,
        shopId: req.user.userId
      })
    }).send(res)
  }
}


module.exports = new DiscountController()
