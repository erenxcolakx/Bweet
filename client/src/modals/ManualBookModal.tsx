import React, { useState } from 'react';

interface ManualBookModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (bookData: { coverImage: File | null; title: string; author: string; rating: number; review: string; isPublic: boolean }) => void;
}

const ManualBookModal: React.FC<ManualBookModalProps> = ({ show, onClose, onSubmit  }) => {
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [rating, setRating] = useState(3);
  const [review, setReview] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  if (!show) return null;

  const handleSubmit = () => {
    onSubmit({ coverImage, title, author: author, rating, review, isPublic });  // Parent bileşene form verilerini gönderiyoruz
    onClose();
  };

  const handleToggle = () => {
    setIsPublic(!isPublic);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-button" onClick={onClose}>
          &times;
        </button>
        <div className="mt-3">
          <div className="form-group mt-3 mx-3">
            <label>Cover Image:</label>
            <input
              type="file"
              className="form-control"
              accept="image/png, image/jpeg, image/webp"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  setCoverImage(e.target.files[0]);
                }
              }}
            />
          </div>
          <div className="form-group mt-3 mx-3">
            <label>Book Title:</label>
            <input
              type="text"
              className="form-control"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter Book Title"
              required
            />
          </div>
          <div className="form-group mt-3 mx-3">
            <label>Author Name:</label>
            <input
              type="text"
              className="form-control"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Enter Author Name"
              required
            />
          </div>
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
              required
            />
            <span>{rating}</span>
          </div>
          <div className="form-group mt-3 mx-3">
            <label>Review:</label>
            <textarea
              className="form-control"
              style={{ height: '150px', maxHeight: '200px', overflowY: 'auto' }}
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Write a review"
              required
            />
          </div>
          <div className="d-flex form-check form-group form-switch mt-3 mx-3 align-items-center">
            <input
              className="form-check-input"
              type="checkbox"
              role="switch"
              id="flexSwitchCheckDefault"
              onChange={handleToggle}
              checked={isPublic}
            />
            <label className="toggle-text ms-3 barlow-condensed-semibold" htmlFor="flexSwitchCheckDefault">
              {isPublic ? 'Public Post' : 'Private Post'}
            </label>
          </div>
        </div>
        <button className="btn btn-primary mt-3" onClick={handleSubmit}>
          Submit
        </button>
      </div>
    </div>
  );
};

export default ManualBookModal;
