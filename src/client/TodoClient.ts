import { DeleteItemCommand } from "@aws-sdk/client-dynamodb"
import { GetCommand, PutCommand, QueryCommand, QueryCommandInput, UpdateCommand } from "@aws-sdk/lib-dynamodb"
import { randomUUID } from "crypto"
import { BadRequestError } from "../Error"
import { Todo } from "../types"
import { DynamoDocumentClient } from "./DynamoDB"

/**
 * Functionality
 * Add
 * Edit
 * Remove
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

const generateExpressionsFromItem= (item) => {
  console.log(item)
  let UpdateExpression = 'set';

  let ExpressionAttributeNames = {};
  let ExpressionAttributeValues = {};

  for (const property in item) {
    UpdateExpression += ` #${property} = :${property} ,`;
    ExpressionAttributeNames['#' + property] = property;
    ExpressionAttributeValues[':' + property] = item[property];
  }
  UpdateExpression = UpdateExpression.slice(0, -1);

  return { UpdateExpression, ExpressionAttributeNames, ExpressionAttributeValues }
}


/**
 * TodoClient
 * 
 * Connects the server to the DynamoDB database
 * Provides functionality for interacting with the database
 */
export class TodoClient {
  // Name of the DynamoDB table for todos
  table: string = process.env['TODO_TABLE_NAME'] || 'todoapi-todo'

  /**
   * Gets todo for a user
   * @param userid that we are getting todo data for
   */
  async getTodos(userid: string): Promise<Todo[]> {
    if (!userid) throw new BadRequestError('give userid')

    const params: QueryCommandInput = {
      TableName: this.table,
      KeyConditionExpression: "userid = :userid",
      ExpressionAttributeValues: {
        ":userid": userid
      }
    }

    const response = await DynamoDocumentClient.send(new QueryCommand(params))
    return response.Items as Todo[]
  }

  /**
   * Gets a specific todo
   * @param userid
   * @param todoid 
   */
  async getTodo(userid: string, todoid: string): Promise<Todo> {
    if (!userid) throw new BadRequestError('give userid')
    if (!todoid) throw new BadRequestError('give todoid')

    const response = await DynamoDocumentClient.send(new GetCommand({
      TableName: this.table,
      Key: { userid, todoid }
    }))
    return response.Item as Todo
  }

  /**
   * Adds/replaces todo
   * 
   * @param todo 
   * @pre todo must have userid
   */
  async putTodo(todo: Todo): Promise<void> {
    if (!todo.userid) throw new BadRequestError('give userid')
    if (!todo.todoid) throw new BadRequestError('give todoid')

    await DynamoDocumentClient.send(new PutCommand({
      TableName: this.table,
      Item: todo
    }))
  }

  async patchTodo(todo: Todo): Promise<void> {
    if (!todo.userid) throw new BadRequestError('give userid')
    if (!todo.todoid) throw new BadRequestError('give todoid')

    const userid = todo.userid;
    const todoid = todo.todoid;

    delete todo.todoid;
    delete todo.userid

    await DynamoDocumentClient.send(new UpdateCommand({
      ...generateExpressionsFromItem(todo),
      TableName: this.table,
      Key: { userid, todoid }
    }))
  }

  /**
   * Remove todo
   * 
   * @param userid
   * @param todoid
   */
  async removeTodo(userid: string, todoid: string): Promise<void> {
    await DynamoDocumentClient.send(new DeleteItemCommand({
      TableName: this.table,
      Key: {
        userid: { S: userid },
        todoid: { S: todoid }
      }
    }))
  }
}

