import refreshToken from '../../../lib/refresh';
import { IncomingForm } from 'formidable';
import fs from 'fs';
// TODO: Check if we can skip using formidable

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
	// Only PUT allowed
	if (req.method !== 'PUT') {
		res.setHeader('Allow', ['PUT']);
		return res.status(405).json({ message: `Method ${req.method} is not allowed` });
	}

	try {
		const access = await refreshToken(
			req,
			() => {res.setHeader('Set-Cookie', 'refresh=; HttpOnly; Secure; Max-Age=0; SameSite=Strict; Path=/');}
		);
		if (!access) {
			throw new Error('Not logged in');
		}

		let formData = null;
		const { fields, files } = await parseForm(req);

		formData = new FormData();
		formData.append('username', fields.username);
		formData.append('email', fields.email);
		formData.append('password', fields.password);
		if (files.avatar) {
			const file = files.avatar[0];
			const fileBuffer = fs.readFileSync(file.filepath);
			const blob = new Blob([fileBuffer], { type: file.mimetype });
			formData.append('avatar', blob, file.originalFilename);
		}

		// Edit user
		const response = await fetch(`https://backend:8000/api/edit/`, {
			method: 'PUT',
			headers: {
				'Authorization': `Bearer ${access}`
			},
			body: formData
		});
		if (!response) {
			throw new Error('Edit failed');
		}

		const data = await response.json();
		if (!data) {
			throw new Error('Edit failed');
		}
		if (!response.ok) {
			throw new Error(data.username || data.email || data.password || data.avatar || 'Edit failed');
		}

		return res.status(200).json({ message: 'User has been edited' });
	} catch (error) {
		console.error('API EDIT:', error);
		return res.status(500).json({ message: error.message });
	}
}
