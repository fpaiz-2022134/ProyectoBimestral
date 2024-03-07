//Configuraciones e importaciones para express.

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { config } from 'dotenv'

import userRoutes from '../src/user/user.routes.js'
import categoryRoutes from '../src/category/category.routes.js'
import productRoutes from '../src/product/product.routes.js'
import shoppingRoutes from '../src/shoppingCart/shoppingCart.routes.js'
import invoiceRoutes from '../src/invoice/invoice.routes.js'
//Configuraciones

const app = express() //Creamos el servidor
config()

const port = process.env.PORT || 3200

//Configuramos el servidor de express

app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(cors()) //Acepta o reniega las solicitudes.
app.use(helmet()) //Seguridad
app.use(morgan('dev'))


//Declaramos rutas
app.use('/user', userRoutes)
app.use('/category', categoryRoutes)
app.use('/product', productRoutes)
app.use('/shoppingCart', shoppingRoutes)
app.use('/invoice', invoiceRoutes)
//Levantamos el servidor

export const initServer = () => {
    app.listen(port)
    console.log(`Server HTTP running in port ${port}`)

}

