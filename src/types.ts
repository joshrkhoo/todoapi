/**
 * Data
 * Datetime created
 * Datetime due
 * Title
 * Description
 * Priority
 * Status
 * Tag
 */

export type Todo = {
  userid?: string;

  todoid?: string;
  title?: string;
  description?: string;
  createdDate?: string;
  dueDate?: string;
  tag?: string;

  priority?: number;
  status?: TodoStatus;
}

/**
 * Possible statuses of a todo
 */
export enum TodoStatus {
  READY = "READY",
  IN_PROGRESS = "IN_PROGRESS",
  BLOCKED = "BLOCKED",
  DONE = "DONE"
}