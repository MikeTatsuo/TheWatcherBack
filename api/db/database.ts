import { Client, QueryResult } from 'pg';

export class Database {
	public client: Client = new Client({
		user: process.env.DB_USER,
		database: process.env.DB,
		host: process.env.DB_URL,
		password: process.env.DB_PASSWD,
		port: Number(process.env.DB_PORT),
	});

	constructor() {
		this.connect().catch((err) => {
			console.error(err);
		});
	}

	private connect(): Promise<void> {
		return new Promise((resolve, reject) => {
			this.client
				.connect()
				.then(() => resolve())
				.catch((err) => reject(err));
		});
	}

	public query<T = unknown>(text: string, values?: T[]): Promise<QueryResult> {
		return new Promise((resolve, reject) => {
			this.client
				.query(text, values)
				.then((res) => resolve(res))
				.catch((err) => reject(err));
		});
	}
}
