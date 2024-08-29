import React, { useState } from 'react';

interface BookPostProps {
  post: {
    id: number;
    title: string;
    author: string;
    cover_id: string;
    rating: number;
    review: string;
    time: string;
  };
  onDelete: (id: number) => void;
  onUpdate: (id: number, editedReview: string) => void;
}

const BookPost: React.FC<BookPostProps> = ({ post, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedReview, setEditedReview] = useState(post.review);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedReview(post.review);
  };

  const handleUpdate = () => {
    onUpdate(post.id, editedReview);
    setIsEditing(false);
  };

  const roundedRating = Math.round(post.rating);

  return (
    <div className="col-12" style={{ maxWidth: '1200px', margin: 'auto' }}>
      <div className="row rounded-2" style={{ border: '1px solid rgb(5, 0, 0)' }}>
        <div className="col-md-3 col-5 d-flex justify-content-center rounded-start-2" style={{ maxWidth: '326px', maxHeight: '500px', marginLeft: '-12px' }}>
          <img
            className="rounded-start-2 img-fluid me-auto"
            src={`https://covers.openlibrary.org/b/id/${post.cover_id}.jpg?default=https://openlibrary.org/static/images/icons/avatar_book-sm.png`}
            alt={post.title}
          />
        </div>
        <div className="col-md-8 col-7 mt-1 mb-1 d-flex">
          <div className="d-flex flex-column mb-4 mt-1 w-100">
            <h3 className="card-title">{post.title}</h3>
            <h6 className="card-text text-body-secondary mt-1">{post.author}</h6>
            <p className="card-text">
              {Array.from({ length: roundedRating }, (_, i) => '⭐')}
              , {post.rating}
            </p>
            <div className="card-text text-break" id={`review${post.id}`} style={{ maxHeight: '150px', overflowY: 'auto' }}>
              {isEditing ? (
                <textarea
                  className="form-control"
                  style={{ height: '200px' }}
                  value={editedReview}
                  onChange={(e) => setEditedReview(e.target.value)}
                />
              ) : (
                post.review
              )}
            </div>
            <div className="d-flex gap-2">
              {isEditing ? (
                <>
                  <button type="button" className="btn btn-dark border-light btn-sm rounded-5 btn-light mt-2 mb-2" onClick={handleUpdate}>
                    <i className="bi bi-check-lg"></i>
                  </button>
                  <button type="button" className="btn btn-dark border-light btn-sm rounded-5 btn-light mt-2 mb-2" onClick={handleCancel}>
                    <i className="bi bi-x-lg"></i>
                  </button>
                </>
              ) : (
                <button type="button" className="btn btn-dark border-light btn-sm rounded-5 btn-light mt-2 mb-2" onClick={handleEdit}>
                  <i className="bi bi-pencil-square"></i>
                </button>
              )}
            </div>
            <p className="card-text mt-auto">
              <small className="text-body-secondary">{new Date(post.time).toLocaleDateString()}</small>
            </p>
          </div>
          <div>
            <button type="button" className="btn rounded-circle mt-2" onClick={() => onDelete(post.id)}>
              <i className="bi bi-trash3-fill"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookPost;
