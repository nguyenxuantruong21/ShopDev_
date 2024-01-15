const express = require('express')
const { authorizationv2 } = require('../../auth/authUtils')
const { asyncHandler } = require('../../helpers/asyncHandler')
const cartController = require('../../controllers/cart.controller')

const router = express.Router()
//  authentication
router.use(authorizationv2)

router.post('', asyncHandler(cartController.addToCart))
router.post('/update', asyncHandler(cartController.updateToCart))
router.delete('', asyncHandler(cartController.deleteToCart))
router.get('', asyncHandler(cartController.getlistToCart))


module.exports = router
