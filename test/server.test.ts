import { expect } from 'chai';
import { agent as request, Response } from 'supertest';
import server from '../server';
import { Endpoints, HttpCodes } from '../api/common';
import { EnumOfTypes } from '../api/interfaces';

const { root } = Endpoints;
const { STRING, OBJECT } = EnumOfTypes;
const { OK } = HttpCodes;

describe('server.test', () => {
	describe(`GET ${root}`, () => {
		it('should return 200', (done) => {
			request(server)
				.get(root)
				.send()
				.then(({ body, status }: Response) => {
					const { msg } = body;

					expect(status).to.be.equal(OK);
					expect(body).not.to.be.empty;
					expect(body).to.be.an(OBJECT);
					expect(msg).to.be.an(STRING);

					done();
				})
				.catch(done);
		});
	});
});
