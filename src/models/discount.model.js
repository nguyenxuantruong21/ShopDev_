
const { Schema, model } = require('mongoose')
const DOCUMENT_NAME = 'Discount'
const COLLECTION_NAME = 'discounts'

const discountSchema = new Schema({
  discount_name: { type: String, required: true }, // ten discount
  discount_description: { type: String, required: true }, // thong tin discount
  discount_type: { type: String, default: 'fixed_amount' }, // theo so tien hoac theo percentage
  discount_value: { type: Number, required: true }, // 10.000 , 10
  discount_code: { type: String, required: true }, // discount code
  discount_start_date: { type: Date, required: true }, // ngay bat dau
  discount_end_date: { type: Date, required: true }, // ngay ket thuc
  discount_max_uses: { type: Number, required: true }, // so luong discount duoc ap dung
  discount_uses_count: { type: Number, required: true }, // so luong discount duoc su dung
  discount_users_used: { type: Array, default: [] }, // ai da dung discount day
  discount_max_uses_per_user: { type: Number, required: true }, // so luong cho phep toi da su dung
  discount_min_order_value: { type: Number, required: true }, //
  discount_shopId: { type: Schema.Types.ObjectId, ref: 'Shop' },

  discount_is_active: { type: Boolean, default: true },
  discount_applies_to: { type: String, enum: ['all', 'specific'] }, // sun dung cho mat hang nao
  discount_product_ids: { type: Array, default: [] } // mat hang duoc ap dung la gi
}, {
  timestamps: true,
  collection: COLLECTION_NAME
})

module.exports = model(DOCUMENT_NAME, discountSchema)
