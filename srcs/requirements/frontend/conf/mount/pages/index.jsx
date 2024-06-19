import Head from 'next/head';
import styles from '../styles/home.module.css';
import BigTitle from '../components/BigAssTitle';
import { useAuth } from '../context/AuthenticationContext';

const VideoBackground = () => (
	<div className={styles.videoBackground}>
		<div className={styles.videoOverlay}></div>
		<iframe src="images/tmp_background.gif" allowFullScreen></iframe>
	</div>
);

export default function Home({ status, detail }) {
	const { logout } = useAuth();

	const handleLogout = async () => {
		await logout();
	}

	if (status === 401 && detail === 'Not logged in') {
		handleLogout();
	}

	if (status !== 200) {
		return (
			<div className={styles.container}>
				<p className="bg-light text-black">Something went wrong...</p>
				<p className="bg-light text-black">Please reload the page.</p>
			</div>
		);
	}

	return (
		<div className={styles.container}>
			<Head>
				<title>Transcendence</title>
			</Head>

			<style jsx global>{`
				body {
					background-color: rgb(0, 0, 0);
				}
			`}</style>

			<VideoBackground />
			<BigTitle />
		</div>
	);
}

export async function getServerSideProps(context) {
	try {
		const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/user`, {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
				'Cookie': context.req.headers.cookie
			}
		});
		if (!response) {
			throw new Error('Dummy fetch failed');
		}
		if (response.status === 404) {
			return {
				props: {
					status: 404,
					detail: 'Resource not found'
				}
			}
		}

		const data = await response.json();
		if (!data) {
			throw new Error('Dummy fetch failed');
		}
		if (!response.ok) {
			throw new Error(data.message, 'Dummy fetch failed');
		}

		return {
			props: {
				status: 200,
				detail: 'Success'
			}
		}
	} catch (error) {
		return {
			props: {
				status: 401,
				detail: error.message
			}
		}
	}
}
