const { SuccessResponse } = require('../core/success.response')
const InventoryService = require('../services/inventory.service')

class ProductController {
  addStock = async (req, res, next) => {
    new SuccessResponse({
      message: 'Add to Stock successfully !!!',
      metadata: await InventoryService.addStockToInventory(req.body)
    }).send(res)
  }
}

module.exports = new ProductController()
