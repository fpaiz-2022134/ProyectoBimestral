'use strict'

import Invoice from './invoice.model.js'
import ShoppingCart from '../shoppingCart/shoppingCart.model.js'
import Product from '../product/product.model.js'
import User from '../user/user.model.js'

import PDFDocument from 'pdfkit-table'

import fs from 'fs'

/* import { PDFDocument } from 'pdf-lib' */

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
            await Product.updateOne(
                { _id: products[i]._id },
                { $inc: { stock: -data.quantity[i], sold: data.quantity[i] } }
            );
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
        //Getting the data
        let data = req.body
        //Searching the invoice
        let invoice = await Invoice.findOne({ _id: id })
        if (!invoice) return res.status(404).send({ message: 'Invoice not found.' })
        //Changing the status of the invoice

        let updatedInvoice = await Invoice.updateOne(
            { _id: id },
            { status: false },
            { new: true }
        )
        if (!updatedInvoice) return res.status(400).send({ message: 'Invoice was not updated.' })
        return res.status(200).send({ message: 'Invoice was successfully updated.' })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error deleting your invoice.' })
    }
}


/* export const invoicePDF = async (req, res) => {
    try {

        //Getting the id
        let {id} = req.params

        // Load the PDF template
        const existingPdfBytes = fs.readFileSync('./src/pdfInvoice/invoice-template.pdf');

        // Create a new PDFDocument
        const pdfDoc = await PDFDocument.load(existingPdfBytes);

        // Get the first page of the document
        const pages = pdfDoc.getPages();
        const firstPage = pages[0];

        const invoice = await Invoice.findOne({_id: id})
        let shoppingCart = await ShoppingCart.findOne({_id: invoice.shoppingCart})
        // Fill out the form fields on the first page
        firstPage.getForm().getTextField('nit').setText(invoice.NIT);
        firstPage.getForm().getTextField('customer').setText(invoice.customer.name);
        firstPage.getForm().getTextField('shoppingCart').setText(shoppingCart._id);
        firstPage.getForm().getTable('items').addRow([
            invoiceObject.products[0].name,
            invoiceObject.quantity[0],
            invoiceObject.products[0].price.toFixed(2)
        ]);
        firstPage.getForm().getTextField('paymentMethod').setText(invoice.methodPayment);
        firstPage.getForm().getTextField('date').setText(invoice.date || new Date().toISOString().slice(0, 10) );
        firstPage.getForm().getTextField('total').setText(invoice.total.toFixed(2));

        // Save the new PDF
        const pdfBytes = await pdfDoc.save();

        // Specify the path to the "facturas" directory
        const facturasDirectory = './src/pdfInvoice/';

        // Ensure the "facturas" directory exists
        if (!fs.existsSync(facturasDirectory)) {
            fs.mkdirSync(facturasDirectory);
        }

        // Generate a unique filename for the invoice
        const fileName = `${Date.now()}-${invoice._id}.pdf`;

        // Write the PDF bytes to the "facturas" directory
        fs.writeFileSync(`${facturasDirectory}/${fileName}`, pdfBytes);

        // Return a response indicating success
        res.status(200).send({ message: 'Compra exitosa. La factura ha sido guardada en la carpeta "facturas".' });


    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error creating the PDF.' })
    }
}
 */


export const invoicePDF = async (req, res) => {
    try {
        let data = req.body
        const doc = new PDFDocument()
        doc.on('data')
        doc.on('end')
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error creating the PDF.' })
    }
}

// table 
import path from 'path'
import { fileURLToPath } from 'url'


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
export const createPDF = async (req, res) => {
    try {

        let { id } = req.params
        let invoice = await Invoice.findOne({ _id: id })
        let customer = await User.findOne({_id: invoice.customer})
        let products = await Product.find({ _id: { $in: invoice.products } });
        console.log(invoice.customer)
        // Crear el documento PDF
        const doc = new PDFDocument();
        const table = {
            title: "I N V O I C E",
            subtitle: "Invoice generated by Franco Paiz.",
            sections: [
                {
                    headers: ["NO. de Factura"],
                    rows: [[invoice._id]],
                },
                {
                    headers: ["Date: "],
                    rows: [[invoice.date || new Date().toISOString().slice(0, 10)]],
                },
                {
                    headers: ["NIT"],
                    rows: [[invoice.NIT]],
                },
                {
                    headers: ["Customer"],
                    rows: [[`${customer.name} ${customer.surname} |  Username: ${customer.username}  |  Email: ${customer.email}`]]
                },
                {
                    headers: ["Shopping Cart ID"],
                    rows: [[invoice.shoppingCart]],
                },
                {
                    headers: ["Product", "Price"],
                    rows: products.map(product => [product.name, product.price]),
                },
                {
                    headers: ["Quantities of products"],
                    rows: [[invoice.quantity]],
                },
                {
                    headers: ["Payment Method"],
                    rows: [[invoice.paymentMethod]],
                },
                {
                    headers: ["Total:"],
                    rows: [[invoice.total]]
                }
                // Puedes agregar más secciones según sea necesario
            ],
        };

        // Añadir el título y el subtítulo solo en la primera sección
        doc.font('Helvetica-Bold').fontSize(20).text(table.title, { align: 'left' });
        doc.font('Helvetica').fontSize(15).text(table.subtitle, { align: 'left' });

        // Añadir las secciones de la tabla al documento PDF
        table.sections.forEach(section => {
            // Añadir el título y el subtítulo solo en la primera sección

            doc.table({
                /* title: table.title,
                subtitle: table.subtitle, */
                headers: section.headers,
                rows: section.rows,
            }, {
                width: 300,
            });

            // Añadir espacio entre las secciones
            doc.moveDown();
        });

        // Especificar la ruta donde se guardará el PDF (reemplaza 'ruta/de/tu/proyecto' con la ruta correcta)
        const filePath = path.join(__dirname, '/pdfInvoice/invoice.pdf');

        // Crear un flujo de escritura para guardar el PDF en el archivo
        const writeStream = fs.createWriteStream(filePath);
        doc.pipe(writeStream);
        doc.end();

        // Esperar a que se complete la escritura y cerrar la conexión a MongoDB
        await new Promise((resolve, reject) => {
            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
        });

        // Enviar una respuesta al cliente indicando que el PDF se ha creado y guardado
        res.status(200).send({ message: 'PDF created and saved.' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send({ message: 'Error creating PDF.' });
    } /* finally {
        // Cerrar la conexión a MongoDB
        await mongoose.disconnect();
    } */
};



