'use strict'

import express from 'express'

import {
    validateJwt,
    isClient
} from '../middleware/validate-jwt.js'

import {
    test,
    addCart,
    getMyCarts,
    updateCart,
    deleteCart,
    deleteProductInCart
} from './shoppingCart.controller.js'

const api = express.Router()

api.get('/test', test)

//CLIENT
api.post('/addCart', [validateJwt, isClient], addCart)
api.get('/getMyCarts',[validateJwt, isClient], getMyCarts )
api.put('/updateCart/:id', [validateJwt, isClient], updateCart)
api.delete('/deleteCart/:id', [validateJwt, isClient], deleteCart)
api.delete('/deleteProductInCart/:id', [validateJwt, isClient], deleteProductInCart)

export default api