import { BaseObject } from './base.object';


export interface CRUD<T> {
	create: (resource: T) => Promise<T>;
	deleteById: (resourceId: string) => Promise<BaseObject>;
	getById: (resourceId: string) => Promise<T>;
	getByParam: (value: unknown, param?: string) => Promise<T>;
	list: (limit?: number, page?: number) => Promise<T[]>;
	patchById: (resourceId: string, resource: T) => Promise<T>;
	updateById: (resourceId: string, resource: T) => Promise<T>;
}
