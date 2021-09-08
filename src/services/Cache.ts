import { promisify } from 'util';
import redis from 'redis';

const client = redis.createClient({
  host: process.env.CACHE_HOST,
  port: Number(process.env.CACHE_PORT),
  retry_strategy: function(options) {
    console.log(options.error);
    console.log('Redis: failed '+options.attempt+' times');
    if (options.total_retry_time > 1000 * 60 * 60) {
      console.log('Redis: connection lost for more than '+options.total_retry_time);
    }
    return Math.min(options.attempt * 100, 3000);
  },
});

class Cache { 
  private static DEL = promisify<string[]>(client.del).bind(client);
  private static EXISTS = promisify<string[]>(client.exists).bind(client);
  private static EXPIRE = promisify(client.expire).bind(client);
  private static GET = promisify(client.get).bind(client);
  private static SET = promisify<string, string, string, number>(client.set).bind(client);
  private static TTL = promisify(client.ttl).bind(client);
  
  private static TIMEOUT: number = 55000;
  private static ONGOING_OPERATIONS: any = {};

  private static encodeData(data: any) {
    try {
      return JSON.stringify(data);
    } catch (e: any) {
      throw {
        status: -1,
        code: 400,
        message: e?.message
      };
    }
  }

  private static initOperation(reject: Function) {
    let key = String(Date.now()+Math.random());
    Cache.ONGOING_OPERATIONS[key] = true;

    setTimeout(() => {
      if (Cache.ONGOING_OPERATIONS[key]) {
        reject({ 
          status: -1, 
          code: 500, 
          message: 'Cache: timeout', 
        });
      }

      delete Cache.ONGOING_OPERATIONS[key];
    }, Cache.TIMEOUT);

    return key;
  }

  private static endOperation(key: string) {
    delete Cache.ONGOING_OPERATIONS[key];
  }

//public
  static clearClient() {
    client.quit(function() {
      console.log('Cache: Redis client terminated');
    });
  }
  
  static clear(...keys: string[]){
    return new Promise((resolve, reject) => {
      let operation = Cache.initOperation(reject);

      Cache.DEL(keys)
      .then(r => {
        Cache.endOperation(operation);
        resolve(r);
      })
      .catch(e => {
        Cache.endOperation(operation);
        reject({ status: -1, code: 500, message: e.message });
      });
    });
  }
  
  static exists(...keys: string[]) {
    return new Promise((resolve, reject) => {      
      let operation = Cache.initOperation(reject);

      Cache.EXISTS(keys)
      .then(r => {
        Cache.endOperation(operation);
        resolve(r);
      })
      .catch(e => {
        Cache.endOperation(operation);
        reject({ status: -1, code: 500, message: e.message });
      });
    });
  }

  static setExp(key: string, seconds: number) {
    return new Promise((resolve, reject) => {
      let operation = Cache.initOperation(reject);

      Cache.EXPIRE(key, seconds)
      .then(r => {
        Cache.endOperation(operation);
        resolve(r);
      })
      .catch(e => {
        Cache.endOperation(operation);
        reject({ status: -1, code: 500, meSsage: e.message });
      });
    });
  }
  
   static getExp(key: string) {
    return new Promise((resolve, reject) => {
      let operation = Cache.initOperation(reject);

      Cache.TTL(key)
      .then(r => {
        Cache.endOperation(operation);
        resolve(r);
      })
      .catch(e => {
        Cache.endOperation(operation);
        reject({ status: -1, code: 500, message: e.message });
      });
    });
  }

  static get(key: string) {
    return new Promise((resolve, reject) => {
      let operation = Cache.initOperation(reject);

      Cache.GET(key)
      .then(r => {
        Cache.endOperation(operation);
        if (r == null) return resolve(undefined);
        resolve(JSON.parse(r));
      })
      .catch(e => {
        Cache.endOperation(operation);
        reject({ status: -1, code: 500, message: e.message });
      })
    });
  }

  static set(key: string, data: any, expiration: number) {
    return new Promise((resolve, reject) => {
      let args: [string, string, string, number];

      data = Cache.encodeData(data);
      args = [key, data, '', -1];
      
      if (expiration != undefined) {
        args = [key, data as string, 'EX', expiration];
      }
      
      let operation = Cache.initOperation(reject);
      
      Cache.SET(...args)
      .then(r => {
        Cache.endOperation(operation);
        if (r as unknown as string == 'OK') return resolve(1);
        resolve(0);
      })
      .catch(e => {
        Cache.endOperation(operation);
        reject({ 
          status: -1, 
          code: 500, 
          message: e.message
        });
      });
    });
  }
}

export { Cache };
