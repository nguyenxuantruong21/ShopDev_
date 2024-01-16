const { BadRequestError } = require('../core/error.response')
const inventoryModel = require('../models/inventory.model')
const { getProductIdById } = require('../models/repositories/product.repo')

class InventoryService {
  static async addStockToInventory({ stock, productId, shopId, location = '135 , Ba Vi, Ha Noi' }) {
    const product = await getProductIdById(productId)
    if (!product) throw new BadRequestError('The product does not exists!')
    const query = { inven_shopId: shopId, inven_productId: productId }
    const updateSet = {
        $inc: {
          inven_stock: stock
        },
        $set: {
          inven_location: location
        }
      },
      option = { upsert: true, new: true }

    return await inventoryModel.findOneAndUpdate(query, updateSet, option)
  }
}

module.exports = InventoryService
