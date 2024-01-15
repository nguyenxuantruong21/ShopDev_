const express = require('express')
const accessController = require('../../controllers/access.controller')
const { asyncHandler } = require('../../helpers/asyncHandler')
const { authorizationv2 } = require('../../auth/authUtils')

const router = express.Router()
router.post('/signup', asyncHandler(accessController.signUp))
router.post('/login', asyncHandler(accessController.logIn))

//  authentication
router.use(authorizationv2)
//  logout
router.post('/logout', asyncHandler(accessController.logOut))
// handle refreshToken
router.post('/handleRefreshToken', asyncHandler(accessController.handleRefreshToken))


module.exports = router
