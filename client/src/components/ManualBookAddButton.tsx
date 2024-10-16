import React from 'react';

interface ManualBookAddButtonProps {
  onClick: () => void;  // Butona tıklandığında modalı açmak için fonksiyon
}

const ManualBookAddButton: React.FC<ManualBookAddButtonProps> = ({ onClick }) => {
  return (
    <div className='col container d-flex justify-content-center align-self-center'>
        <button className="container btn btn-primary" onClick={onClick}>
            Add Book Manually
        </button>
    </div>
  );
};

export default ManualBookAddButton;
