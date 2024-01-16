const { findCartById } = require('../models/repositories/cart.repo')
const { BadRequestError } = require('../core/error.response')
const { checkProductByServer } = require('../models/repositories/product.repo')
const { getDiscountAmount } = require('./discount.service')
const { acquireLock, releaseLock } = require('./redis.service')
const orderModel = require('../models/order.model')

class CheckoutService {
  /**
   * login and without login
   * cartId
   * userId
   * shop_order_ids: [
   *    {
   *      shopId:"",
   *      shop_discounts:[
   *        {
              "shop_id": "65a492dae80c65d0803ed094",
              "discountId":"65a503cadeada2b25acbecec",
              "codeId":"SHOP-T"
            }
   *      ],
   *      item_products:[
   *         {
   *            price: ""
   *            quantity: ""
   *            productId: ""
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

  // ORDER
  static async orderByUser({ shop_order_ids, cartId, userId, user_address, user_payment = {} }) {
    const { shop_order_ids_new, checkout_order } = await CheckoutService.checkOutReview({
      cartId,
      userId,
      shop_order_ids
    })

    // check lai lan nua xem con ton kho hay khong
    const products = shop_order_ids_new.flatMap((order) => order.item_products)
    console.log('[1]::::', products)
    const acquireProduct = []
    for (let index = 0; index < products.length; index++) {
      const { productId, quantity } = products[index]
      const keyLock = await acquireLock(productId, quantity, cartId)
      acquireProduct.push(keyLock ? true : false)
      if (keyLock) {
        await releaseLock(keyLock)
      }
    }

    // check mot san pham trong kho het hang
    if (acquireProduct.includes(false)) {
      throw new BadRequestError('Mot san pham da duoc cap nhat, vui long quay lai gio hang....')
    }

    const newOrder = await orderModel.create({
      order_userId: userId,
      order_checkout: checkout_order,
      order_shipping: user_address,
      order_payment: user_payment,
      order_product: shop_order_ids_new
    })

    // neu insert thanh cong thi remove product trong gio hang
    if (newOrder) {
    }
    return newOrder
  }
}

module.exports = CheckoutService
