import { database } from '../config/knex';
import { v4 as uuid } from "uuid";
import { Cache } from './Cache';

type UserType = 'admin' | 'user';
interface IUser {
  id?: string;
  username?: string;
  password?: string;
  type?: UserType;
}

class UsersService {
  async create({ username, password }: IUser) {
    return new Promise((resolve, reject) => {
      const id = uuid();

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

  }

  async auth(token: string): Promise<string> {
    return 'admin';
  }

  async list() {
    return new Promise((resolve, reject) => {
      database('users')
      .select('*')
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
