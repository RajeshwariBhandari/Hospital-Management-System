import express from 'express'
const app = express()
import dotenv from 'dotenv'
dotenv.config()

import connectDB from './db/connect.js'

import notFoundMiddleware from './middleware/not-found.js'
import errorHandlerMiddleware from './middleware/error-handle.js'

import passport from 'passport'

import userRouter from './routes/userRoutes.js'
import patientRouter from './routes/patientRoutes.js'

connectDB.connect(function(error){
    if(error)throw error
    else console.log("connected to database successfully")
})

app.use(express.json())
app.get('/',(req,res)=>{
    res.send('welcome')
})

app.use('/user', userRouter)

app.use('/patient', patientRouter)

app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware)
const port = process.env.PORT
app.listen(port,()=>{
    console.log(`server started on ${port}`)
})

