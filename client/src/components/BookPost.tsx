import React, { useState } from 'react';

interface BookPostProps {
  post: {
    id: number;
    title: string;
    author: string;
    cover_id: string | null;
    cover_image: string | { type: string, data: number[] } | null;
    rating: number;
    review: string;
    time: string;
    is_public: boolean;
  };
  onDelete: (id: number) => void;
  onUpdate: (id: number, editedReview: string, editedRating: number, isPublic: boolean) => void;
}

const BookPost: React.FC<BookPostProps> = ({ post, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedReview, setEditedReview] = useState(post.review);
  const [editedRating, setEditedRating] = useState(post.rating);
  const [isPublic, setIsPublic] = useState(post.is_public);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedReview(post.review);
    setEditedRating(post.rating);
    setIsPublic(post.is_public);
  };

  const handleUpdate = () => {
    onUpdate(post.id, editedReview, editedRating, isPublic);
    setIsEditing(false);
  };

  const roundedRating = Math.round(editedRating);

  return (
    <div className="post container" style={{ maxWidth: '1200px', margin: 'auto' }}>
      <div className="card row d-flex rounded-2 flex-md-row flex-column justify-content-md-start justify-content-center">
        <div className="col-md-3 col-12 d-flex justify-content-center rounded-2 p-2" style={{ padding: 0 }}>
        <img
          className="rounded-2 img-fluid col-md-12"
          style={{ margin: 0, maxHeight: '500px' }}
          src={
            post.cover_id
              ? `https://covers.openlibrary.org/b/id/${post.cover_id}.jpg`
              : typeof post.cover_image === 'string'
                ? post.cover_image
                : '/images/defbookcover.jpg'
          }
          alt={post.title}
        />

        </div>
        <div className="col-md-9 col-12 mt-1 mb-1 d-flex">
          <div className="d-flex flex-column mb-4 mt-1 w-100">
            <h3 className="card-title text-md-start text-center oswald-mid">{post.title}</h3>
            <h6 className="card-text text-body-secondary mt-1 text-md-start text-center fst-italic">{post.author}</h6>
            <div className="card-text">
              {isEditing ? (
                <div className='gap-0 my-0'>
                  <input
                    type="range"
                    className="form-range text-md-start text-center"
                    min="1"
                    max="5"
                    step="0.1"
                    value={editedRating}
                    onChange={(e) => setEditedRating(Number(e.target.value))} />
                  <p className='d-inline-block'>⭐ {editedRating}</p>
                </div>
              ) : (
                <div className='text-md-start text-center my-2 '>
                  {Array.from({ length: roundedRating }, (_, i) => '⭐')}
                  , {post.rating}
                </div>
              )}
            </div>
            <div className="card-text text-break" id={`review${post.id}`} style={{ maxHeight: '250px', overflowY: 'auto' }}>
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
            {isEditing && (
              <div className="d-flex form-check form-group form-switch mt-3 align-items-center">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={`isPublicSwitch${post.id}`}
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                />
                <label className="form-check-label ms-2 barlow-condensed-semibold" htmlFor={`isPublicSwitch${post.id}`}>
                  {isPublic ? 'Publish Post' : 'Private Post'}
                </label>
              </div>
            )}
            <div className="d-flex gap-2">
              {isEditing ? (
                <>
                  <button type="button" className="btn btn-dark border-light btn-sm rounded-5 btn-light mt-2 mb-2" onClick={handleUpdate}>
                    <i className="bi bi-check-lg"></i>
                  </button>
                  <button type="button" className="btn btn-dark border-light btn-sm rounded-5 btn-light mt-2 mb-2" onClick={handleCancel}>
                    <i className="bi bi-x-lg"></i>
                  </button>
                  <button type="button" className="btn btn-dark border-light btn-sm rounded-5 btn-light mt-2 mb-2" onClick={() => onDelete(post.id)}>
                    <i className="bi bi-trash3-fill"></i>
                  </button>
                </>
              ) : (
                <>
                  <button type="button" className="btn btn-dark border-light btn-sm rounded-5 btn-light mt-2 mb-2" onClick={handleEdit}>
                    <i className="bi bi-pencil-square"></i>
                  </button>
                  <button type="button" className="btn btn-dark border-light btn-sm rounded-5 btn-light mt-2 mb-2" onClick={() => onDelete(post.id)}>
                    <i className="bi bi-trash3-fill"></i>
                  </button>
                </>
              )}
            </div>
            <p className="card-text mt-auto text-md-start text-center">
              <small className="text-body-secondary">
                {new Date(post.time).toLocaleDateString()} - {isPublic ? 'Published' : 'Private'}
              </small>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookPost;
