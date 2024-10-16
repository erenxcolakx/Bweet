import React, { useState } from 'react';

interface ManualBookModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (bookData: { coverId: string; title: string; authorName: string; rating: number; review: string; isPublic: boolean }) => void;
}

const ManualBookModal: React.FC<ManualBookModalProps> = ({ show, onClose, onSubmit }) => {
  const [coverId, setCoverId] = useState(''); // Kullanıcının girdiği kapak ID'si
  const [title, setTitle] = useState(''); // Kullanıcının girdiği kitap başlığı
  const [authorName, setAuthorName] = useState(''); // Kullanıcının girdiği yazar ismi
  const [rating, setRating] = useState(3); // Varsayılan olarak ortalama bir değer
  const [review, setReview] = useState(''); // Kullanıcının girdiği inceleme
  const [isPublic, setIsPublic] = useState(false); // Yayınlama durumu

  if (!show) return null; // Modal görünmüyorsa hiçbir şey render etmiyoruz

  const handleSubmit = () => {
    const bookData = { coverId, title, authorName, rating, review, isPublic };
    onSubmit(bookData); // Parent bileşene form verilerini gönderiyoruz
    onClose(); // Modalı kapat
  };

  const handleToggle = () => {
    setIsPublic(!isPublic); // isPublic değerini tersine çeviriyoruz
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-button" onClick={onClose}>
          &times;
        </button>
        <div className='mt-3'>
          {/* Cover ID Input */}
          <div className="form-group mt-3 mx-3">
            <label>Cover ID:</label>
            <input
              type="text"
              className="form-control"
              value={coverId}
              onChange={(e) => setCoverId(e.target.value)}
              placeholder="Enter Cover ID"
            />
          </div>
          {/* Title Input */}
          <div className="form-group mt-3 mx-3">
            <label>Book Title:</label>
            <input
              type="text"
              className="form-control"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter Book Title"
            />
          </div>
          {/* Author Name Input */}
          <div className="form-group mt-3 mx-3">
            <label>Author Name:</label>
            <input
              type="text"
              className="form-control"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Enter Author Name"
            />
          </div>
          {/* Rating Input */}
          <div className="form-group mt-3 mx-3">
            <label>Rating:</label>
            <input
              type="range"
              className="form-range"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              min="1"
              max="5"
              step="0.1"
            />
            <span>{rating}</span>
          </div>
          {/* Review Input */}
          <div className="form-group mt-3 mx-3">
            <label>Review:</label>
            <textarea
              className="form-control"
              style={{ height: '150px', maxHeight: '200px', overflowY: 'auto' }}
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Write a review"
            />
          </div>
          {/* Public Switch */}
          <div className="d-flex form-check form-group form-switch mt-3 mx-3 align-items-center">
            <input
              className="form-check-input"
              type="checkbox"
              role="switch"
              id="flexSwitchCheckDefault"
              onChange={handleToggle}
              checked={isPublic}
            />
            <label className="toggle-text ms-3" htmlFor='flexSwitchCheckDefault'>
              {"Publish Post"}
            </label>
          </div>
        </div>
        {/* Submit Button */}
        <button className="btn btn-primary mt-3" onClick={handleSubmit}>
          Submit
        </button>
      </div>
    </div>
  );
};

export default ManualBookModal;
