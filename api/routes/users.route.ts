import { Application } from 'express';
import { Endpoints, RoutesConfig } from '../common';
import { UserController } from '../controllers';
import { configureRoutes } from '../interfaces';
import { JwtMiddleware } from '../middleware';

const { users } = Endpoints;

export class UsersRoutes extends RoutesConfig implements configureRoutes {
	constructor(app: Application) {
		super(app, 'UsersRoute');
		this.configureRoutes();
	}

	configureRoutes(): void {
		const userController = new UserController();
		const jwtMiddleware = JwtMiddleware.getInstance();

		this.app.get(users, [jwtMiddleware.validJWTNeeded, userController.listUsers]);
	}
}
