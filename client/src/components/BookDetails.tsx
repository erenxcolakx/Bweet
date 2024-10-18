import React, { useState } from 'react';

interface BookDetailsProps {
  title: string;
  author: string;
  coverId: string;
  onSubmit: (review: string, rating: number) => void;
}

const BookDetails: React.FC<BookDetailsProps> = ({ title, author, coverId, onSubmit }) => {
  const [review, setReview] = useState('');
  const [rating, setRating] = useState(3);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(review, rating);
  };

  return (
    <div className="container d-flex flex-column flex-lg-row align-items-center">
      <div className="col col-4 d-flex justify-content-center">
        <img
          src={coverId ? `https://covers.openlibrary.org/b/id/${coverId}.jpg` : '/images/defbookcover.jpg'}
          alt="Book Cover"
          style={{ width: '300px', maxWidth: '100%', height: 'auto' }}
        />
      </div>
      <div className="col col-8 ms-lg-2 mt-3 mt-lg-0 mb-3 flex-column align-items-center align-items-lg-start">
        <h1 className="cinzel-decorative-bold text-center text-lg-start">{title}</h1>
        <h5 className="text-center text-lg-start">{author}</h5>
        <form onSubmit={handleSubmit}>
          <input type="hidden" name="title" value={title} />
          <input type="hidden" name="author" value={author} />
          <input type="hidden" name="coverId" value={coverId} />
          <div className="form-group">
            <textarea
              className="form-control"
              id="textAreaReview"
              name="review"
              style={{ height: '300px' }}
              placeholder="Write your review"
              required
              value={review}
              onChange={(e) => setReview(e.target.value)}
            ></textarea>
          </div>
          <div>
            <label htmlFor="rating" className="form-label mt-2">Give it a rating from 1 to 5.</label>
            <input
              type="range"
              className="form-range"
              name="rating"
              min="1"
              max="5"
              step="0.1"
              id="rating"
              value={rating}
              onChange={(e) => setRating(parseFloat(e.target.value))}
            />
            <p id="bookRating">Given rating: {rating}</p>
          </div>
          <div className="mt-2">
            <button type="submit" className="btn btn-outline-light">Submit</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookDetails;
