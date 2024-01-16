const express = require('express')
const { apiKey, permission } = require('../auth/checkAuth')

const router = express.Router()
// check api key
router.use(apiKey)
// check permission
router.use(permission('0000'))
// auth api

router.use('/v1/api/cart', require('./cart/index'))
router.use('/v1/api/shop', require('./access/index'))
router.use('/v1/api/product', require('./product/index'))
router.use('/v1/api/discount', require('./discount/index'))
router.use('/v1/api/checkout', require('./checkout/index'))
router.use('/v1/api/inventory', require('./inventory/index'))

module.exports = router
