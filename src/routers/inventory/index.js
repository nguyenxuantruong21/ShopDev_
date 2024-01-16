const express = require('express')
const { asyncHandler } = require('../../helpers/asyncHandler')
const { authorizationv2 } = require('../../auth/authUtils')
const inventoryController = require('../../controllers/inventory.controller')

const router = express.Router()

// authentication V2
router.use(authorizationv2)
router.post('', asyncHandler(inventoryController.addStock))

module.exports = router
