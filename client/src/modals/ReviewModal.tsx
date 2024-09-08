import React, { useState } from 'react';
import '../styles/ReviewModal.css';
import '../styles/ToggleButton.css';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  authorName: string;
  coverId: string;
  onSubmit: (rating: number, review: string, isPublic: boolean) => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, title, authorName, coverId, onSubmit }) => {
  const [rating, setRating] = useState<number>(0);
  const [review, setReview] = useState<string>('');
  const [isPublic, setIsPublic] = useState<boolean>(false);

  const handleSubmit = () => {
    onSubmit(rating, review, isPublic);
    onClose(); // Modal'ı kapatmak için
  };
  if (!isOpen) return null;

  const handleToggle = () => {
    setIsPublic((prevState) => !prevState); // Toggle'ı değiştirme
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-button" onClick={onClose}>
          &times;
        </button>
        <div className='mt-3 d-flex flex-md-row flex-column justify-content-md-start justify-content-center '>
            <div className='d-flex justify-content-md-start justify-content-center'>
                <img
                  className="modal-book-img "
                  src={`https://covers.openlibrary.org/b/id/${coverId}.jpg?default=https://openlibrary.org/static/images/icons/avatar_book-sm.png`}
                  alt={title}
                />
            </div>
            <div className='d-flex flex-column col-auto col-sm-12 col-md-7 col-lg-8'>
                <div className='mx-4 my-1 text-center text-md-start'>
                    <h2 className='oswald-mid mt-md-0 mt-2'>{title}</h2>
                    <p>by <span className='fst-italic'>{authorName}</span> </p>
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
                    step="0.1" // Değeri 1'er 1'er artırıp azaltmak için step'i belirliyoruz
                  />
                  <span>{rating}</span> {/* Kullanıcının seçtiği değeri göstermek için */}
                </div>
                <div className="form-group mt-3 mx-3">
                    <label>Review:</label>
                    <textarea
                      className="form-control"
                      style={{height:'150px', maxHeight:'200px', overflowY: 'auto'}}
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                    />
                </div>
                <div className="d-flex form-check form-group form-switch mt-3 mx-3 align-items-center">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    id="flexSwitchCheckDefault"
                    onChange={handleToggle}
                    checked={!isPublic} // Durumun tersini gösterir (true: checked)
                  />
                  <label className="toggle-text ms-3 barlow-condensed-semibold" htmlFor='flexSwitchCheckDefault'>
                    {"Publish Post"}
                  </label>
                </div>
            </div>
        </div>
        <button className="btn btn-primary mt-3" onClick={handleSubmit}>
              Submit
        </button>
      </div>
    </div>
  );
};

export default ReviewModal;
