import { Application } from 'express';
import { Endpoints, RoutesConfig } from '../common';
import { UserController } from '../controllers';
import { configureRoutes } from '../interfaces';
import { JwtMiddleware, UserMiddleware } from '../middleware';

const { user } = Endpoints;

export class UserRoutes extends RoutesConfig implements configureRoutes {
	constructor(app: Application) {
		super(app, 'UserRoute');
		this.configureRoutes();
	}

	configureRoutes(): void {
		const userController = new UserController();
		const userMiddleware = UserMiddleware.getInstance();
		const jwtMiddleware = JwtMiddleware.getInstance();

		this.app.delete(user, [jwtMiddleware.validJWTNeeded, userMiddleware.validateIdDoesExist]);

		this.app.delete(`${user}/:userId`, [
			jwtMiddleware.validJWTNeeded,
			userMiddleware.validateIdDoesExist,
			userMiddleware.extractUserId,
			userController.removeUser,
		]);

		this.app.get(`${user}/:userId`, [
			jwtMiddleware.validJWTNeeded,
			userMiddleware.validateIdDoesExist,
			userMiddleware.extractUserId,
			userController.getUserById,
		]);

		this.app.patch(user, [jwtMiddleware.validJWTNeeded, userMiddleware.validateIdDoesExist]);

		this.app.patch(`${user}/:userId`, [
			jwtMiddleware.validJWTNeeded,
			userMiddleware.validateIdDoesExist,
			userMiddleware.validateBodyFields,
			userMiddleware.validateSameUsernameDoesntExist,
			userMiddleware.extractUserId,
			userController.patch,
		]);

		this.app.post(user, [
			userMiddleware.validateBodyFields,
			userMiddleware.validateRequiredUserBodyFields,
			userMiddleware.validateSameUsernameDoesntExist,
			userController.createUser,
		]);

		this.app.put(user, [jwtMiddleware.validJWTNeeded, userMiddleware.validateIdDoesExist]);

		this.app.put(`${user}/:userId`, [
			jwtMiddleware.validJWTNeeded,
			userMiddleware.validateBodyFields,
			userMiddleware.validateIdDoesExist,
			userMiddleware.validateRequiredUserBodyFields,
			userMiddleware.validateSameUsernameDoesntExist,
			userMiddleware.extractUserId,
			userController.put,
		]);
	}
}
