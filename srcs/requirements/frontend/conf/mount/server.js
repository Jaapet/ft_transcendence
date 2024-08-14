const { createServer } = require('https');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

const dev = false;
const app = next({ dev });
const handle = app.getRequestHandler();

const httpsOptions = {
	key: fs.readFileSync('/ssl/frontend.key'),
	cert: fs.readFileSync('/ssl/frontend.crt'),
	ca: fs.readFileSync('/ssl/CA.crt')
};

app.prepare().then(() => {
	createServer(httpsOptions, (req, res) => {
		const parsedUrl = parse(req.url, true);
		handle(req, res, parsedUrl);
	}).listen(3000, err => {
		if (err) throw err;
		console.log('Next.js SSl server is started');
	});
});
