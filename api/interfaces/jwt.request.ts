import { Request } from 'express';
import { EmptyObject } from './empty.object';

export interface JWTRequest extends Request {
	jwt: EmptyObject | string;
}
