const { Schema, model } = require('mongoose')
const DOCUMENT_NAME = 'Order'
const COLLECTION_NAME = 'Orders'

const orderSchema = new Schema(
  {
    order_userId: { type: Number, required: true },
    order_checkout: { type: Object, default: [] },
    /**
     * order_checkout: {
     *  totalPrice
     *  totalApllyDiscount
     *  freeShip
     * }
     */
    order_shipping: { type: Object, default: {} },
    /**
     * street,
     * city
     * state,
     * country
     */
    order_payment: { type: Object, default: {} },
    order_product: { type: Array, required: true },
    order_trackingNumber: { type: String, default: '#000018052022' },
    order_status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipped', 'cancelled', 'delevered'],
      default: 'pending'
    }
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME
  }
)

module.exports = model(DOCUMENT_NAME, orderSchema)
