import { Request, Response } from 'express';
import { OperationsLogService } from '../services/OperationsLogService';

class OperationsLogController {
  private operationsLogService: OperationsLogService;
  constructor() {
    this.operationsLogService = new OperationsLogService;
  }

  async make(req: Request, res: Response): Promise<Response> {
    try {
      const response = await this.operationsLogService.make(req.body.operation);
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
