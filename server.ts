import express, { Application, Request, Response } from 'express';
import * as http from 'http';
import env from 'dotenv';
import { RoutesConfig } from './api/common';
import {
	LoginRoutes,
	UserRoutes,
	UsersRoutes,
} from './api/routes';

env.config();

const app: Application = express();
const server: http.Server = http.createServer(app);
const port = process.env.PORT;
const routes: RoutesConfig[] = [];

app.use(express.json());

routes.push(new LoginRoutes(app));
routes.push(new UserRoutes(app));
routes.push(new UsersRoutes(app));

app.get('/', (req: Request, res: Response) => {
	res.status(200).send({ msg: `Hello World! Our server is running at port ${port}` });
});

server.listen(port, () => {
	console.log(`Server running at port ${port}`);

	routes.forEach((route: RoutesConfig) => {
		console.log(`Routes configured for ${route.getName()}`);
	});
});

export default app;
