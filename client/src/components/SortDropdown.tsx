import React from 'react';

interface SortDropdownProps {
  onSort: (sortType: string) => void;
}

const SortDropdown: React.FC<SortDropdownProps> = ({ onSort }) => {
  return (
    <div className="container dropdown col-sm row d-flex flex-column mx-auto w-50 my-3">
      <button className="btn btn-dark dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
        Sort by
      </button>
      <ul className="dropdown-menu">
        <li>
          <button type="button" className="dropdown-item" onClick={() => onSort('htl')}>Rating - High-to-Low</button>
        </li>
        <li>
          <button type="button" className="dropdown-item" onClick={() => onSort('lth')}>Rating - Low-to-High</button>
        </li>
        <li>
          <button type="button" className="dropdown-item" onClick={() => onSort('rto')}>Time - Recent to Oldest</button>
        </li>
        <li>
          <button type="button" className="dropdown-item" onClick={() => onSort('otr')}>Time - Oldest to Recent</button>
        </li>
      </ul>
    </div>
  );
};

export default SortDropdown;
