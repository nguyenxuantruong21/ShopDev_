const { BadRequestError, NotFoundError } = require("../core/error.response")
const discountModel = require("../models/discount.model")
// const { product } = require("../models/product.model")
const { checkDiscountExist, findAllDiscountCodesSelect, findAllDiscountCodesUnSelect } = require("../models/repositories/discount.repo")
const { findAllProducts } = require("../models/repositories/product.repo")
const { convertToObjectId } = require("../utils")

/**
 * 1 - generator discount code [shop/admin]
 * 2 - get discount amouse [user]
 * 3 - get all discount codes [user/shop]
 * 4 - verify discount code [user]
 * 5 - delete discount code [shop/admin]
 * 6 - cancel discount code [user]
 */

class DiscountService {
  // create discount code [admin,shop]
  static async createDiscountCode(payload) {
    const {
      code, start_date, end_date, is_active, shopId, min_order_value, product_ids, applies_to, name,
      discription, type, value, max_value, max_uses, uses_count, max_uses_per_user, users_used
    } = payload

    if (new Date(start_date) >= new Date(end_date)) {
      throw new BadRequestError('Start date must be before end date')
    }

    // create index for discount
    const foundDiscount = await discountModel.findOne({
      discount_code: code,
      discount_shopId: convertToObjectId(shopId)
    }).lean()

    if (foundDiscount && foundDiscount.discount_is_active) {
      throw new BadRequestError('Discount exist')
    }

    const newDiscount = await discountModel.create({
      discount_name: name,
      discount_description: discription,
      discount_type: type,
      discount_code: code,
      discount_value: value,
      discount_min_order_value: min_order_value || 0,
      discount_max_value: max_value,
      discount_start_date: new Date(start_date),
      discount_end_date: new Date(end_date),
      discount_max_uses: max_uses,
      discount_uses_count: uses_count,
      discount_users_used: users_used,
      discount_shopId: shopId,
      discount_max_uses_per_user: max_uses_per_user,
      discount_is_active: is_active,
      discount_applies_to: applies_to,
      discount_product_ids: applies_to === 'all' ? [] : product_ids
    })
    return newDiscount
  }

  /**
   * [user]
   * get all discount codes availabel with product all and specific
   */
  static async getAllDiscountCodesWithProduct({
    code, shopId, limit, page
  }) {
    // create index for discount code
    const foundDiscount = await discountModel.findOne({
      discount_code: code,
      discount_shopId: convertToObjectId(shopId)
    }).lean()

    //  !foundDiscount.discount_is_active
    if (!foundDiscount) {
      throw new NotFoundError('Discount not exist')
    }
    const { discount_applies_to, discount_product_ids } = foundDiscount
    let products
    if (discount_applies_to === 'all') {
      // get all product
      products = await findAllProducts({
        filter: {
          product_shop: convertToObjectId(shopId),
          isPublished: true
        },
        limit: +limit,
        page: +page,
        sort: 'ctime',
        select: ['product_name']
      })
    }
    if (discount_applies_to === 'specific') {
      // get product id in product [id]
      products = await findAllProducts({
        filter: {
          _id: { $in: discount_product_ids },
          isPublished: true
        },
        limit: +limit,
        page: +page,
        sort: 'ctime',
        select: ['product_name']
      })
    }
    return products
  }

  /**
   * get all dicount codes  of shop [shop,admin]
   */
  static getAllDiscountCodesByShop = async ({
    limit, page, shopId
  }) => {
    const discounts = await findAllDiscountCodesSelect({
      limit: +limit,
      page: +page,
      filter: {
        discount_shopId: convertToObjectId(shopId),
        discount_is_active: true
      },
      unSelect: ['discount_code', 'discount_name'],
      model: discountModel
    })
    return discounts
  }


  /**
   * [user]
   * Apply discount code
   * product = [
   *  {
   *    productId,
   *    shopId
   *    quantity
   *    name
   *    price
   *  }
   * ]
   */

  static async getDiscountAmount({
    codeId, userId, shopId, products
  }) {
    const foundDiscount = await checkDiscountExist({
      model: discountModel,
      filter: {
        discount_code: codeId,
        discount_shopId: convertToObjectId(shopId)
      }
    })
    if (!foundDiscount) {
      throw new NotFoundError('Discount do not exitst')
    }
    const {
      discount_is_active,
      discount_start_date,
      discount_end_date,
      discount_max_uses,
      discount_min_order_value,
      discount_users_used,
      discount_max_uses_per_user,
      discount_type,
      discount_value
    } = foundDiscount

    if (!discount_is_active) throw new NotFoundError('Discount expried')
    // so luong discount duoc su dung
    if (!discount_max_uses) throw new NotFoundError('Discount are out')
    // neu thoi giam dung ma nho hon thoi gian bat dau hoac lon hon thoi gian ket thuc tra ve loi
    if (new Date() < new Date(discount_start_date) || new Date() > new Date(discount_end_date)) {
      throw new NotFoundError('Discount ecode has expried')
    }
    // chech xem tong gia tri don co lon hon gia tri toi thieu duoc ap dung hay khong
    let totalOrder = 0
    if (discount_min_order_value > 0) {
      // tinh tien 1 san pham = soluong * gia
      totalOrder = products.reduce((acc, product) => {
        return acc + (product.quantity * product.price)
      }, 0)
      // neu ma tong gia tri don hang < gia tri toi thieu khong duoc giam gia
      if (totalOrder < discount_min_order_value) {
        throw new NotFoundError(`Discound require as minium order value of ${discount_min_order_value}`)
      }
    }

    if (discount_max_uses_per_user > 0) {
      const userUsedDiscount = discount_users_used.find(user => user.userId === userId)
      if (userUsedDiscount) {
        throw new NotFoundError('Discount alrealdy user')
      }
    }
    // check xem discount la fixec_amount hay persent
    const amount = discount_type === 'fixed_amount' ? discount_value : totalOrder * (discount_value / 100)
    // tra ra tong so tien, so tien giam gia, so tien phai tra
    return {
      totalOrder,
      discount: amount,
      totalPrice: totalOrder - amount
    }
  }

  // delete discount code [admin, shop]
  static async deleteDiscountCode({ shopId, code }) {
    const deleted = discountModel.findOneAndDelete({
      discount_code: code,
      discount_shopId: convertToObjectId(shopId)
    })
    return deleted
  }


  // cancel discount code [user]
  static async cancelDiscountCode({ codeId, shopId, userId }) {
    const foundDiscount = await checkDiscountExist({
      model: discountModel,
      filter: {
        discount_code: codeId,
        discount_shopId: convertToObjectId(shopId)
      }
    })

    // khi cancel discount thi giam so luong discount dung xuong 1 va tang so luong ap dung len 1
    if (!foundDiscount) throw new NotFoundError('discount do not exitst')
    const result = await discountModel.findByIdAndUpdate(foundDiscount._id, {
      $pull: {
        discount_users_used: userId,
      },
      $inc: {
        discount_max_uses: 1,
        discount_uses_count: -1
      }
    })
    return result
  }
}

module.exports = DiscountService
