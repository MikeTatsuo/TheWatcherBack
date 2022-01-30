import { Request, Response, NextFunction } from 'express';
import * as JWT from 'jsonwebtoken';
import * as crypto from 'crypto';
import env from 'dotenv';
import { EmptyObject, Encoding, ErrorMsg, JWTRequest } from '../interfaces';
import { ErrorMsgs, HttpCodes } from '../common';

env.config();
const { BASE64, SHA512 } = Encoding;
const jwtSecret = process.env.JWT_SECRET as string;
const { BAD_REQUEST, FORBIDDEN, UNAUTHORIZED } = HttpCodes;
const {
	authRequired,
	invalidAuthType,
	invalidRefreshToken,
	invalidSignature,
	missingRefreshToken,
} = ErrorMsgs;

export class JwtMiddleware {
	private static instance: JwtMiddleware;

	static getInstance(): JwtMiddleware {
		if (!JwtMiddleware.instance) JwtMiddleware.instance = new JwtMiddleware();

		return JwtMiddleware.instance;
	}

	verifyRefreshBodyField({ body }: Request, res: Response, next: NextFunction): void {
		const { refreshToken } = body;

		if (body && refreshToken) next();
		else res.status(BAD_REQUEST).send(new ErrorMsg(missingRefreshToken));
	}

	validRefreshNeeded(req: Request, res: Response, next: NextFunction): void {
		const jwt: EmptyObject = (req as JWTRequest).jwt as EmptyObject;
		const { id, refreshKey } = jwt;
		const refreshId = `${id}${jwtSecret}`;
		const refreshBuffer = Buffer.from(req.body.refreshToken, BASE64);
		const refreshToken = refreshBuffer.toString();
		const hash = crypto
			.createHmac(SHA512, refreshKey as string)
			.update(refreshId)
			.digest(BASE64);

		if (hash === refreshToken) {
			delete jwt.iat;
			delete jwt.exp;
			req.body = jwt;

			next();
		} else {
			res.status(BAD_REQUEST).send(new ErrorMsg(invalidRefreshToken));
		}
	}

	validJWTNeeded(req: Request, res: Response, next: NextFunction): void {
		const { headers } = req;
		const { authorization } = headers;

		if (authorization) {
			try {
				const auth = authorization.split(' ');

				if (auth[0] !== 'Bearer') {
					res.status(UNAUTHORIZED).send(new ErrorMsg(invalidAuthType));
				} else {
					(req as JWTRequest).jwt = JWT.verify(auth[1], jwtSecret) as string | EmptyObject;
					next();
				}
			} catch (err) {
				res.status(FORBIDDEN).send(new ErrorMsg(invalidSignature));
			}
		} else {
			res.status(UNAUTHORIZED).send(new ErrorMsg(authRequired));
		}
	}
}
