import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import env from 'dotenv';
import { Encoding } from '../interfaces';
import { HttpCodes } from '../common';

env.config();
const jwtSecret = process.env.JWT_SECRET as string;
const tokenExpiraton = process.env.TOKEN_EXPIRATION;
const { BASE64, SHA512 } = Encoding;
const { CREATED, INTERNAL_SERVER_ERROR } = HttpCodes;

export class LoginController {
	createJWT(req: Request, res: Response): void {
		try {
			const { id } = req.body;
			const refreshId = `${id}${jwtSecret}`;
			const salt = crypto.randomBytes(16).toString(BASE64);
			const hash = crypto.createHmac(SHA512, salt).update(refreshId).digest(BASE64);
			req.body.refreshKey = salt;
			const token = jwt.sign(req.body, jwtSecret, { expiresIn: tokenExpiraton });
			const hashBuffer = Buffer.from(hash);
			const refreshToken = hashBuffer.toString(BASE64);

			res.status(CREATED).send({ accessToken: token, refreshToken: refreshToken });
		} catch (err) {
			res.status(INTERNAL_SERVER_ERROR).send(err);
		}
	}
}
