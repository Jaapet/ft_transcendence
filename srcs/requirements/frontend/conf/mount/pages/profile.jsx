import React from 'react';
import Head from 'next/head';
import Image from 'next/image';
import styles from '../styles/profile.module.css';
import {useRouter} from 'next/router'

const Profile = ({ profile }) => {
	const router = useRouter();

	if (!profile) {
		router.push('/errorNotFound');
		return null;
	  }
  return (
    <div className={styles.container}>
      <Head>
        <title>Profile - Transcendence</title>
      </Head>
      <h1>My Profile</h1>
      <div className={styles.profileDetails}>
        <Image src={profile.avatar} alt="Profile Picture" width={150} height={150} className={styles.profilePicture} />
        <div className={styles.info}>
          <p>Name: {profile.username}</p>
          <p>Email: {profile.email}</p>
          <p>Bio: {profile.bio}</p>
          <p>Joined on: {profile.join_date}</p>
        </div>
      </div>
    </div>
  );
};

export async function getServerSideProps(context) {
  const { id } = context.query;
  const res = await fetch(`http://backend:8000/api/members/${id}`);

  if (!res.ok) {
    return {
      props: { profile: null },
    };
  }

  const profile = await res.json();

  return {
    props: { profile },
  };
}

export default Profile;
