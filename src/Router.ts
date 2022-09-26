import { randomUUID } from "crypto";
import express from "express";
import { TodoClient } from "./client/TodoClient";
import { Todo, TodoStatus } from "./types";

const checkTodoStatus = (todo: Todo): void => {
  if (!Object.values(TodoStatus).includes(todo.status)) {
    delete todo.status
  }
}

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
   * Edit a todo
   */
  router.patch('/:todoid', async (req, res, next) => {
    const { title, description, dueDate, tag, priority, status } = req.body

    let todo: Todo = { title, description, dueDate, tag, priority, status }
    todo = Object.fromEntries(Object.entries(todo).filter(([_, v]) => v != null))
    checkTodoStatus(todo)
    const todoid = req.params.todoid
    todo.userid = userid
    todo.todoid = todoid

    console.log(todo)

    await client.patchTodo(todo)
    res.sendStatus(200)
  })

  /**
   * Add a todo
   */
  router.post('/', async (req, res, next) => {
    const { title, description, dueDate, tag, priority, status } = req.body

    const todo: Todo = { title, description, dueDate, tag, priority, status }

    if (!todo.description) res.status(400).json('Please include a description')
    checkTodoStatus(todo)

    todo.userid = userid
    todo.todoid = randomUUID();
    todo.createdDate = new Date().toISOString()

    await client.putTodo(todo)
    res.sendStatus(201)
  })

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