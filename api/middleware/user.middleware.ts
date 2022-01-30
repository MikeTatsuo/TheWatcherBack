import { NextFunction, Request, Response } from 'express';
import { ErrorMsg, User } from '../interfaces';
import { UserService } from '../services';
import { ErrorMsgs, HttpCodes } from '../common';
import { Methods } from '../common';

const {
	invalidBody,
	missingOldPassword,
	missingParamId,
	noEmptyPassword,
	usernameExist,
	userNotFound,
} = ErrorMsgs;
const { BAD_REQUEST, NOT_FOUND } = HttpCodes;
const { PUT } = Methods;

export class UserMiddleware {
	private static instance: UserMiddleware;

	static getInstance(): UserMiddleware {
		if (!UserMiddleware.instance) UserMiddleware.instance = new UserMiddleware();

		return UserMiddleware.instance;
	}

	extractUserId({ body, params }: Request, res: Response, next: NextFunction): void {
		body.id = params.userId;
		next();
	}

	async validateIdDoesExist({ params }: Request, res: Response, next: NextFunction): Promise<void> {
		const { userId } = params;

		if (!userId) {
			res.status(BAD_REQUEST).send(new ErrorMsg(missingParamId));
		} else {
			const userService = UserService.getInstance();
			const user = await userService.getById(userId);

			if (user) next();
			else res.status(NOT_FOUND).send(new ErrorMsg(userNotFound));
		}
	}

	validateBodyFields({ body }: Request, res: Response, next: NextFunction): void {
		const { username, password } = body;

		if (username || password) next();
		else res.status(BAD_REQUEST).send(new ErrorMsg(invalidBody));
	}

	validatePatchBodyFields({ body }: Request, res: Response, next: NextFunction): void {
		const { username, password, oldPassword } = body;

		if (username) next();
		else {
			if (password && oldPassword) next();
			else {
				if (!password) res.status(BAD_REQUEST).send(new ErrorMsg(noEmptyPassword));
				if (!oldPassword) res.status(BAD_REQUEST).send(new ErrorMsg(missingOldPassword));
			}
		}
	}

	validateRequiredUserBodyFields({ body }: Request, res: Response, next: NextFunction): void {
		const { password, username } = body;

		if (body && password && username) {
			next();
		} else {
			let errorText = 'Missing required field';
			const errorFields = [];

			if (!username) errorFields.push(' username');
			if (!password) errorFields.push(' password');

			const lastField = errorFields.pop();
			errorText += errorFields.length ? `s:${errorFields} and${lastField}` : `:${lastField}`;

			res.status(BAD_REQUEST).send(new ErrorMsg(errorText));
		}
	}

	async validateSameUsernameDoesntExist(
		{ body, method, params }: Request,
		res: Response,
		next: NextFunction
	): Promise<void> {
		const userService = UserService.getInstance();
		const { username } = body;
		const user = await userService.getByParam(username);

		if (user) {
			if (method === PUT && Number(params?.userId) === (user as User).id) next();
			else res.status(BAD_REQUEST).send(new ErrorMsg(usernameExist));
		} else {
			next();
		}
	}
}
