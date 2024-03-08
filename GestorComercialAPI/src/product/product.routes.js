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
    topProducts,
    searchProduct
} from './product.controller.js'

const api = express.Router()

api.get('/test', test)
api.get('/getProductByName', [validateJwt], getProductByName)
api.get('/getProducts', [validateJwt], getProducts)
api.get('/outOfStock', [validateJwt], outOfStock)
api.get('/topProducts',[validateJwt],topProducts )
api.get('/searchProduct', [validateJwt], searchProduct)
//ADMIN
api.post('/addProduct', [validateJwt, isAdmin], addProduct)
api.put('/updateProduct/:id', [validateJwt, isAdmin], updateProduct)
api.delete('/deleteProduct/:id', [validateJwt, isAdmin], deleteProduct )

//CLIENT
api.get('/getProductsByCategory', [validateJwt, isClient], getProductsByCategory)
export default api