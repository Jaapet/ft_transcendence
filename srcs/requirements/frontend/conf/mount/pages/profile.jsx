import React, { useContext } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import styles from '../styles/profile.module.css';
import AuthenticationContext from '../context/AuthenticationContext';

const Profile = () => {
    const { user } = useContext(AuthenticationContext);

    if (!user) {
        return <p>Veuillez vous connecter pour accéder à votre profil.</p>;
    }

    return (
        <div className={styles.container}>
            <Head>
                <title>Profile - Transcendence</title>
            </Head>
            <h1>My Profile</h1>
            <div className={styles.profileDetails}>
                <Image src={user.avatar} alt="Profile Picture" width={150} height={150} className={styles.profilePicture} />
                <div className={styles.info}>
                    <p>Name: {user.username}</p>
                    <p>Email: {user.email}</p>
                    <p>Bio: {user.bio}</p>
                    <p>Joined on: {user.join_date}</p>
                </div>
            </div>
        </div>
    );
};

export default Profile;
