const express = require('express')
const { asyncHandler } = require('../../helpers/asyncHandler')
const { authorizationv2 } = require('../../auth/authUtils')
const checkoutController = require('../../controllers/checkout.controller')

const router = express.Router()
router.use(authorizationv2)

router.post('/review', asyncHandler(checkoutController.checkoutReview))

module.exports = router
