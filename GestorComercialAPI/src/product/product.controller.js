    'use strict'


import Product from './product.model.js'
import {checkUpdate} from '../utils/validator.js'

export const test = (req, res)=>{
    return res.send('Hello World')
}


export const addProduct = async(req, res) =>{
    try {
        //Capturing the information
        let data = req.body
        //Setting the sold 
        data.sold = 0
        //Creating the product with the information
        let product = new Product(data)
        //Saving information
        await product.save()
        //Replying
        return res.status(200).send({message: 'Product added successfully'})
    } catch (err) {
        console.log(err)
        return res.status(500).send({message: 'Error creating the product.'})
    }
}

//Get products by name

export const getProductByName = async(req, res)=>{
    try {
        let {name} = req.body
        let products = await Product.find({name})

        return res.status(200).send(products)
    } catch (err) {
        console.error(err)
        return res.status(500).send({message: 'Error getting the product.'})
    }
}

//Get all products

export const getProducts = async(req, res)=>{
    try {
        let products = await Product.find()
        return res.send(products)
    } catch (err) {
        console.error(err)
        return res.status(500).send({message: 'Error getting the products.'})
    }
}

//Get product by category(Client)

export const getProductsByCategory = async(req, res)=>{
    try {
        //Capturing the category
        let { category } = req.body
        //Finding by category
        let products = await Product.find({category})
        //Returning the products
        return res.send(products)
    } catch (err) {
        console.error(err)
        return res.status(500).send({message: 'Error getting the products.'})
    }
}

//UPDATE products for ADMIN
export const updateProduct = async(req, res)=>{
    try {
        //Getting the data
        let data = req.body
        //Getting the id of the product
        let { id } = req.params
        //Checking if the data is valid
        let update = checkUpdate(data, id)
        if (!update) return res.status(400).send({message: 'Have submitted some data that cannot be update or missing.'})
        //Updating the product
        let updatedProduct = await Product.updateOne(
            {_id: id},
            data,
            {new: true}
        )
        //Validation of the updated action that we made
        if(!updatedProduct) return res.status(400).send({message: 'Product not found'})
        return res.status(200).send({message: 'The product has been updated successfully'})
    } catch (err) {
        console.error(err)
        return res.status(500).send({message: 'Error updating the product'})
    }
}

export const deleteProduct = async(req, res) =>{
    //Getting the id of the product
    let { id } = req.params
    //Finding and deleting the product by the id
    let deletedProduct = await Product.findByIdAndDelete({_id: id})
    // Verifying the delete action
    if(!deletedProduct) return res.status(400).send({message: 'Product not found'})
    //Replying
    return res.status(200).send({message: 'The product has been deleted successfully'})
}







