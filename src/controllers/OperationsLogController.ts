import { Request, Response } from 'express';
import { OperationsLogService } from '../services/OperationsLogService';
import { Cache } from '../services/Cache';

class OperationsLogController {
  async make(req: Request, res: Response): Promise<Response> {
    try {
      const operationsLogService = new OperationsLogService;
      const operation = req.body.operation;
      // const { userId } = await Cache.get(req.headers['x-access-token'] as string);
      const userId = '0';
      const response = await operationsLogService.make(operation, userId as string);
      return res.json(response);
    } catch (e: any) {
      return res.status(e.code ?? 500).json({
        message: e.message ?? 'error'
      });
    }
  }

  async list(req: Request, res: Response): Promise<Response> {
    try {
      if (req.headers['x-user-type'] === 'admin') {
        const operationsLogService = new OperationsLogService;
        const response = await operationsLogService.list(req.query);
        return res.json(response);
      } else {
        throw { status: -1, code: 401, message: 'Unauthorized!' };
      }
    } catch (e: any) {
      return res.status(e.code ?? 500).json({
        message: e.message ?? 'error'
      });
    }
  }
}

export { OperationsLogController };
