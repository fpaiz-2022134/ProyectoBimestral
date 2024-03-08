'use strict'

import User from '../user/user.model.js'
import Invoice from '../invoice/invoice.model.js'
import jwt from 'jsonwebtoken'
import {
    encrypt,
    checkPassword,
    checkUpdate
} from '../utils/validator.js'
import { generateJwt } from '../utils/jwt.js'

export const test = async (req, res) => {
    return res.send('Hello World madafaka')
}

//Default Admin

export const defaultAdmin = async (nameA, surnameA, usernameA, emailA, passwordA, phoneA, roleA) => {
    try {
        let adminFound = await User.findOne({ role: 'ADMIN' })
        if (!adminFound) {
            const data = {
                name: nameA,
                surname: surnameA,
                username: usernameA,
                email: emailA,
                password: await encrypt(passwordA),
                phone: phoneA,
                role: roleA
            }
            let user = new User(data)
            await user.save()
            return console.log('Default admin has been created.')
        } else {
            return console.log('Default admin cannot be created.')
        }

    } catch (err) {
        console.error(err)
        
    }
}

defaultAdmin('Franco ', 'Paiz', 'fpaiz', 'fpaiz@gmail.com', '87654321', '22335566', 'ADMIN')





//REGISTER
export const register = async (req, res) => {
    try {
        //User information
        let data = req.body
        //Encrypting the password
        data.password = await encrypt(data.password)
        //Rol por defecto de cliente.
        data.role = 'CLIENT'

        //Object of user
        let user = await User(data)

        //Save the user
        await user.save()
        return res.status(200).send({
            message: 'User registered successfully.'
        })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error registering user' })
    }
}

//LOGIN
export const login = async (req, res) => {
    try {
        //Body Information

        let {email, username, password } = req.body
        //Checking the user

        //Checking that the user has send the username or the email
        if (!username && !email) return res.status(400).send({ message: 'We need your username or email to login.' })


        let user = await User.findOne({
            $or: [
                { username: username },
                { email: email }
            ]
        })
        if (!user) return res.status(404).send({ message: 'User not found' })

        //Checking the password
        if (user && await checkPassword(password, user.password)) {
            let loggedUser = {
                uid: user._id,
                username: user.username,
                name: user.name,
                role: user.role
            }
            //Generate the token
            let token = await generateJwt(loggedUser)

            //Searching all the purchases and invoices of the user
            let invoices = await Invoice.find({ customer: user._id }).populate('customer', ['-_id', 'username'])
             .populate('shoppingCart', ['-_id', '-customer', '-products', '-quantity', '-total']).populate('products', ['-_id', 'name', 'price'])

             if(!invoices) return res.status(404).send({message: 'Invoices not found, you are an admin.'})
            //Respond (dar acceso)
            return res.send(
                {
                    message: `Welcome ${user.name}`,
                    loggedUser,
                    token,
                    invoices
                }
            ) 
        }

        return res.status(404).send({ message: 'Invalid credentials' })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error logging in' })
    }
}

//UPDATE client to admin

export const changeRole = async(req, res)=>{
    try {
        let {id} = req.params

        let data = req.body
        let update = checkUpdate(data.role, id)
        if (!update) return res.status(400).send({ message: 'Have submitted some data that cannot be update or missing' })

        let updatedUser = await User.updateOne(
            { _id: id },
            data,
            { new: true }
        )
        //Validation of the change role
        if (!updatedUser) return res.status(404).send({ message: 'User not found' })
        
        return res.status(200).send({message: 'The role has been changed successfully.'})
    } catch (err) {
        console.error(err)
        return res.status(500).send({message: 'Error changing role'})
    }

}

//----------------------------------------------------------------
//UPDATE for admin

