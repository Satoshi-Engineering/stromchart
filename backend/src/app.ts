import bodyParser from 'body-parser'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dummy from './api/dummy'
import prices from './api/prices'
import xstAttack from './xstAttack'

const app = express()
app.use(bodyParser.json())
app.use(cors())
app.use(helmet())
app.use(xstAttack())
app.use('/api/dummy', dummy)
app.use('/api/prices', prices)

export default app
