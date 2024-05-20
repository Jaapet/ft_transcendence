import React, { useContext } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import styles from '../styles/base.module.css'
import AuthenticationContext from '../context/AuthenticationContext';
import Header from '../components/Header';

const Profile = () => {
    const { user } = useContext(AuthenticationContext);

    if (!user) {
        return <p>Loading...</p>;
    }

    return (
		<div>
			<Header/>
		<div className={styles.container}>
            <Head>
                <title>Profile Page</title>
            </Head>
            <h1 className={`mt-3 ${styles.background_title}`}>My Profile</h1>
            <div className="row">
                <div className="col-md-4">
                    <div className="card">
                        <Image src={user.avatar} alt="Profile Picture" width={150} height={150} className="card-img-top" />
                        <div className="card-body">
                            <h5 className="card-title">{user.username}</h5>
                            <p className="card-text">{user.bio}</p>
                            <p className="card-text"><small className="text-muted">Joined on: {user.join_date}</small></p>
                        </div>
                    </div>
                </div>
                <div className="col-md-8">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title">Contact Information</h5>
                            <p className="card-text">Email: {user.email}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
		</div>
    );
};

export default Profile;
