'use strict'

import { checkUpdate } from '../utils/validator.js'
import Category from './category.model.js'

export const test = (req, res) => {
    return res.send('Hello World')
}


export const defaultCategory = async (nameC, descriptionC) => {
    try {
        const categoryFound = await Category.findOne({ clasification: 'CATEGORY' })
        const categoryDFound = await Category.findOne({clasification: 'DEFAULT'})
        if (!categoryFound && !categoryDFound) {
            const data = {
                name: nameC,
                description: descriptionC,
                clasification: 'DEFAULT'
            }
            const category = new Category(data)
            await category.save()
            return console.log('Default category has been created.')
        } else {
            return console.log('Default category cannot be created.')
        }

    } catch (err) {
        console.error(err)
        
    }
}

defaultCategory('Predeterminado', 'Ninguno')

export const addCategory = async (req, res) => {
    try {
        //Capturing the info
        let data = req.body
        //Add the clasification
        data.clasification = 'CATEGORY'      
        //Creating the category with the information
        let category = new Category(data)
        //Saving information
        await category.save()
        //Replying
        return res.status(200).send({ message: 'Category added successfully' })
    } catch (err) {
        console.log(err)
        return res.status(500).send({ message: 'Error creating the category.' })
    }
}

//Get all the categories

export const getAllCategories = async (req,res )=>{
    try {
        const categories = await Category.find()
        return res.send(categories)
    } catch (err) {
        console.error(err)
        return res.status(500).send({message: 'Error getting the categories.'})
    }

}

//UPDATE for category

export const updateCategory = async(req, res)=>{
    try {
        //Capturing the information
        let data = req.body
        //Getting the id of the category
        let { id} = req.params
        //Checking the information
        let update = checkUpdate(data, id)
        if(!update) return res.status(400).send({message: 'Have submitted some data that cannot be updated or missing'})

        //Updating the category
        let updatedCategory = await Category.updateOne(
            {_id: id},
            data,
            {new: true}
        )
        //Validation of the updated action
        if (!updatedCategory) return res.status(404).send({ message: 'User not found' })
        //Replying
        return res.status(200).send({ message: 'Category updated successfully.' })
        

    } catch (err) {
        console.error(err)
        return res.status(500).send({message: 'Error updating the information for the category.'})
    }
}
