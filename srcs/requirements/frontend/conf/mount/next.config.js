/*
TODO:
Once HTTPS is configured, we could in theory remove the /fapi replacement
But if it's useful, feel free to keep it and uncomment the backend one
*/

module.exports = {
	images: {
		remotePatterns: [{
			protocol: 'http',
			hostname: 'backend',
			port: '8000',
			pathname: '/media/**',
		}],
	},
	async rewrites() {
		return [
			{
				source: '/fapi/:path*',
				destination: 'http://localhost:3000/api/:path*'
			},
//			{
//				source: '/bapi/:path*',
//				destination: 'http://backend:8000/api/:path*'
//			}
		]
	}
}
