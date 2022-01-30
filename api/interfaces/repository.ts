export interface RepositoryInterface<T, B> {
	add(data: T): Promise<T>;
	getList(): Promise<T[]>;
	getById(id: number): Promise<T>;
	getByParams(value: unknown, params?: string): Promise<T>;
	patchById(id: number, data: T): Promise<T>;
	putById(id: number, data: T): Promise<T>;
	removeById(id: number): Promise<B>;
}
