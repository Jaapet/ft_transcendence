import 'bootstrap/dist/css/bootstrap.min.css'
import React from 'react'
import { AuthenticationProvider } from '../context/AuthenticationContext'
import  Header  from '../components/Header'

function MyApp({ Component, pageProps }) {
	return (
		<AuthenticationProvider>
			<Header/>
			<Component {...pageProps} />
		</AuthenticationProvider>

	)
}

export default MyApp

