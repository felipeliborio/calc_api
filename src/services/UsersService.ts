import { database } from '../config/knex';
import { v4 as uuid } from "uuid";
import { Cache } from './Cache';

const crypto = require('crypto');

type UserType = 'admin' | 'user';
interface IUser {
  id?: string;
  username?: string;
  password?: string;
  type?: UserType;
}

//ao invés da senha aberta, recebe a senha criptografada
class UsersService {
  async create({ username, password }: IUser) {
    return new Promise((resolve, reject) => {
      const id = uuid();

      password = crypto.createHash('md5').update(password).digest("hex");
      database('users')
      .insert({ id, username, password })
      .then(r => {
        resolve({ status: 1, id: r[0] });
      })
      .catch(e => {
        reject({ status: -1, code: 400, message: e.message });
      });
    });
  }

  async login({ username, password }: IUser) {
    return new Promise((resolve, reject) => {

      password = crypto.createHash('md5').update(password).digest("hex");
      database('users')
      .select(['id', 'username','type'])
      .where({
        username,
        password
      })
      .then(user => {
        if (user[0]) {
          const token: string = crypto.createHash('md5').update(`${username}${password}${new Date().toDateString()}`).digest("hex");
          return Cache.set(token, user[0], 86400)
          .then(status => {
            if (status) {
              return resolve({ status: 1, token });
            }
            reject({ status: -1, message: 'Failed to save user session' });
          })
          .catch(e => {
            reject({ status: -1, message: 'Failed to save user session' });
          });
        }
        reject({ status: -1, code: 401, message: 'username, password combination not found' });
      })
      .catch(e => {
        reject({ status: -1, message: e.message });
      });
    });
  }

  async auth(token: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (token === undefined) {
        return reject({
          status: -1,
          code: 401,
          message: 'The x-access-token was not sent'
        });
      }
      Cache.get(token)
      .then(session => {
        if (session) {
          Cache.setExp(token, 86400);
          return resolve(session);
        }
        reject({ status: -1, message: 'The token is invalid or has expired' });
      })
      .catch(e => {
        console.log(e)
        reject({ status: -1, message: e.message });
      });
    });
  }

  async list() {
    return new Promise((resolve, reject) => {
      database('users')
      .select(['id', 'username', 'type', 'created_at', 'updated_at'])
      .then(users => {
        resolve({ status: 1, users });
      })
      .catch(e => {
        reject({ status: -1, message: e.message });
      });
    });
  }

  async delete(id: string) {
    return new Promise((resolve, reject) => {
      database('users')
      .where({id})
      .del()
      .then(r => {
        resolve({ status: 1, deleted: r });
      })
      .catch(e => {
        reject({ status: -1, message: e.message });
      });
    });
  }

  async changeType({ id, type }: IUser) {
    return new Promise((resolve, reject) => {
      database('users')
      .where({id})
      .update({type})
      .then(r => {
        resolve({ status: 1 });
      })
      .catch(e => {
        reject({ status: -1, message: e.message });
      });
    });
  }
}

export { IUser, UsersService };
