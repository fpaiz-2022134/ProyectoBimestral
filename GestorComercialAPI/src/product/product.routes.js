'use strict'

//Routes

import {
    validateJwt,
    isAdmin,
    isClient
} from '../middleware/validate-jwt.js'

import express from 'express'

import {
    test,
    addProduct,
    getProductByName,
    getProducts,
    getProductsByCategory,
    updateProduct,
    deleteProduct,
    outOfStock,
    topProducts
} from './product.controller.js'

const api = express.Router()

api.get('/test', test)
api.get('/getProductByName', [validateJwt], getProductByName)
api.get('/getProducts', [validateJwt], getProducts)
//ADMIN
api.post('/addProduct', [validateJwt, isAdmin], addProduct)
api.put('/updateProduct/:id', [validateJwt, isAdmin], updateProduct)
api.delete('/deleteProduct/:id', [validateJwt, isAdmin], deleteProduct )
api.get('/outOfStock', [validateJwt, isAdmin], outOfStock)
api.get('/topProducts',[validateJwt, isAdmin],topProducts )
//CLIENT
api.get('/getProductsByCategory', [validateJwt, isClient], getProductsByCategory)
export default api