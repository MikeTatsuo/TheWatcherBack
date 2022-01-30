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

const invalidUserBody = {
	username: 'invalidUsername',
	password: 'invalidPassword',
};

const header = { Authorization: 'Bearer ' };
const { username, password } = firstUserBody;
const { login, user } = Endpoints;
const { OBJECT, NUMBER, STRING } = EnumOfTypes;
const { BAD_REQUEST, CREATED, OK } = HttpCodes;
const { invalidUsernamePasswd, missingPasswd, missingUsername, missingUsernameAndPasswd } = ErrorMsgs;
const req = request(server);

describe('auth.post.test', () => {
	describe(`POST ${login}`, () => {
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
						.then(({ body, status }: Response) => {
							const { accessToken, refreshToken } = body;

							expect(status).to.equal(CREATED);
							expect(body).not.to.be.empty;
							expect(body).to.be.an(OBJECT);
							expect(accessToken).to.be.an(STRING);
							expect(refreshToken).to.be.an(STRING);

							header.Authorization += accessToken;

							done();
						})
						.catch(done);
				})
				.catch(done);
		});

		it('should return 400 - Bad Request - missing username', (done) => {
			req
				.post(login)
				.send({ password })
				.then(({ body, status }: Response) => {
					const { error } = body;

					expect(status).to.equal(BAD_REQUEST);
					expect(body).not.to.be.empty;
					expect(body).to.be.an(OBJECT);
					expect(error).to.be.an(STRING);
					expect(error).to.be.equal(missingUsername);

					done();
				})
				.catch(done);
		});

		it('should return 400 - Bad Request - missing password', (done) => {
			req
				.post(login)
				.send({ username })
				.then(({ body, status }: Response) => {
					const { error } = body;

					expect(status).to.equal(BAD_REQUEST);
					expect(body).not.to.be.empty;
					expect(body).to.be.an(OBJECT);
					expect(error).to.be.an(STRING);
					expect(error).to.be.equal(missingPasswd);

					done();
				})
				.catch(done);
		});

		it('should return 400 - Bad Request - missing username and password', (done) => {
			req
				.post(login)
				.send()
				.then(({ body, status }: Response) => {
					const { error } = body;

					expect(status).to.equal(BAD_REQUEST);
					expect(body).not.to.be.empty;
					expect(body).to.be.an(OBJECT);
					expect(error).to.be.an(STRING);
					expect(error).to.be.equal(missingUsernameAndPasswd);

					done();
				})
				.catch(done);
		});

		it('should return 400 - Bad Request - invalid username', (done) => {
			req
				.post(login)
				.send({ username: invalidUserBody.username, password })
				.then(({ body, status }: Response) => {
					const { error } = body;

					expect(status).to.equal(BAD_REQUEST);
					expect(body).not.to.be.empty;
					expect(body).to.be.an(OBJECT);
					expect(error).to.be.an(STRING);
					expect(error).to.be.equal(invalidUsernamePasswd);

					done();
				})
				.catch(done);
		});

		it('should return 400 - Bad Request - invalid password', (done) => {
			req
				.post(login)
				.send({ username, password: invalidUserBody.password })
				.then(({ body, status }: Response) => {
					const { error } = body;

					expect(status).to.equal(BAD_REQUEST);
					expect(body).not.to.be.empty;
					expect(body).to.be.an(OBJECT);
					expect(error).to.be.an(STRING);
					expect(error).to.be.equal(invalidUsernamePasswd);

					req
						.delete(`${user}/${firstUserId}`)
						.set(header)
						.send()
						.then(({ body, status }: Response) => {
							const { id } = body;

							expect(status).to.equal(OK);
							expect(body).to.not.be.empty;
							expect(body).to.be.an(OBJECT);
							expect(id).to.be.an(NUMBER);
							expect(id).to.be.equal(firstUserId);

							done();
						})
						.catch(done);
				})
				.catch(done);
		});
	});
});
