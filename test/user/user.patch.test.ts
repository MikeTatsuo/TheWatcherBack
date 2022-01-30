import server from '../../server';
import { agent as request, Response } from 'supertest';
import { expect } from 'chai';
import { EnumOfTypes } from '../../api/interfaces';
import { Endpoints, ErrorMsgs, HttpCodes } from '../../api/common';
import { UserMock } from '../../mock';

let firstUserId = 0;
let secondUserId = 0;

const header = { Authorization: 'Bearer ' };
const { firstUser, secondUser, thirdUser } = UserMock;
const { username, password } = firstUser;
const { NUMBER, OBJECT, STRING } = EnumOfTypes;
const { login, user } = Endpoints;
const { BAD_REQUEST, FORBIDDEN, NOT_FOUND, OK, UNAUTHORIZED } = HttpCodes;
const {
	authRequired,
	invalidBody,
	invalidSignature,
	missingParamId,
	usernameExist,
	userNotFound,
} = ErrorMsgs;
const req = request(server);

describe('user.patch.test', () => {
	describe(`PATCH ${user}/:userId`, () => {
		it('should return 200 - Ok - patching username', (done) => {
			req
				.post(user)
				.send(firstUser)
				.then(({ body }: Response) => {
					const { id } = body;
					firstUserId = id;

					req
						.post(user)
						.send(secondUser)
						.then(({ body }: Response) => {
							const { id } = body;
							secondUserId = id;

							req
								.post(login)
								.send({ username, password })
								.then(({ body }: Response) => {
									const { accessToken } = body;
									header.Authorization += accessToken;

									req
										.patch(`${user}/${firstUserId}`)
										.set(header)
										.send({ username: thirdUser.username })
										.then(({ body, status }: Response) => {
											const { id } = body;

											expect(status).to.equal(OK);
											expect(body).not.to.be.empty;
											expect(body).to.be.an(OBJECT);
											expect(id).to.be.an(NUMBER);
											expect(id).to.be.equal(firstUserId);
											expect(body.username).to.be.an(STRING);
											expect(body.username).to.be.equal(thirdUser.username);
											expect(body).not.haveOwnProperty('password');

											done();
										})
										.catch(done);
								})
								.catch(done);
						})
						.catch(done);
				})
				.catch(done);
		});

		it('should return 200 - Ok - patching password', (done) => {
			req
				.patch(`${user}/${firstUserId}`)
				.set(header)
				.send({ password })
				.then(({ body, status }: Response) => {
					const { id } = body;

					expect(status).to.equal(OK);
					expect(body).not.to.be.empty;
					expect(body).to.be.an(OBJECT);
					expect(id).to.be.an(NUMBER);
					expect(id).to.be.equal(firstUserId);
					expect(body.username).to.be.an(STRING);
					expect(body.username).to.be.equal(thirdUser.username);
					expect(body).not.haveOwnProperty('password');

					done();
				})
				.catch(done);
		});

		it('should return 403 - Forbidden - invalid JWT', (done) => {
			req
				.patch(`${user}/${firstUserId}`)
				.set({ Authorization: `${header.Authorization}123` })
				.send(secondUser)
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
				.patch(`${user}/${firstUserId}`)
				.send(secondUser)
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

		it('should return 400 - Bad Request - empty body', (done) => {
			req
				.patch(`${user}/${firstUserId}`)
				.set(header)
				.send()
				.then(({ body, status }: Response) => {
					const { error } = body;

					expect(status).to.equal(BAD_REQUEST);
					expect(body).not.to.be.empty;
					expect(body).to.be.an(OBJECT);
					expect(error).to.be.an(STRING);
					expect(error).to.be.equal(invalidBody);

					done();
				})
				.catch(done);
		});

		it('should return 400 - Bad Request - username exists', (done) => {
			req
				.patch(`${user}/${firstUserId}`)
				.set(header)
				.send({ username: secondUser.username })
				.then(({ status, body }: Response) => {
					const { error } = body;

					expect(status).to.equal(BAD_REQUEST);
					expect(body).not.to.be.empty;
					expect(body).to.be.an(OBJECT);
					expect(error).to.be.an(STRING);
					expect(error).to.be.equal(usernameExist);

					done();
				})
				.catch(done);
		});

		it('should return 400 - Bad Request - invalid body request', (done) => {
			req
				.patch(`${user}/${firstUserId}`)
				.set(header)
				.send({ teste: 'teste' })
				.then(({ status, body }: Response) => {
					const { error } = body;

					expect(status).to.equal(BAD_REQUEST);
					expect(body).not.to.be.empty;
					expect(body).to.be.an(OBJECT);
					expect(error).to.be.an(STRING);
					expect(error).to.be.equal(invalidBody);

					done();
				})
				.catch(done);
		});

		it('should return 400 - Bad Request - missing param id', (done) => {
			req
				.patch(user)
				.set(header)
				.send({ username })
				.then(({ body, status }: Response) => {
					const { error } = body;

					expect(status).to.equal(BAD_REQUEST);
					expect(body).not.to.be.empty;
					expect(body).to.be.an(OBJECT);
					expect(error).to.be.an(STRING);
					expect(error).to.be.equal(missingParamId);

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
						.delete(`${user}/${secondUserId}`)
						.set(header)
						.send()
						.then(() => {
							req
								.patch(`${user}/${firstUserId}`)
								.set(header)
								.send(username)
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
				})
				.catch(done);
		});
	});
});
