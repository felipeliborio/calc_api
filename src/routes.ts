import { Router } from 'express';
import { UsersController } from './controllers/UsersController';
import { OperationsLogController } from './controllers/OperationsLogController';

const routes = Router();

routes.get('/', (req, res) => {
  res.send('CalcAPI');
});

//Users
const users = new UsersController();
routes.post('/user', users.create);
routes.delete('/user/:id', users.auth, users.delete);
routes.get('/users', users.auth, users.list);
routes.put('/user/changeType/:id', users.auth, users.changeType);

routes.post('/login', users.login);

//Operations
const operations = new OperationsLogController();
routes.get('/operations', users.auth, operations.list);
routes.post('/operation', users.auth, operations.make);

export { routes };
