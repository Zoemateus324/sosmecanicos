import React from 'react';
import { Profile as ProfileComponent } from '../components/Profile';

export default function Profile() {
  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="container mx-auto px-4">
        <ProfileComponent />
      </div>
    </div>
  );
}