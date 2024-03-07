'use strict'

import express from 'express'

import {
    validateJwt,
    isClient
} from '../middleware/validate-jwt.js'

import {
    test,
    addCart,
    getMyCarts
} from './shoppingCart.controller.js'

const api = express.Router()

api.get('/test', test)

//CLIENT
api.post('/addCart', [validateJwt, isClient], addCart)
api.get('/getMyCarts',[validateJwt, isClient], getMyCarts )

export default api