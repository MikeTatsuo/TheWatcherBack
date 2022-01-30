import { NextFunction, Request, Response } from 'express';
import { ErrorMsg, User } from '../interfaces';
import { UserService } from '../services';
import { ErrorMsgs, HttpCodes } from '../common';

const { invalidUsernamePasswd } = ErrorMsgs;
const { BAD_REQUEST } = HttpCodes;

export class LoginMiddleware {
	private static instance: LoginMiddleware;

	static getInstance(): LoginMiddleware {
		if (!LoginMiddleware.instance) LoginMiddleware.instance = new LoginMiddleware();

		return LoginMiddleware.instance;
	}

	validateBodyRequest({ body }: Request, res: Response, next: NextFunction): void {
		const { username, password } = body;

		if (body && username && password) {
			next();
		} else {
			let errorTxt = 'Missing required field';
			const missingFields: string[] = [];

			if (!username) missingFields.push(' username');
			if (!password) missingFields.push(' password');

			const lastField = missingFields.pop();

			errorTxt += missingFields.length ? `s:${missingFields} and${lastField}` : `:${lastField}`;

			res.status(BAD_REQUEST).send(new ErrorMsg(errorTxt));
		}
	}

	async verifyUserPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
		const { username, password } = req.body;
		const userService = UserService.getInstance();
		const user: User = await userService.getByParam(username);
		const errorMsg: ErrorMsg = new ErrorMsg(invalidUsernamePasswd);

		if (user) {
			const { id } = user;
			const result = userService.validPassword(user, password);

			if (result) {
				req.body = {
					id,
					username,
					provider: 'username',
				};
				next();
			} else {
				res.status(BAD_REQUEST).send(errorMsg);
			}
		} else {
			res.status(BAD_REQUEST).send(errorMsg);
		}
	}
}
