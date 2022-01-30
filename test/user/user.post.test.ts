import server from '../../server';
import { agent as request, Response } from 'supertest';
import { expect } from 'chai';
import { EnumOfTypes } from '../../api/interfaces';
import { Endpoints, ErrorMsgs, HttpCodes } from '../../api/common';
import { UserMock } from '../../mock';

let firstUserId = 0;

const header = { Authorization: 'Bearer ' };
const { firstUser, secondUser } = UserMock;
const { username, password } = firstUser;
const { NUMBER, OBJECT, STRING } = EnumOfTypes;
const { login, user } = Endpoints;
const { BAD_REQUEST, CREATED } = HttpCodes;
const {
	invalidBody,
	missingPasswd,
	missingUsername,
	usernameExist,
} = ErrorMsgs;
const req = request(server);

describe('user.post.test', () => {
	describe(`POST ${user}`, () => {
		it('should return 201 - Created', (done) => {
			req
				.post(user)
				.send(firstUser)
				.then(({ status, body }: Response) => {
					const { id } = body;

					expect(status).to.equal(CREATED);
					expect(body).not.to.be.empty;
					expect(body).to.be.an(OBJECT);
					expect(id).to.be.an(NUMBER);
					expect(body.username).to.be.an(STRING);
					expect(body.username).to.be.equal(username);
					expect(body).not.haveOwnProperty('password');

					firstUserId = id;

					req
						.post(login)
						.send({ username, password })
						.then(({ body }: Response) => {
							const { accessToken } = body;

							header.Authorization += accessToken;
							done();
						})
						.catch(done);
				})
				.catch(done);
		});

		it('should return 400 - Bad Request - username exists', (done) => {
			req
				.post(user)
				.send({ username, password: secondUser.password })
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

		it('should return 400 - Bad Request - missing username', (done) => {
			req
				.post(user)
				.send({ password })
				.then(({ status, body }: Response) => {
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
				.post(user)
				.send({ username })
				.then(({ status, body }: Response) => {
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

		it('should return 400 - Bad Request - empty body', (done) => {
			req
				.post(user)
				.send()
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

		it('should return 400 - Bad Request - invalid body request', (done) => {
			req
				.delete(`${user}/${firstUserId}`)
				.set(header)
				.send()
				.then(() => {
					req
						.post(user)
						.send({ invalid: 'invalid' })
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
				})
				.catch(done);
		});
	});
});
