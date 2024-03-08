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

//ADMIN AND CLIENT
api.get('/getAllCategories', [validateJwt], getAllCategories)

//ADMIN
api.post('/addCategory', [validateJwt, isAdmin], addCategory)
api.put('/updateCategory/:id', [validateJwt, isAdmin], updateCategory)
api.delete('/deleteCategory/:id', [validateJwt, isAdmin], deleteCategory)


export default api