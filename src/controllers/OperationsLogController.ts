import { Request, Response } from 'express';
import { OperationsLogService } from '../services/OperationsLogService';
import { Cache } from '../services/Cache';

class OperationsLogController {
  private operationsLogService: OperationsLogService;
  constructor() {
    this.operationsLogService = new OperationsLogService;
  }

  async make(req: Request, res: Response): Promise<Response> {
    try {
      const operation = req.body.operation;
      const { userId } = await Cache.get(req.headers['x-access-token'] as string);
      const response = await this.operationsLogService.make(operation, userId as string);
      return res.json(response);
    } catch (e: any) {
      return res.status(e.code ?? 500).json({
        message: e.message ?? 'error'
      });
    }
  }

  async list(req: Request, res: Response): Promise<Response> {
    try {
      const response = await this.operationsLogService.list(req.query);
      return res.json(response);
    } catch (e: any) {
      return res.status(e.code ?? 500).json({
        message: e.message ?? 'error'
      });
    }
  }
}

export { OperationsLogController };
