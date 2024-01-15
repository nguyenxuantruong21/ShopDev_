const { Schema, model } = require('mongoose')
const slugify = require('slugify')
const DOCUMENT_NAME = 'Product'
const COLLECTION_NAME = 'Products'

const productShema = new Schema({
  product_name: { type: String, required: true }, // dien thoai iphone x
  product_thumb: { type: String, required: true },
  product_description: { type: String },
  product_slug: { type: String },// dien-thoai-iphone-x
  product_price: { type: Number, required: true },
  product_quantity: { type: Number, required: true },
  product_type: { type: String, required: true, enum: ['Electronics', 'Clothing', 'Furniture'] },
  product_shop: { type: Schema.Types.ObjectId, ref: 'Shop' },
  product_attributes: { type: Schema.Types.Mixed, required: true },
  // more
  product_ratingAverage: {
    type: Number,
    default: 4.5,
    min: [1, 'Rating must be above 1.0'],
    max: [5, 'Rating must be above 5.0'],
    // 4.3875 => 43.875 => 43 => 4.3
    set: (val) => Math.round(val * 10) / 10
  },
  product_variations: { type: Array, default: [] },
  isDraft: { type: Boolean, default: true, select: false },
  isPublished: { type: Boolean, default: false, select: false }
}, {
  timestamps: true,
  collection: COLLECTION_NAME
})


// create index for search
productShema.index({ product_description: 'text', product_name: 'text' })

// overide product.slug use librari
productShema.pre('save', function (next) {
  this.product_slug = slugify(this.product_name, { lower: true })
  next()
})


// define the product type = clothing
const clothingSchema = new Schema({
  brand: { type: String, required: true },
  size: { type: String },
  material: { type: String }
}, {
  collection: 'clothes',
  timestamps: true
})

// define the product type = electronic
const electronicSchema = new Schema({
  manufacturer: { type: String, required: true },
  model: { type: String },
  color: { type: String }
}, {
  collection: 'electronics',
  timestamps: true
})


const furnitureSchema = new Schema({
  brand: { type: String, required: true },
  size: { type: String },
  material: { type: String }
}, {
  collection: 'furnitures',
  timestamps: true
})



module.exports = {
  product: model(DOCUMENT_NAME, productShema),
  electronic: model('Electronics', electronicSchema),
  clothing: model('Clothing', clothingSchema),
  furniture: model('Furniture', furnitureSchema)
}
