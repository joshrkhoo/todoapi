import express from "express";
import { TodoClient } from "./client/TodoClient";
import { Todo } from "./types";

const routerFactory = (): express.Router => {
  const router = express.Router()
  const client = new TodoClient();

  const userid = 'joshua'

  /**
   * Gets a specific todo 
   */
  router.get('/:todoid', async (req, res, next) => {
    const { todoid } = req.params;

    const todo: Todo = await client.getTodo(userid, todoid)

    res.json(todo)
  })

  /**
   * Gets all todos
   */
  router.get('/', async (req, res, next) => {
    const todos: Todo[] = await client.getTodos(userid)

    res.json(todos)
  })

  /**
   * Add/edit a todo
   */
  const putTodo = async (req, res, next) => {
    const { title, description, dueDate, tag, priority, status } = req.body

    const todo: Todo = { title, description, dueDate, tag, priority, status }

    if (!todo.description) res.status(400).json('Please include a description')

    todo.userid = userid
    todo.createdDate = new Date().toISOString()

    await client.putTodo(todo)
    res.sendStatus(201)
  }
  router.put('/', putTodo)
  router.post('/', putTodo)

  /**
   * Delete todo
   */
  router.delete('/:todoid', async (req, res, next) => {
    const { todoid } = req.params;

    await client.removeTodo(userid, todoid)

    res.sendStatus(204)
  })

  return router
}

export const Router = routerFactory()