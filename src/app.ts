/**
 * Functionality
 * Add
 * Edit
 * Remove
 * 
 *
 * Data
 * Datetime created
 * Datetime due
 * Title
 * Description
 * Priority
 * Status
 * Tag
 */

import dotenv from 'dotenv';
import express from 'express';
if (process.env.NODE_ENV !== 'production') {
  var envResult = dotenv.config();
  if (envResult.error) {
    throw envResult.error
  }
}

import { Router } from './Router';
const app = express()

import cors from 'cors'
const originList = [
  'http://localhost:3000',
  'http://joshrkhoo-todo-app.s3-website-ap-southeast-2.amazonaws.com'
]
app.use(cors({
  origin: originList
}));

app.use(express.json())

app.use((req, res, next) => {
  console.log(req.method + ": " + req.path)
  next()
})

app.use('/', Router)

// const port = process.env.PORT || 6002;
// app.listen(port, () => console.log(`Running on port ${port} on environment ${process.env.NODE_ENV}`))

export default app