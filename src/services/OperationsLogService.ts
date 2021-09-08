import { database } from '../config/knex';

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

  async make(operation: string, ) {

  }
}

export { OperationsLogService };
