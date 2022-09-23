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
  todoid: string;
  title: string;
  description: string;
  createdDate: string;
  dueDate: string;
  tag: string;

  priority: number;
  status: TodoStatus;
}

export type TodoStatus = "READY" | "IN_PROGRESS" | "BLOCKED" | "DONE";