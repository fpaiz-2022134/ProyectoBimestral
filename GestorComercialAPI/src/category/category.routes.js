'use strict'

//Category routes

import {
    validateJwt,
    isAdmin,
    isClient
}from '../middleware/validate-jwt.js'

import express from 'express'

import {
    test,
    addCategory,
    getAllCategories,
    updateCategory,
    deleteCategory
} from './category.controller.js'

const api = express.Router()

api.get('/test', test)

//ADMIN
api.post('/addCategory', [validateJwt, isAdmin], addCategory)
api.get('/getAllCategories', [validateJwt, isAdmin], getAllCategories)
api.put('/updateCategory/:id', [validateJwt, isAdmin], updateCategory)
api.delete('/deleteCategory/:id', [validateJwt, isAdmin], deleteCategory)

export default api