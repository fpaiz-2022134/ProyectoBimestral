'use strict'

import Invoice from './invoice.model.js'
import ShoppingCart from '../shoppingCart/shoppingCart.model.js'
import Product from '../product/product.model.js'

import {
    checkUpdate
} from '../utils/validator.js'

export const test = (req, res) => {
    return res.send('Hello World')
}

export const addInvoice = async (req, res) => {
    try {
        //Getting the data
        let data = req.body
        //Getting the id of the user
        let { _id } = req.user
        //Setting the customer
        data.customer = _id
        //Searching the shopping cart to get information
        let cart = await ShoppingCart.findOne({ _id: data.shoppingCart })
        if (!cart) return res.status(404).send({ message: 'Shopping cart is not found.' })
        //Checking that the user is buying his own cart
        if (cart.customer.toString() != _id.toString()) return res.status(401).send({ message: 'You cannot add this cart because it does not own you.' })
        //Setting the total
        data.total = cart.total
        //Updating the stock and sold of the product
        let products = await Product.find({ _id: cart.products })
        //Updating the stock and sold fields
        for (let i = 0; i < products.length; i++) {
            products[i].stock -= cart.quantity[i];
            products[i].sold += cart.quantity[i];
            await Product.updateOne({ _id: products[i]._id }, { $set: { stock: products[i].stock, sold: products[i].sold } });
        }

        //Setting the products and quantity values from the cart
        data.products = cart.products
        data.quantity = cart.quantity


        

        //Creating the invoice
        let invoice = new Invoice(data)
        //Saving the invoice
        await invoice.save()

        let showInvoice = await Invoice.findOne({ _id: invoice.id }).populate('customer', ['-_id', 'name', 'username', 'email'])
            .populate('shoppingCart', ['-_id', '-customer', '-products', '-quantity', '-total']).populate('products', ['-_id', 'name', 'price'])

        return res.send(showInvoice)

        /*   // Load the PDF template
        const existingPdfBytes = fs.readFileSync('path/to/invoice-template.pdf');
  
        // Create a new PDFDocument
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
  
        // Get the first page of the document
        const pages = pdfDoc.getPages();
        const firstPage = pages[0];
  
        // Fill out the form fields on the first page
        firstPage.getForm().getTextField('name').setText(purchase.customer.name);
        firstPage.getForm().getTextField('date').setText(new Date().toISOString().slice(0, 10));
        firstPage.getForm().getTable('items').addRow([
          purchase.product[0].name,
          purchase.quantity[0],
          purchase.product[0].price.toFixed(2)
        ]);
        firstPage.getForm().getTextField('total').setText(purchase.total.toFixed(2));
  
        // Save the new PDF
        const pdfBytes = await pdfDoc.save();
  
        // Send the new PDF as a response
        res.setHeader('Content-Type', 'application/pdf');
        res.send(pdfBytes); 
        
        ---------------Saving the pdf ----------
        // Save the new PDF
  const pdfBytes = await pdfDoc.save();
  
  // Specify the path to the "facturas" directory
  const facturasDirectory = './facturas';
  
  // Ensure the "facturas" directory exists
  if (!fs.existsSync(facturasDirectory)) {
    fs.mkdirSync(facturasDirectory);
  }
  
  // Generate a unique filename for the invoice
  const fileName = `${Date.now()}-${purchase._id}.pdf`;
  
  // Write the PDF bytes to the "facturas" directory
  fs.writeFileSync(`${facturasDirectory}/${fileName}`, pdfBytes);
  
  // Return a response indicating success
  res.status(200).send({ message: 'Compra exitosa. La factura ha sido guardada en la carpeta "facturas".' });
        
        */

    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error doing your shop.' })
    }
}

export const getMyInvoices = async (req, res) => {
    try {
        //Getting the id of the customer
        let { _id } = req.user
        //Getting the invoices  by the id
        let invoices = await Invoice.find({ customer: _id }).populate('customer', ['-_id', 'username'])
            .populate('shoppingCart', ['-_id', '-customer', '-products', '-quantity', '-total']).populate('products', ['-_id', 'name', 'price'])

        return res.send(invoices)
        /* const invoiceAndShopping = []

        for (const invoice of invoices) {
            const shopping = await ShoppingCart.find({ _id: invoice.shoppingCart._id })
                .populate('customer', ['-_id', 'username'])
                .populate('products', ['-_id', 'name', 'price'])

            invoiceAndShopping.push({
                invoice,
                shopping
            })

            return res.send(invoiceAndShopping)
        }

        return res.send(invoiceAndShopping) */
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error getting your invoices.' })
    }
}


//Updating the invoice
export const updateInvoice = async (req, res) => {
    try {
        //Getting the id of the invoice
        let { id } = req.params
        //Getting th new data
        let data = req.body
        
        //Searching the id of the product to set the stock and sold.
        let products = await Product.find({ _id: data.products })
        console.log(products)

        for (let i = 0; i < products.length; i++) {
            if (products[i].stock <= 0) return res.status(400).send({ message: 'The product is not in stock' })
        }

        //Checking if the array of product is in stock
        for (let i = 0; i < products.length; i++) {
            console.log(products[i].stock)
            console.log(data.quantity[i])
            if (products[i].stock < data.quantity[i]) return res.status(400).send({ message: 'Quantity of product not available.' })
        }
        //Updating the stock and sold fields
        for (let i = 0; i < products.length; i++) {
            products[i].stock -= data.quantity[i];
            products[i].sold += data.quantity[i];
            await Product.updateOne({ _id: products[i]._id }, { $set: { stock: products[i].stock, sold: products[i].sold } });
        }

        //Updating the total

        let total = 0
        for (let i = 0; i < products.length; i++) {
            total += products[i].price * data.quantity[i]

            data.total = total
        }
        //Checking if the data is valid
        let update = checkUpdate(data, id)
        if (!update) return res.status(400).send({ message: 'Have submitted some data that cannot be update or missing.' })
        //Updating the invoice
        let updatedInvoice = await Invoice.updateOne(
            { _id: id },
            data,
            { new: true }
        )
        if (!updatedInvoice) return res.status(400).send({ message: 'Invoice was not updated.' })
        return res.status(200).send({ message: 'Invoice was successfully updated successfully.' })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error updating your invoice.' })

    }
}




//Deleting the purchase
export const disableInvoice = async (req, res) => {
    try {
        //Getting the id
        let { id } = req.params
        //Changing the role
        
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error deleting your purchase.' })
    }
}





