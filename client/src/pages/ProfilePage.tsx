import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext'; // Assuming you have an AuthContext for user data
import { useNavigate } from 'react-router-dom'; // Use navigate for redirection

const ProfilePage: React.FC = () => {
  const { user, setUser } = useAuth(); // Retrieve user data from context
  const [profileData, setProfileData] = useState({ email: '', name: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const navigate = useNavigate(); // Hook to navigate between routes

  // Fetch user profile details when the component mounts
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Check if user is logged in
        if (!user) {
          navigate('/login'); // Redirect to login if user is not authenticated
          return;
        }

        const response = await axios.get(`${process.env.REACT_APP_AUTH_ADDRESS}/api/profile`, { withCredentials: true });
        if (response.data.success) {
          setProfileData(response.data.user);
          setName(response.data.user.name); // To prefill the name in the edit form
        } else {
          navigate('/login'); // Redirect to login if fetching profile data fails
        }
      } catch (error) {
        console.error('Failed to load profile data', error);
        navigate('/login'); // Redirect to login if error occurs
      }
    };

    fetchProfile();
  }, [user, navigate]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${process.env.REACT_APP_AUTH_ADDRESS}/api/profile/update`, {
        name: name,
      }, { withCredentials: true });

      if (response.data.success) {
        setProfileData(prev => ({ ...prev, name: name }));
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Failed to update profile', error);
    }
  };
  return (
    <div className="profile-page container mt-5">
      <h1 className="josefin-sans-1">Profile Page</h1>
      <div className="profile-details mt-4">
        <p><strong>Email:</strong> {profileData.email}</p>
        <p><strong>Name:</strong> {profileData.name}</p>
      </div>
      {isEditing ? (
        <form onSubmit={handleSubmit} className="edit-form mt-4">
          <div className="form-group">
            <label htmlFor="name">Name:</label>
            <input
              id="name"
              type="text"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-warning mt-2">Save Changes</button>
        </form>
      ) : (
        <button onClick={handleEditToggle} className="btn btn-dark mt-3">Edit Profile</button>
      )}
    </div>
  );
};

export default ProfilePage;
