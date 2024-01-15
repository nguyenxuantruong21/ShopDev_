const express = require('express')
const { asyncHandler } = require('../../helpers/asyncHandler')
const { authorizationv2 } = require('../../auth/authUtils')
const productController = require('../../controllers/product.controller')

const router = express.Router()

// search product
router.get('/search/:keySearch', asyncHandler(productController.getListSearchProduct))
router.get('', asyncHandler(productController.findAllProducts))
router.get('/:product_id', asyncHandler(productController.findProductsDetail))

// authentication V2
router.use(authorizationv2)

// create product
router.post('', asyncHandler(productController.createProduct))
router.patch('/:productId', asyncHandler(productController.updateProduct))
router.post('/published/:id', asyncHandler(productController.publishProducByShop))
router.post('/unpublished/:id', asyncHandler(productController.unPublishProducByShop))

// get all list draft
router.get('/drafts/all', asyncHandler(productController.getAllDraftForShop))
router.get('/published/all', asyncHandler(productController.getAllPublishForShop))


module.exports = router
