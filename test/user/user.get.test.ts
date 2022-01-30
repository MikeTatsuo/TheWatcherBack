import server from '../../server';
import { agent as request, Response } from 'supertest';
import { expect } from 'chai';
import { EnumOfTypes } from '../../api/interfaces';
import { Endpoints, ErrorMsgs, HttpCodes } from '../../api/common';
import { UserMock } from '../../mock';

let firstUserId = 0;

const header = { Authorization: 'Bearer ' };
const { firstUser } = UserMock;
const { username, password } = firstUser;
const { NUMBER, OBJECT, STRING } = EnumOfTypes;
const { login, user } = Endpoints;
const { FORBIDDEN, NOT_FOUND, OK, UNAUTHORIZED } = HttpCodes;
const { authRequired, invalidSignature, userNotFound } = ErrorMsgs;
const req = request(server);

describe('user.get.test', () => {
	describe(`GET ${user}/:userId`, () => {
		it('should return 200 - Ok', (done) => {
			req
				.post(user)
				.send(firstUser)
				.then(({ body }: Response) => {
					const { id } = body;
					firstUserId = id;

					req
						.post(login)
						.send({ username, password })
						.then(({ body }: Response) => {
							const { accessToken } = body;
							header.Authorization += accessToken;

							req
								.get(`${user}/${firstUserId}`)
								.set(header)
								.send()
								.then(({ body, status }: Response) => {
									expect(status).to.equal(OK);
									expect(body).not.to.be.empty;
									expect(body).to.be.an(OBJECT);
									expect(body.id).to.be.an(NUMBER);
									expect(body.username).to.be.an(STRING);
									expect(body.username).to.be.equal(username);
									expect(body).not.haveOwnProperty('password');

									done();
								})
								.catch(done);
						})
						.catch(done);
				})
				.catch(done);
		});

		it('should return 403 - Forbidden - invalid JWT', (done) => {
			req
				.get(`${user}/${firstUserId}`)
				.set({ Authorization: `${header.Authorization}123` })
				.send()
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
			req
				.get(`${user}/${firstUserId}`)
				.send()
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

		it('should return 404 - Not Found - user not found', (done) => {
			req
				.delete(`${user}/${firstUserId}`)
				.set(header)
				.send()
				.then(() => {
					req
						.get(`${user}/${firstUserId}`)
						.set(header)
						.send()
						.then((res: Response) => {
							const { status, body } = res;
							const { error } = body;

							expect(status).to.equal(NOT_FOUND);
							expect(body).not.to.be.empty;
							expect(body).to.be.an(OBJECT);
							expect(error).to.be.an(STRING);
							expect(error).to.be.equal(userNotFound);

							done();
						})
						.catch(done);
				})
				.catch(done);
		});
	});
});
