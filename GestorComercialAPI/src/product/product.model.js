'use strict'

import {Schema, model} from 'mongoose'

const productSchema = Schema({
    name:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'category',
        required: true
    },
    stock:{
        type: Number,
        required: true
    },
    sold: {
        type: Number,
        required: true
    }
})

export default model('product', productSchema)