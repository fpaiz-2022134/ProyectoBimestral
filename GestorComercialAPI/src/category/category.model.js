'use strict'

import { Schema, model } from "mongoose"

const categorySchema = Schema ({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    clasification: {
        type: String,
        uppercase: true,
        enum: ['CATEGORY', 'DEFAULT'],
        required: true
    }
    
})

export default model('category', categorySchema)
