import React, { useState, useEffect } from 'react';

interface ManualBookModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (bookData: { coverImage: File | null; title: string; author: string; rating: number; review: string; isPublic: boolean }) => void;
}

const ManualBookModal: React.FC<ManualBookModalProps> = ({ show, onClose, onSubmit }) => {
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [rating, setRating] = useState(3);
  const [review, setReview] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [errors, setErrors] = useState({ title: '', author: '', review: '' }); // Error state

  // Modal kapandığında form alanlarını sıfırlamak için useEffect kullanıyoruz
  useEffect(() => {
    if (!show) {
      setCoverImage(null);
      setTitle('');
      setAuthor('');
      setRating(3);
      setReview('');
      setIsPublic(false);
      setErrors({ title: '', author: '', review: '' });
    }
  }, [show]);

  if (!show) return null;

  const handleSubmit = () => {
    let hasError = false;
    const newErrors = { title: '', author: '', review: '' };

    // Check if required fields are filled
    if (!title) {
      newErrors.title = 'Book title is required';
      hasError = true;
    }
    if (!author) {
      newErrors.author = 'Author name is required';
      hasError = true;
    }
    if (!review) {
      newErrors.review = 'Review is required';
      hasError = true;
    }

    // Update error state
    setErrors(newErrors);

    if (!hasError) {
      onSubmit({ coverImage, title, author, rating, review, isPublic });
      onClose();
    }
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
            />
            {errors.title && <p className="text-danger">{errors.title}</p>}
          </div>
          <div className="form-group mt-3 mx-3">
            <label>Author Name:</label>
            <input
              type="text"
              className="form-control"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Enter Author Name"
            />
            {errors.author && <p className="text-danger">{errors.author}</p>}
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
            />
            {errors.review && <p className="text-danger">{errors.review}</p>}
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
