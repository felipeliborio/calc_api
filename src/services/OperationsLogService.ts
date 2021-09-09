import { database } from '../config/knex';
import { v4 as uuid } from 'uuid';

interface IList {
  userId?: string;
  fromDate?: string;
  toDate?: string;
}

class OperationsLogService {
  async list({ userId, fromDate, toDate }: IList) {
    return new Promise((resolve, reject) => {
      const query = database('operations_log as ol')
      .leftJoin('users', 'ol.user_id', 'users.id')
      .select(['users.username', 'ol.*' ]);

      if (userId != undefined) {
        query.where({user_id: userId});
      }

      if (fromDate) {
        query.where('created_at', '>=', fromDate);
      }

      if (toDate) {
        query.where('created_at', '<=', toDate);
      }

      query.then(operations => {
        resolve({ status: 1, operations });
      });
    });
  }

  private async store(operation: string, result: string, userId: string): Promise<any> {
    database('operations_log')
    .insert({
      id: uuid(),
      user_id: userId,
      operation,
      result
    });
  }

  async make(operation: string, userId: string) {
    return new Promise((resolve, reject) => {
      const result = this.calculate(operation);
      this.store(operation, result.value ?? result.message, userId);
      if (result.status === 1) {
        return resolve(result);
      }
      reject(result);
    });
  }

  private calculate(operation: string): any {
    try {
      

      return {
        status: 1,
        value: 1
      };
    } catch (e: any) {
      return {
        status: -1,
        message: 'Invalid operation:' + e.message,
        code: 400
      };
    }
  }
}

export { OperationsLogService };
