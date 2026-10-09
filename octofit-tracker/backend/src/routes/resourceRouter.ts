import { Router } from 'express';
import type { Model } from 'mongoose';

export function createResourceRouter<T>(
  resourceModel: Model<T>,
  sortOrder: Record<string, 1 | -1> = {},
) {
  const router = Router();

  router.get('/', async (_request, response) => {
    response.json(await resourceModel.find().sort(sortOrder).lean().exec());
  });

  router.post('/', async (request, response) => {
    response.status(201).json(await resourceModel.create(request.body));
  });

  return router;
}