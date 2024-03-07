'use strict'

import express from 'express'

import ShoppingCart from './shoppingCart.model.js'
import Product from '../product/product.model.js'
import { checkUpdate } from '../utils/validator.js'

export const test = (req, res) => {
    return res.send('Hello World')
}

export const addCart = async (req, res) => {
    try {
        //Capturing the id of the user
        let { _id } = req.user
        //Capturing the information
        let data = req.body
        console.log(data.quantity)
        //Searching the id of the product to set the stock and sold.
        let products = await Product.find({ _id: data.products })
        console.log(products)
        //Checking if the products exists
        if (!products) return res.status(404).send({ message: 'A product does not exist' })

        //Checking if the stock of the products is zero
        for (let i = 0; i < products.length; i++) {
            if (products[i].stock == 0) return res.status(400).send({ message: 'The product is not in stock' })
        }



        //Checking if the product is already in the cart
        for (let i = 0; i < products.length; i++) {
            if (products[i]._id == data.products[i]) return res.status(400).send({ message: 'The product is already in the cart' })
        }
        //Checking if the array of product is in stock
        for (let i = 0; i < products.length; i++) {
            console.log(products[i].stock)
            console.log(data.quantity[i])
            if (products[i].stock < data.quantity[i]) return res.status(400).send({ message: 'Quantity of product not available.' })
        }


        //Updating the stock and sold fields
        /* for (let i = 0; i < products.length; i++) {
            products[i].stock -= data.quantity[i];
            products[i].sold += data.quantity[i];
            await Product.updateOne({ _id: products[i]._id }, { $set: { stock: products[i].stock, sold: products[i].sold } });
        } */

        //Calculating the total of the cart by the price of the product and the quantity
        let total = 0
        for (let i = 0; i < products.length; i++) {
            total += products[i].price * data.quantity[i]
        }

        //Setting the total of the product
        data.total = total
        //Setting the costumer
        data.customer = _id

        //Creating the product with the information
        let shoppingCart = new ShoppingCart(data)
        //Saving information
        await shoppingCart.save()
        //Replying
        return res.status(200).send({ message: 'Shopping cart added successfully' })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error creating your shopping cart.' })
    }
}
export const getMyCarts = async (req, res) => {
    try {
        //Getting the id
        let { _id } = req.user
        //Getting the carts
        let carts = await ShoppingCart.find({ customer: _id }).populate('products', ['name', 'price', '-_id']).populate('customer', ['-_id', 'username'])

        return res.send(carts)
    } catch (err) {
        console.err(err)
        return res.status(500).send({ message: 'Error getting the shopping carts.' })
    }
}



export const updateCart = async (req, res) => {
    try {
        //Getting the id of the user
        let { _id } = req.user
        //Getting the id of the shopping cart
        let { id } = req.params
        //Getting the data 
        let data = req.body
        //Validating the existence of the cart
        let cart = await ShoppingCart.findOne({ _id: id })
        if (!cart) return res.status(404).send({ message: 'Shopping cart is not found.' })

        //Searching the id of the product to set the stock and sold.
        let products = await Product.find({ _id: data.products })
        console.log(products)

        for (let i = 0; i < products.length; i++) {
            if (products[i].stock == 0) return res.status(400).send({ message: 'The product is not in stock' })
        }

        //Checking if the array of product is in stock
        for (let i = 0; i < products.length; i++) {
            console.log(products[i].stock)
            console.log(data.quantity[i])
            if (products[i].stock < data.quantity[i]) return res.status(400).send({ message: 'Quantity of product not available.' })
        }

        //Checking that the user is updating his own cart
        if (cart.customer.toString() != _id.toString()) return res.status(401).send({ message: 'You cannot update the cart of another people.' })

        //Updating the total

            let total = 0
            for (let i = 0; i < products.length; i++) {
                total += products[i].price * data.quantity[i]

                data.total = total
            }

        //Checking the update
        let update = checkUpdate(data, id)
        if (!update) return res.status(400).send({ message: 'Have submitted some data that cannot be updated or missing' })

        //Updating the cart
        let updatedCart = await ShoppingCart.updateOne(
            { _id: id },
            data,
            { new: true }
        ).populate('products', ['name', 'price', '-_id']).populate('customer', ['-_id', 'username'])
        //Validating the update action
        if (!updatedCart) return res.status(404).send({ message: 'Shopping cart not found' })
        //Replying
        return res.status(200).send({ message: `Shopping cart added successfully ${updatedCart}`})

    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error updating the shopping cart.' })

    }
}



export const deleteCart = async (req, res) => {
    try {
        //Getting the id of the shopping cart
        let { id } = req.params
        //Getting the id of the user
        let { _id } = req.user
        //Validating the existence of the cart
        let cart = await ShoppingCart.findOne({ _id: id })
        if (!cart) return res.status(404).send({ message: 'Shopping cart not found' })
        //Checking that the user is deleting his own cart
        if (cart.customer.toString() != _id.toString()) return res.status(401).send({ message: 'You cannot delete the cart of another user.' })
        //Deleting the cart
        await ShoppingCart.deleteOne({ _id: id })
        //Replying
        return res.status(200).send({ message: 'Shopping cart deleted successfully' })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error deleting the shopping cart.' })
    }
}
