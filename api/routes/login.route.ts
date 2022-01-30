import { Application } from 'express';
import { Endpoints, RoutesConfig } from '../common';
import { LoginController } from '../controllers';
import { configureRoutes } from '../interfaces';
import { LoginMiddleware, JwtMiddleware } from '../middleware';

const { login, refresh_token } = Endpoints;

export class LoginRoutes extends RoutesConfig implements configureRoutes {
	constructor(app: Application) {
		super(app, 'LoginRoute');
		this.configureRoutes();
	}

	configureRoutes(): void {
		const loginController = new LoginController();
		const loginMiddleware = LoginMiddleware.getInstance();
		const jwtMiddleware = JwtMiddleware.getInstance();

		this.app.post(login, [
			loginMiddleware.validateBodyRequest,
			loginMiddleware.verifyUserPassword,
			loginController.createJWT,
		]);

		this.app.post(`${login}${refresh_token}`, [
			jwtMiddleware.validJWTNeeded,
			jwtMiddleware.verifyRefreshBodyField,
			jwtMiddleware.validRefreshNeeded,
			loginController.createJWT,
		]);
	}
}
