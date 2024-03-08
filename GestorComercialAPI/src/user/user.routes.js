'use strict'

import express from 'express'

import {
    deleteClient,
    deleteUser,
    login,
    register,
    test,
    updateClient,
    updateUser,
    changeRole
}from './user.controller.js'
import { isAdmin, isClient, validateJwt } from '../middleware/validate-jwt.js'

const api = express.Router()

api.get('/test',[validateJwt, isClient], test)
api.post('/register', register)
api.post('/login', login)
//ADMIN
api.put('/updateUser/:id', [validateJwt, isAdmin],updateUser)
api.delete('/deleteUser/:id', [validateJwt, isAdmin], deleteUser )
api.put('/changeRole/:id', [validateJwt, isAdmin], changeRole)
//CLIENT
api.put('/updateClient/:id', [validateJwt,isClient], updateClient)
api.delete('/deleteClient/:id', [validateJwt, isClient], deleteClient)

export default api
