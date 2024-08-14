const { createServer } = require('https');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');

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

//		console.log('--- Incoming Request ---'); // debug
//		console.log('Method:', req.method); // debug
//		console.log('URL:', req.url); // debug
//		console.log('Headers:', JSON.stringify(req.headers, null, 2)); // debug

		handle(req, res, parsedUrl);

//		res.on('finish', () => {  // debug
//			console.log('--- Response Sent ---');  // debug
//			console.log('Status Code:', res.statusCode);  // debug
//			console.log('Headers:', JSON.stringify(res.getHeaders(), null, 2));  // debug
//		});  // debug

	}).listen(3000, err => {
		if (err) throw err;
		console.log('Next.js SSL server is started');
	});
});
