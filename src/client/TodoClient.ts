import { ConditionalCheckFailedException, DeleteItemCommand } from "@aws-sdk/client-dynamodb"
import { GetCommand, PutCommand, QueryCommand, QueryCommandInput, UpdateCommand } from "@aws-sdk/lib-dynamodb"
import { randomUUID } from "crypto"
import { BadRequestError, StatusType } from "../Error"
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
  
  // This function gets all the todos for a specific userid 
    // The promise is an array of todo items (this is because we want to get all todos created by this user) 
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

  // this function gets the todo of a specific id
    // the promise is a single Todo object (what we should retrieve from the DynamoDB and return)
  async getTodo(userid: string, todoid: string): Promise<Todo> {

    // if userid does not exist then throw error and request for it
    if (!userid) throw new BadRequestError('give userid')
    // if todoid does not exist then throw error and request for it
    if (!todoid) throw new BadRequestError('give todoid')

    // calls the AWS DynamoDB and uses the send method to fetch an item from the DynamoDB table
    const response = await DynamoDocumentClient.send(new GetCommand({
      // this is the name of the DynamoDB table where the todo item is stored 
      TableName: this.table,
      // this is the primary key of the item to be fetched 
        // userid is the partition key and todoid is the sortkey
      Key: { userid, todoid }
    }))

    // here we return the item retrieved from the db as a Todo object
      // once this is done we return to the function that called this function - router.ts file
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

    delete todo.userid
    delete todo.todoid

    const expressions = generateExpressionsFromItem(todo)
    expressions.ExpressionAttributeValues[':todoid'] = todoid

    console.log(expressions.ExpressionAttributeValues[':todoid'])

    try {
      await DynamoDocumentClient.send(new UpdateCommand({
        ...expressions,
        TableName: this.table,
        Key: { userid, todoid },
        ConditionExpression: 'todoid = :todoid'
      }))
    } catch(error) {
      if (error instanceof ConditionalCheckFailedException) {
        throw new BadRequestError()
      }
      throw error;
    }
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

