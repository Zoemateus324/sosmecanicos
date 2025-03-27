import React from 'react';
import { Profile as ProfileComponent } from '../components/Profile';
import { Layout } from '../components/Layout';

export default function Profile() {
  return (
    <Layout>
      <ProfileComponent />
    </Layout>
  );
}