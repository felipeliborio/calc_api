import { database } from '../config/knex';

interface IList {
  userId?: string;
  fromDate?: string;
  toDate?: string;
}

class OperationsLogService {
  async list({ userId, fromDate, toDate }: IList) {
    return database('users').select('*');
  }

  async make(operation: string) {

  }
}

export { OperationsLogService };
