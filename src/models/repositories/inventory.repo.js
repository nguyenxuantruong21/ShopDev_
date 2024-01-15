const { Types: { ObjectId } } = require('mongoose')
const inventoryModle = require('../inventory.modle')

const insertInventory = async ({
  productId, shopId, stock, location = 'unKnow'
}) => {
  return await inventoryModle.create({
    inven_productId: productId,
    inven_location: location,
    inven_shopId: shopId,
    inven_stock: stock
  })
}


module.exports = {
  insertInventory
}
