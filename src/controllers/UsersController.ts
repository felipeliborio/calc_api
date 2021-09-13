import { Request, Response, NextFunction } from 'express';
import { IUser, UsersService } from '../services/UsersService';

class UsersController {
  async create(req: Request, res: Response): Promise<Response> {
    try {
      if (req.headers['x-user-type'] === 'admin') {
        const usersService = new UsersService;
        const response = await usersService.create(req.body);
        return res.json(response);
      } else {
        throw { status: -1, code: 401, message: 'Unauthorized!' };
      }
    } catch (e: any) {
      return res.status(e.code ?? 500).json(e);
    }
  }

  async login(req: Request, res: Response): Promise<Response> {
    try {
      const usersService = new UsersService;
      const response = await usersService.login(req.body);
      return res.json(response);
    } catch (e: any) {
      return res.status(e.code ?? 500).json(e);
    }
  }

  async auth(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.headers['x-access-token'] as string;
      const usersService = new UsersService;
      const session = await usersService.auth(token);
      req.headers['x-user-type'] = session.type;
      next();
    } catch (e: any) {
      return res.status(e.code ?? 500).json(e);
    }
  }

  async list(req: Request, res: Response) {
    try {
      if (req.headers['x-user-type'] === 'admin') {
        const usersService = new UsersService;
        const response = await usersService.list();
        return res.json(response);
      } else {
        throw { status: -1, code: 401, message: 'Unauthorized!' };
      }
    } catch (e: any) {
      return res.status(e.code ?? 500).json(e);
    }
  }

  async delete(req: Request, res: Response) {
    try {
      if (req.headers['x-user-type'] === 'admin') {
        const usersService = new UsersService;
        const response = await usersService.delete(req.params?.id);
        return res.json(response);
      } else {
        throw {status: -1, code: 401, message: 'Unauthorized'};
      }
    } catch (e: any) {
      return res.status(e.code ?? 500).json(e);
    }
  }

  async changeType(req: Request, res: Response) {
    try {
      if (req.headers['x-user-type'] === 'admin') {
        const usersService = new UsersService;
        const update: IUser = { 
          id: req.params.id, 
          type: req.body.type
        };
        const response = await usersService.changeType(update);
        return res.json(response);
      } else {
        throw {status: -1, code: 401, message: 'Unauthorized'};
      }
    } catch (e: any) {
      return res.status(e.code ?? 500).json(e);
    }
  }
}

export { UsersController };
