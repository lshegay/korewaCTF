import { RouteHandler } from '../../utils/types.ts';
import * as jsend from '../../utils/jsend.ts';
import { storage } from '../../setup/storage.ts';

export const task: RouteHandler = async ({ searchParams }) => {
  const taskId = searchParams.get('id');

  const result = await storage.tasks.findOne({ id: taskId });
  if (!result) return jsend.fail({ id: `No such task with id ${taskId}` });

  return jsend.success(result);
};

export const tasks: RouteHandler = async ({ searchParams }) => {
  const page = parseInt(searchParams.get('page') ?? '1', 10);
  const limit = parseInt(searchParams.get('limit') ?? '10', 10);

  const result = (await storage.tasks.findMany()).slice(
    (page - 1) * limit,
    (page - 1) * limit + limit,
  );

  return jsend.success({ tasks: result });
};
