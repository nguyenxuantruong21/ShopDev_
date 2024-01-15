const { Schema, model } = require('mongoose')
const DOCUMENT_NAME = 'Cart'
const COLLECTION_NAME = 'Carts'

const cartSchema = new Schema({
  cart_state: {
    type: String,
    enum: ['active', 'complete', 'failed', 'pending'],
    default: 'active'
  },
  cart_products: { type: Array, required: true, default: [] },
  cart_count_product: { type: Number, default: 0 },
  cart_userId: { type: Number, required: true }
}, {
  timestamps: {
    createdAt: 'createdOn',
    updatedAt: 'modifiedOn'
  },
  collection: COLLECTION_NAME
})

module.exports = model(DOCUMENT_NAME, cartSchema)

