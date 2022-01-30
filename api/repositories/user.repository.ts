import { QueryResult } from 'pg';
import { Database } from '../db';
import { BaseObject, RepositoryInterface, User } from '../interfaces';

enum UserQueries {
	INSERT = 'INSERT INTO users (username, password, token, created_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP) RETURNING id, username',
	SELECT_ALL = 'SELECT id, username FROM users WHERE deleted_at IS NULL ORDER BY id',
	SELECT = 'SELECT id, username FROM users WHERE id = $1 AND deleted_at IS NULL',
	SELECT_PARAM = 'SELECT * FROM users WHERE username = $1 AND deleted_at IS NULL',
	UPDATE = 'UPDATE users SET username = $1, password = $2, token = $3 WHERE id = $4 RETURNING	id, username',
	UPDATE_NAME = 'UPDATE users SET username = $1 WHERE id = $2 RETURNING	id, username',
	UPDATE_PASSWD = 'UPDATE users SET password = $1, token = $2 WHERE id = $3 RETURNING	id, username',
	DELETE = 'UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING	id',
}

const { INSERT, SELECT_ALL, SELECT, SELECT_PARAM, UPDATE, UPDATE_NAME, UPDATE_PASSWD, DELETE } =
	UserQueries;

const db = new Database();

export class UserRepository implements RepositoryInterface<User, BaseObject> {
	private static instance: UserRepository;

	static getInstance(): UserRepository {
		if (!UserRepository.instance) UserRepository.instance = new UserRepository();

		return UserRepository.instance;
	}

	add({ username, password, token }: User): Promise<User> {
		return new Promise((resolve, reject) => {
			db.query<string>(INSERT, [username, password as string, token as string])
				.then(({ rows }: QueryResult<User>) => resolve(rows[0]))
				.catch((err) => reject(err));
		});
	}

	getList(): Promise<User[]> {
		return new Promise((resolve, reject) => {
			db.query(SELECT_ALL)
				.then(({ rows }: QueryResult) => resolve(rows))
				.catch((err) => reject(err));
		});
	}

	getById(id: number): Promise<User> {
		return new Promise((resolve, reject) => {
			db.query(SELECT, [id])
				.then(({ rows }: QueryResult) => resolve(rows[0]))
				.catch((err) => reject(err));
		});
	}

	getByParams(value: unknown): Promise<User> {
		return new Promise((resolve, reject) => {
			db.query(SELECT_PARAM, [value])
				.then(({ rows }: QueryResult) => resolve(rows[0]))
				.catch((err) => reject(err));
		});
	}

	patchById(id: number, { username, password, token }: User): Promise<User> {
		return new Promise((resolve, reject) => {
			const query = username ? UPDATE_NAME : UPDATE_PASSWD;
			const data = username ? [username] : [password, token];

			db.query(query, [...data, id])
				.then(({ rows }: QueryResult) => resolve(rows[0]))
				.catch((err) => reject(err));
		});
	}

	putById(id: number, { username, password, token }: User): Promise<User> {
		return new Promise((resolve, reject) => {
			db.query(UPDATE, [username, password, token, id])
				.then(({ rows }: QueryResult) => resolve(rows[0]))
				.catch((err) => reject(err));
		});
	}

	removeById(id: number): Promise<BaseObject> {
		return new Promise((resolve, reject) => {
			db.query(DELETE, [id])
				.then(({ rows }: QueryResult) => resolve(rows[0]))
				.catch((err) => reject(err));
		});
	}
}
