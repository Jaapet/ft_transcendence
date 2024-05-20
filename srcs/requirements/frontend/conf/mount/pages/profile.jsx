import React, { useContext } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import '../styles/base.css'
import AuthenticationContext from '../context/AuthenticationContext';

const Profile = () => {
    const { user } = useContext(AuthenticationContext);

    if (!user) {
        return <p>Veuillez vous connecter pour accéder à votre profil.</p>;
    }

    return (
        <div className="container mt-5">
            <Head>
                <title>Profile - Transcendence</title>
            </Head>
            <h1 className="mb-4">My Profile</h1>
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
    );
};

export default Profile;
