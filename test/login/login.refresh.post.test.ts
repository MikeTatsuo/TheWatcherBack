import server from '../../server';
import { agent as request, Response } from 'supertest';
import { expect } from 'chai';
import { Endpoints, ErrorMsgs, HttpCodes } from '../../api/common';
import { EnumOfTypes } from '../../api/interfaces';

let firstUserId = 0;

const firstUserBody = {
	username: 'Username 1',
	password: 'Password1',
};

let jwt = {
	accessToken: '',
	refreshToken: '',
};

const header = { Authorization: 'Bearer ' };
const { username, password } = firstUserBody;
const { login, refresh_token, user } = Endpoints;
const { OBJECT, STRING } = EnumOfTypes;
const { BAD_REQUEST, CREATED, FORBIDDEN, UNAUTHORIZED } = HttpCodes;
const {
	authRequired,
	invalidAuthType,
	invalidRefreshToken,
	invalidSignature,
	missingRefreshToken,
} = ErrorMsgs;
const req = request(server);

describe('auth.refresh.post.test', () => {
	describe(`POST ${login}${refresh_token}`, () => {
		it('should return 201 - Created', (done) => {
			req
				.post(user)
				.send(firstUserBody)
				.then(({ body }: Response) => {
					const { id } = body;
					firstUserId = id;

					req
						.post(login)
						.send({ username, password })
						.then(({ body }: Response) => {
							const { accessToken, refreshToken } = body;
							jwt = { accessToken, refreshToken };
							header.Authorization += accessToken;

							req
								.post(`${login}${refresh_token}`)
								.set(header)
								.send({ refreshToken })
								.then(({ body, status }: Response) => {
									expect(status).to.equal(CREATED);
									expect(body).not.to.be.empty;
									expect(body).to.be.an(OBJECT);
									expect(body.accessToken).to.be.an(STRING);
									expect(body.refreshToken).to.be.an(STRING);

									jwt = { accessToken: body.accessToken, refreshToken: body.refreshToken };
									header.Authorization = `Bearer ${body.accessToken}`;

									done();
								})
								.catch(done);
						})
						.catch(done);
				})
				.catch(done);
		});

		it('should return 403 - Forbidden - invalid JWT', (done) => {
			const { refreshToken } = jwt;
			req
				.post(`${login}${refresh_token}`)
				.set({ Authorization: `${header.Authorization}123` })
				.send({ refreshToken })
				.then(({ body, status }: Response) => {
					const { error } = body;

					expect(status).to.equal(FORBIDDEN);
					expect(body).not.to.be.empty;
					expect(body).to.be.an(OBJECT);
					expect(error).to.be.an(STRING);
					expect(error).to.be.equal(invalidSignature);

					done();
				})
				.catch(done);
		});

		it('should return 401 - Unauthorized - no JWT set', (done) => {
			const { refreshToken } = jwt;

			req
				.post(`${login}${refresh_token}`)
				.send({ refreshToken })
				.then(({ body, status }: Response) => {
					const { error } = body;

					expect(status).to.equal(UNAUTHORIZED);
					expect(body).not.to.be.empty;
					expect(body).to.be.an(OBJECT);
					expect(error).to.be.an(STRING);
					expect(error).to.be.equal(authRequired);

					done();
				})
				.catch(done);
		});

		it('should return 401 - Unauthorized - invalid auth type', (done) => {
			const { refreshToken } = jwt;
			req
				.post(`${login}${refresh_token}`)
				.set({ Authorization: `WrongAuth ${jwt.accessToken}` })
				.send({ refreshToken })
				.then(({ body, status }: Response) => {
					const { error } = body;

					expect(status).to.equal(UNAUTHORIZED);
					expect(body).not.to.be.empty;
					expect(body).to.be.an(OBJECT);
					expect(error).to.be.an(STRING);
					expect(error).to.be.equal(invalidAuthType);

					done();
				})
				.catch(done);
		});

		it('should return 400 - Bad Request - invalid refreshToken', (done) => {
			req
				.post(`${login}${refresh_token}`)
				.set(header)
				.send({ refreshToken: '123' })
				.then(({ body, status }: Response) => {
					const { error } = body;

					expect(status).to.equal(BAD_REQUEST);
					expect(body).not.to.be.empty;
					expect(body).to.be.an(OBJECT);
					expect(error).to.be.an(STRING);
					expect(error).to.be.equal(invalidRefreshToken);

					done();
				})
				.catch(done);
		});

		it('should return 400 - Bad Request - no refreshToken', (done) => {
			req
				.post(`${login}${refresh_token}`)
				.set(header)
				.send()
				.then(({ body, status }: Response) => {
					const { error } = body;

					expect(status).to.equal(BAD_REQUEST);
					expect(body).not.to.be.empty;
					expect(body).to.be.an(OBJECT);
					expect(error).to.be.an(STRING);
					expect(error).to.be.equal(missingRefreshToken);

					req
						.delete(`${user}/${firstUserId}`)
						.set(header)
						.send()
						.then(() => {
							done();
						})
						.catch(done);
				})
				.catch(done);
		});
	});
});
