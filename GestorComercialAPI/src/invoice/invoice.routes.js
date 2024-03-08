'use strict'

import {
    validateJwt,
    isClient,
    isAdmin
} from '../middleware/validate-jwt.js'

import express from 'express'

import {
    test,
    addInvoice,
    getMyInvoices,
    updateInvoice,
    disableInvoice,
    invoicePDF,
    createPDF
}from './invoice.controller.js'

const api = express.Router()


api.get('/test', test)

//CLIENT
api.post('/addInvoice', [validateJwt, isClient], addInvoice)
api.get('/getMyInvoices', [validateJwt, isClient], getMyInvoices)
api.put('/updateInvoice/:id', [validateJwt, isAdmin], updateInvoice)
api.put('/disableInvoice/:id',[validateJwt, isAdmin], disableInvoice)
/* api.post('/invoicePDF/:id',[validateJwt, isClient],  invoicePDF) */
api.get('/createPDF/:id', createPDF)
export default api