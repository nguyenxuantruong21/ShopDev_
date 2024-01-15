const cartModel = require("../models/cart.model");
const { NotFoundError } = require("../core/error.response");
const { createUserCart, updateUserCartQuantity, deleteUserCart } = require("../models/repositories/cart.repo");
const { getProductIdById } = require("../models/repositories/product.repo");

/**
 * key feature: cart service
 * 1. add product to cart [user]
 * 2. reduce product quantity by one [user]
 * 3. increase prodcut quantity by one [user]
 * 4. get cart [user]
 * 5. delete cart [user]
 * 6. delete cart item [usert]
 */

class CartService {
  // 1. add product to cart
  static async addToCart({ userId, product }) {
    // check cart ton tai hay khong
    const userCart = await cartModel.findOne({ cart_userId: userId })
    if (!userCart) {
      // created cart for user
      return await createUserCart({ userId, product })
    }
    // neu co gio hang roi nhung chua co san pham thi them san pham
    // tim san pham co trong gio hay chua: 1 co roi thi update quantity chua thi them moi
    const foundProductInCart = userCart.cart_products.find((item) => {
      item.productId === product.productId
    })
    if (!foundProductInCart) {
      // clone lai gia tri cu va add them product moi
      userCart.cart_products = [...userCart.cart_products, product]
      return await userCart.save()
    }
    // gio hang ton tai, va co san pham nay thi update quantity
    return await updateUserCartQuantity({ userId, product })
  }

  /**
   * update product
   * shop_order_ids: {
   *    shopId
   *    item_products: [
   *      {
   *        quantity,
   *        price
   *        shopId
   *        old_quantity
   *        productId
   *      }
   *    ],
   *    version
   *  }
   */
  static async updateCart({ userId, shop_order_ids = {} }) {
    const { productId, quantity, old_quantity } = shop_order_ids[0]?.item_products[0]
    // check product
    const foundProduct = await getProductIdById(productId)
    if (!foundProduct) throw new NotFoundError('Product not found')
    // compare
    if (foundProduct.product_shop.toString() !== shop_order_ids[0]?.shopId) {
      throw new NotFoundError('Product do not belong to the shop')
    }
    if (quantity === 0) {
      // delete
      await deleteUserCart({ userId, productId })
    }
    return await updateUserCartQuantity({
      userId, 
      product: {
        productId,
        quantity: quantity - old_quantity
      }
    })
  }

  static deleteUserCart = async ({ userId, productId }) => {
    const query = { cart_userId: userId, cart_state: 'active' }
    const updateSet = {
      $pull: {
        cart_products: {
          productId
        }
      }
    }
    const deleteCart = await cartModel.updateOne(query, updateSet)
    return deleteCart
  }


  static getListCart = async ({ userId }) => {
    return cartModel.findOne({
      cart_userId: +userId
    }).lean()
  }
}


module.exports = CartService
