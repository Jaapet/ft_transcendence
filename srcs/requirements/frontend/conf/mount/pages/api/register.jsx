import { IncomingForm } from 'formidable';
import fs from 'fs';

export const config = {
	api: {
		bodyParser: false, // Disable Next.js built-in body parser
	},
};

const parseForm = (req) =>
	new Promise((resolve, reject) => {
		const form = new IncomingForm();
		form.parse(req, (err, fields, files) => {
			if (err) {
				reject(err);
			} else {
				resolve({ fields, files });
			}
		});
	});

export default async (req, res) => {
	// Only POST allowed
	if (req.method !== 'POST') {
		res.setHeader('Allow', ['POST']);
		return res.status(405).json({ message: 'Method ${req.method} is not allowed' });
	}

	let formData = null;

	try {
		const { fields, files } = await parseForm(req);

		formData = new FormData();
		formData.append('username', fields.username);
		formData.append('email', fields.email);
		formData.append('password', fields.password);
		if (files.avatar) {
			const file = files.avatar[0];
//			console.log('avatar:', file);
			const fileBuffer = fs.readFileSync(file.filepath);
			const blob = new Blob([fileBuffer], { type: file.mimetype });
			formData.append('avatar', blob, file.originalFilename);
		}

//		console.log(formData);

		// Register new user
		const response = await fetch(`http://backend:8000/api/register/`, {
			method: 'POST',
			body: formData
		});

		if (!response.ok) {
			const responseError = await response.json();
			throw new Error(responseError.message || 'Registration failed');
		}

		return res.status(200).json({ message: 'Member has been created' });
	} catch (error) {
		console.error('Error during registration:', error);
		return res.status(500).json({ message: 'Registration failed' });
	}
}
