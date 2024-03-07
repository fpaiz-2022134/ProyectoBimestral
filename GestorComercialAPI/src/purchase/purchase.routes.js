'use strict'

import {
    validateJwt,
    isClient
} from '../middleware/validate-jwt.js'

import express from 'express'

import {
    test,
    addPurchase
}from './purchase.controller.js'

const api = express.Router()


api.get('/test', test)

//CLIENT
api.post('/addPurchase', [validateJwt, isClient], addPurchase)

export default api