/*
    Programador: Franco Paiz
    Carnet: 2022134
    Sección: IN6AV
*/ 

//Ejecutaremos los servicios

import { initServer } from './configs/app.js'
import { connect } from './configs/mongo.js'

initServer()
connect()