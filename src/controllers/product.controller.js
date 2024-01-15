const { SuccessResponse } = require("../core/success.response");
const ProductService = require('../services/product.service')
class ProductController {
  //CREATED
  createProduct = async (req, res, next) => {
    new SuccessResponse({
      message: 'Create new Product success',
      metadata: await ProductService.createProduct(req.body.product_type, {
        ...req.body,
        product_shop: req.user.userId
      })
    }).send(res)
  }
  //END CREATED

  // UPDATE
  /**
   * publish product by store
   */
  publishProducByShop = async (req, res, next) => {
    new SuccessResponse({
      message: 'Publish Product Success',
      metadata: await ProductService.publicProductByShop({
        product_shop: req.user.userId,
        product_id: req.params.id
      })
    }).send(res)
  }

  /**
   * unPublish product by store
   */
  unPublishProducByShop = async (req, res, next) => {
    new SuccessResponse({
      message: 'UnPublish Product Success',
      metadata: await ProductService.unPublicProductByShop({
        product_shop: req.user.userId,
        product_id: req.params.id
      })
    }).send(res)
  }

  // update product
  updateProduct = async (req, res, next) => {
    new SuccessResponse({
      message: 'Update Product Success',
      metadata: await ProductService.updateProduct(req.body.product_type, req.params.productId, {
        ...req.body,
        product_shop: req.user.userId
      })
    }).send(res)
  }

  // END UPDATE

  // QUERY //
  getAllDraftForShop = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get List Draft Successfully !!!',
      metadata: await ProductService.findAllDraftsForShop({ product_shop: req.user.userId })
    }).send(res)
  }

  getAllPublishForShop = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get List Publish Successfully !!!',
      metadata: await ProductService.findAllPublishForShop({ product_shop: req.user.userId })
    }).send(res)
  }

  getListSearchProduct = async (req, res, next) => {
    new SuccessResponse({
      message: 'Search Products Successfully !!!',
      metadata: await ProductService.searchProduct(req.params)
    }).send(res)
  }

  findAllProducts = async (req, res, next) => {
    new SuccessResponse({
      message: 'Find All Products Successfully !!!',
      metadata: await ProductService.findAllProducts(req.query)
    }).send(res)
  }

  findProductsDetail = async (req, res, next) => {
    new SuccessResponse({
      message: 'Find Products Detail Successfully !!!',
      metadata: await ProductService.findProductsDetail({
        product_id: req.params.product_id
      })
    }).send(res)
  }
  // END QUERY //
}


module.exports = new ProductController()
