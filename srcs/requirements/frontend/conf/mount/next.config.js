module.exports = {
	images: {
		remotePatterns: [{
			protocol: 'http',
			hostname: 'backend',
			port: '8000',
			pathname: '/media/**',
		}],
	},
}