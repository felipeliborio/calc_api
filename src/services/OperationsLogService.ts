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

  private calculate(expression: string): any {
    try {
      this.validate(expression);

      const weights = [];
      let modifier = 0;
      for (let i = 0; i < expression.length; ++i) {
        let weight = 0;

        if (['+', '-'].includes(expression.charAt(i))) {
          weight = modifier + 1;
        } else if (['*', '/'].includes(expression.charAt(i))) {
          weight = modifier + 2; 
        } else if (expression.charAt(i) == '(') {
          ++modifier;
        } else if (expression.charAt(i) == ')') {
          --modifier;
        }

        if (weight > 0) {
          weights.push([weight, i]);
        }
      }
      weights.sort((a, b) => {
        return b[0] - a[0];
      });

      while(weights.length) {
        const oldLenght = expression.length;
        expression = this.calculateAt(expression, weights[0][1]);
        this.updateWeights(weights, oldLenght - expression.length);
        weights.shift();
      }
      
      return {
        status: 1,
        result: Number(expression)
      };
    } catch (e: any) {
      return {
        status: -1,
        message: 'Invalid operation:' + e.message,
        code: 400
      };
    }
  }

  private validate(expression: string) {
    if (!expression.length) {
      throw { message: 'empty operation' }
    }

    if (!/[0-9+\-*/()\.]/g.test(expression)) {
      throw { message: 'contains invalid characters' };
    }

    let weight = 0;
    for (let i = 0; i < expression.length ; ++i) {
      if (expression.charAt(i) == '(') {
        ++weight;
      } else if (expression.charAt(i) == ')') {
        --weight;
      }

      if (weight < 0) {
        break;
      }
      
      if (
        i > 0 
        && expression.charAt(i) == expression.charAt(i - 1)
        && ['+', '-', '*', '/', '.'].includes(expression.charAt(i))
      ) {
        throw { message: 'invalid operand at position'+ i};
      }
    }

    if (weight != 0) {
      throw { message: 'the parentheses are not matching' }
    }
  }

  private calculateAt(expression: string, index: number): string {
    const operations: any = {
      '+': (a: number,b:number): number => a+b,
      '-': (a: number,b:number): number => a-b,
      '*': (a: number,b:number): number => a*b,
      '/': (a: number,b:number): number => a/b,
    }

    let first = (() => {
      let i;
      for (i = index-1; i > 0; --i) {
        if ('.' != expression.charAt(i) && isNaN(Number(expression.charAt(i)))) {
          break;
        }
      }
      return Number(expression.slice(i, index));
    })();

    let second = (() => {
      let i;
      for (i = index+1; i < expression.length; ++i) {
        if ('.' != expression.charAt(i) && isNaN(Number(expression.charAt(i)))) {
          break;
        }
      }
      
      return Number(expression.slice(index+1, i));
    })();

    return expression.replace(
      `${first}${expression.charAt(index)}${second}`, 
      operations[expression.charAt(index)](first, second)
    );
  }

  private updateWeights(weights: any[], shift: number ) {
    for (let i in weights) {
      if (weights[i][1] > weights[0][1]) weights[i][1] -= shift;
    }
  }
}

export { OperationsLogService };
