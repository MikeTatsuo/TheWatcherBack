import { HttpCodes } from '../common';
import { User, BaseObject } from '../interfaces';
import { Request, Response } from 'express';
import { UserService } from '../services';

const { CREATED, OK } = HttpCodes;

export class UserController {
	createUser({ body }: Request, res: Response): void {
		const userService = UserService.getInstance();
		body = userService.hashPassword(body);

		userService
			.create(body)
			.then((createdUser: User) => {
				const formattedUser = userService.formatUser(createdUser);

				res.status(CREATED).send(formattedUser);
			})
			.catch((err) => console.error('ControllerErr: ', err));
	}

	getUserById({ params }: Request, res: Response): void {
		const userService = UserService.getInstance();

		userService
			.getById(params.userId)
			.then((retrievedUser: User) => {
				const formattedUser = userService.formatUser(retrievedUser);

				res.status(OK).send(formattedUser);
			})
			.catch((err) => console.error('ControllerErr: ', err));
	}

	listUsers(req: Request, res: Response): void {
		const userService = UserService.getInstance();

		userService
			.list()
			.then((usersList: User[]) => {
				const formattedList = usersList.map((user: User) => userService.formatUser(user));

				res.status(OK).send(formattedList);
			})
			.catch((err) => console.error('ControllerErr: ', err));
	}

	patch({ body, params }: Request, res: Response): void {
		const userService = UserService.getInstance();

		userService
			.patchById(params.userId, body)
			.then((patchedUser: User) => {
				const formattedUser = userService.formatUser(patchedUser);

				res.status(OK).send(formattedUser);
			})
			.catch((err) => console.error('ControllerErr: ', err));
	}

	put({ body, params }: Request, res: Response): void {
		const userService = UserService.getInstance();
		body = userService.hashPassword(body);

		userService.updateById(params.userId, body).then((updatedUser: User) => {
			const formattedUser = userService.formatUser(updatedUser);

			res.status(OK).send(formattedUser);
		});
	}

	removeUser({ params }: Request, res: Response): void {
		const userService = UserService.getInstance();

		userService.deleteById(params.userId).then((deletedUserId: BaseObject) => {
			res.status(OK).send(deletedUserId);
		});
	}
}
