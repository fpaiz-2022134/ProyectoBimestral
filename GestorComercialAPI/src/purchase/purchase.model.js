'use strict'

import {model, Schema} from 'mongoose'

const purchaseSchema = Schema ({
    customer: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    shoppingCart: {
        type: Schema.Types.ObjectId,
        ref:'shoppingCart',
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    paymentMethod: {
        type: String,
        required: true,
        uppercase: true,
        enum: ['VISA', 'MASTERCARD', 'AMERICAN EXPRESS', 'CASH']
    },
    total: {
        type: Number,
        required: true
    }
})

export default model('purchase', purchaseSchema)