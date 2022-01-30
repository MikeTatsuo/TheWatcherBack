import { BaseObject } from './base.object';

export interface User extends BaseObject {	
	username: string;
	password?: string;
	oldPassword?: string;
	token?: string;
}
