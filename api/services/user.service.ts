import * as crypto from 'crypto';
import { UserRepository } from '../repositories';
import { CRUD, BaseObject, User } from '../interfaces';
import { Encoding } from '../interfaces';

const { BASE64, SHA512 } = Encoding;

export class UserService implements CRUD<User> {
	private static instance: UserService;
	userRepository: UserRepository;

	constructor() {
		this.userRepository = UserRepository.getInstance();
	}

	static getInstance(): UserService {
		if (!UserService.instance) UserService.instance = new UserService();

		return UserService.instance;
	}

	create(resource: User): Promise<User> {
		return this.userRepository.add(resource);
	}

	deleteById(resourceId: string): Promise<BaseObject> {
		const userId = Number(resourceId);

		return this.userRepository.removeById(userId);
	}

	// list(limit = 20, page = 1): Promise<User[]> {
	list(): Promise<User[]> {
		return this.userRepository.getList();
	}

	patchById(resourceId: string, resource: User): Promise<User> {
		const userId = Number(resourceId);
		const { username, password } = resource;		
		resource = { ...resource, id: userId };

		if (username) resource = { ...resource, username };
		if (password) resource = this.hashPassword(resource);

		return this.userRepository.patchById(userId, resource);
	}

	getById(resourceId: string): Promise<User> {
		const userId = Number(resourceId);

		return this.userRepository.getById(userId);
	}

	getByParam(value: unknown): Promise<User> {
		return this.userRepository.getByParams(value);
	}

	updateById(resourceId: string, resource: User): Promise<User> {
		const userId = Number(resourceId);
		const { id } = resource;

		resource = { ...resource, id: Number(id) };

		return this.userRepository.putById(userId, resource);
	}

	formatUser(user: User): User {
		const formattedUser: User = { ...user };

		if (user) delete formattedUser.password;

		return formattedUser;
	}

	hashPassword(user: User): User {
		// const { username } = user;
		const token = crypto.randomBytes(16).toString(BASE64);
		const password = crypto
			.pbkdf2Sync(user.password as string, token, 1000, 64, SHA512)
			.toString(BASE64);
		return { ...user, password, token } as User;
	}

	validPassword({ password, token }: User, rawPassword: string): boolean {
		const hashedPassword = crypto
			.pbkdf2Sync(rawPassword, token as string, 1000, 64, SHA512)
			.toString(BASE64);
		return password === hashedPassword;
	}
}
