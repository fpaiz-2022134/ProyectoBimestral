'use strict'

import {model, Schema} from 'mongoose'

const shoppingCartSchema = Schema ({
    customer: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    products: {
        type:[{
            type: Schema.Types.ObjectId,
            ref: 'product',
            required:true
        }]
    },
    quantity: {
        type: [{
            type: Number,
            required: true
        }]
    },
    total: {
        type: Number,
        required: true
    }
})

export default model ('shoppingCart', shoppingCartSchema)

//Updating the stock and sold fields
        /* for (let i = 0; i < products.length; i++) {
            products[i].stock -= data.quantity[i];
            products[i].sold += data.quantity[i];
            await Product.updateOne({ _id: products[i]._id }, { $set: { stock: products[i].stock, sold: products[i].sold } });
        } */
