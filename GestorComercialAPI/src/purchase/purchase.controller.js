'use strict'

import Purchase from './purchase.model.js'
import ShoppingCart from '../shoppingCart/shoppingCart.model.js'
import Product from '../product/product.model.js'

export const test = (req, res) => {
    return res.send('Hello World')
}

export const addPurchase = async (req, res) => {
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

        //Creating the purchase
        let purchase = new Purchase(data)
        //Saving the purchase
        await purchase.save()
        return res.status(200).send({message: 'The purchase has been made successfully.'})

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