const { findCartById } = require('../models/repositories/cart.repo')
const { BadRequestError } = require('../core/error.response')
const { checkProductByServer } = require('../models/repositories/product.repo')
const { getDiscountAmount } = require('./discount.service')

class CheckoutService {
  /**
   *  login adn without login
   * cartId
   * userId
   * shop_order_ids: [
   *    {
   *      shopId,
   *      shop_discounts:[],
   *      item_products:[
   *         {
   *            price =  1
   *            quantity = 2
   *            productId
   *         }
   *      ]
   *    }
   * ]
   */
  static async checkOutReview({ cartId, userId, shop_order_ids }) {
    // check cartId ton tai hay khong
    const foundCart = await findCartById(cartId)
    if (!foundCart) {
      throw new BadRequestError('cart does not exist')
    }
    const checkout_order = {
        totalPrice: 0, // tong tien hang
        freeShip: 0, // mien phi van chuyen
        totalDiscount: 0, // tong tien discount giam gia
        totalCheckout: 0 // tong thanh toan
      },
      shop_order_ids_new = []

    // tinh tong tien bill
    for (let index = 0; index < shop_order_ids.length; index++) {
      const { shopId, shop_discounts = [], item_products = [] } = shop_order_ids[index]
      // check product available
      const checkProductServer = await checkProductByServer(item_products)
      if (!checkProductServer[0]) throw new BadRequestError('order wrong!!')
      const checkoutPrice = checkProductServer.reduce((acc, product) => {
        return acc + product.quantity * product.price
      }, 0)

      // tong tien truoc khi xu ly
      checkout_order.totalPrice += checkoutPrice
      const itemCheckout = {
        shopId,
        shop_discounts,
        priceRaw: checkoutPrice, // tien truoc khi giam gia
        priceApplyDiscount: checkoutPrice,
        item_products: checkProductServer
      }

      // neu shop_discount ton tai > 0, check xem co hop le hay khong
      if (shop_discounts.length > 0) {
        // gia su chi co mot discout
        // get discount
        const { totalPrice = 0, discount = 0 } = await getDiscountAmount({
          codeId: shop_discounts[0].codeId,
          userId,
          shopId,
          products: checkProductServer
        })
        // tong discount giam gia
        checkout_order.totalDiscount += discount
        if (discount > 0) {
          itemCheckout.priceApplyDiscount = checkoutPrice - discount
        }
      }
      // tong thanh toan cuoi cung
      checkout_order.totalCheckout += itemCheckout.priceApplyDiscount
      shop_order_ids_new.push(itemCheckout)
    }

    return {
      shop_order_ids,
      shop_order_ids_new,
      checkout_order
    }
  }
}

module.exports = CheckoutService
