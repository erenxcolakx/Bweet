import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface SortDropdownProps {
  onSort: (sortType: string) => void;
}

const SortDropdown: React.FC<SortDropdownProps> = ({ onSort }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const handleSort = (sortType: string) => {
    if (!user) {
      navigate('/login');
      return;
    }
    onSort(sortType);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container dropdown col-sm row d-flex flex-column mx-auto w-50 my-3">
      <button className="btn btn-dark dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
        Sort by
      </button>
      <ul className="dropdown-menu">
        <li>
          <button type="button" className="dropdown-item" onClick={() => handleSort('htl')}>Rating - High-to-Low</button>
        </li>
        <li>
          <button type="button" className="dropdown-item" onClick={() => handleSort('lth')}>Rating - Low-to-High</button>
        </li>
        <li>
          <button type="button" className="dropdown-item" onClick={() => handleSort('rto')}>Time - Recent to Oldest</button>
        </li>
        <li>
          <button type="button" className="dropdown-item" onClick={() => handleSort('otr')}>Time - Oldest to Recent</button>
        </li>
      </ul>
    </div>
  );
};

export default SortDropdown;