export const updateUser = async (req, res) => {
    try {
        //Getting the id by the token
        let {_id } = req.user
        //Id from the user to update.   
        let { id } = req.params
        //Capturing the data
        let data = req.body

        //Validating that the user can only update his own profile or another clients
        let user = await User.findOne({_id: id})

        if((user.role == 'ADMIN') && (_id != id)) return res.status(403).send({message: 'You cannot update another admin, you can only update yourself or clients.'})

        //Checking the information is valid
        let update = checkUpdate(data, id)
        if (!update) return res.status(400).send({ message: 'Have submitted some data that cannot be update or missing' })

        //Updating the user
        let updatedUser = await User.updateOne(
            { _id: id },
            data,
            { new: true }
        )

        //Validation of the updated action
        if (!updatedUser) return res.status(404).send({ message: 'User not found' })

        return res.status(200).send({message: 'User updated successfully.'})
        
    } catch (err) {
        console.error(err)
        return res.status(500).send({message: 'Error updating the user'})
    }
}

//DELETE for admin


export const deleteUser = async(req, res)=>{
    try {
    
        //Getting the id
        let {id } = req.params
        let {_id} = req.user
        //Validating that the user can only update his own profile or another clients
        let user = await User.findOne({_id: id})
        //You CANNOT DELETE the default admin *
        if(user.username == 'fpaiz') return res.status(403).send({message: 'You cannot delete the default admin'})

        if((user.role == 'ADMIN') && (_id != id)) return res.status(403).send({message: 'You cannot update another admin, you can only update yourself or clients.'})

        // Deleting the user 
        let deletedUser = await User.findOneAndDelete(id)

        //Validation of the deleted action
        if (!deletedUser) return res.status(404).send({ message: 'User not found' })
        //Answer
        return res.send({message: `Account with username ${deletedUser.name} deleted successfully`})
    } catch (err) {
        console.error(err)
        return res.status(500).send({message: 'Error deleting account'})
    }
}

//----------------------------------------------------------------


//Update for client
// The clients are only going to update their account
//It's not necessary to send the id, it is going to use the token and get it.

export const updateClient = async(req,res) =>{
    try {

        //Getting the id of the client
        let {_id} = req.user
        //Getting the id by params
        let {id} = req.params

        //Getting the data
        let data = req.body
        //Validating that the client is the same that is updating
        if(_id != id) return res.status(401).send({message: 'You only can update your account.'})        
        //Validating the data
        let update = checkUpdate(data, id)
        if(!update) return res.status(400).send({message: 'Have submitted some data that cannot be updated or missing'})
        //Updating
        let updatedU = await User.findOneAndUpdate(
            {_id: id},
            data,
            { new: true }
        )

        //Validation of the updated action
        if (!updatedU) return res.status(404).send({ message: 'User not found' })

        //Replying 
        return res.status(200).send({message: 'User updated successfully.'})

    } catch (err) {
        console.error(err)
        return res.status(500).send({message: 'Error updating the user'})
    }
}

//Delete for client

export const deleteClient = async(req,res)=>{
    try {
        //Getting the id of the token
        let {_id} = req.user
        //Getting the id by params
        let { id} = req.params
        //Getting the password
        let {password} = req.body
        //Validating that the client cannot delete an admin
        let user = await User.findOne({_id:id})
        if(user.role == 'ADMIN') return res.status(401).send({message: 'You cannot delete an admin.'})
        //Validating that the client is the same that is updating
        if(_id != id) return res.status(401).send({message: 'You only can update your account.'}) 

        //Confirm the delete with a checkPassword
        let check = await checkPassword(password, user.password)
        if(!check) return res.status(401).send({message: 'Invalid password'})
        //Deleting the user 
        let deletedU = await User.findOneAndDelete(id)

        //Validation of the deleted action
        if (!deletedU) return res.status(404).send({ message: 'User not found' })
        //Answer
        return res.send({message: `Account with username ${deletedU.name} deleted successfully`})
    } catch (err) {
        console.error(err)
        return res.status(500).send({message: 'Error deleting account'})
    }
}

