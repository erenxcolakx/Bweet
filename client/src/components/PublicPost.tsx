import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Post {
  id: number;
  title: string;
  author: string;
  review: string;
  rating: number;
  time: string;
  cover_id: string;
  is_public: boolean;
  name: string;
  user_id: number;
}

interface PublicPostProps {
  post: Post;
}

const PublicPost: React.FC<PublicPostProps> = ({ post }) => {
  const [isImageExpanded, setIsImageExpanded] = useState(false); // Fotoğrafın büyüme durumu
  const roundedRating = Math.round(post.rating);
  const navigate = useNavigate();

  const handleImageClick = () => {
    setIsImageExpanded(!isImageExpanded); // Fotoğraf tıklandığında büyütme/daraltma
  };

  const handleUserProfileClick = () => {
    navigate(`/user/${post.user_id}`); // Profil sayfasına yönlendirme
  };

  return (
    <div className="card mb-3" style={{ maxWidth: '1000px', margin: 'auto', border: '1px solid #dee2e6' }}>
      <div className="row g-0">
        <div className="col-md-3 d-flex justify-content-center align-items-center p-2">
          <img
            className={`img-fluid rounded-3 ${isImageExpanded ? 'expanded' : ''}`}
            style={{
              maxWidth: isImageExpanded ? '300px' : '180px',
              maxHeight: isImageExpanded ? '300px' : '180px',
              cursor: 'pointer',
              transition: 'all 0.3s ease-in-out',
            }}
            onClick={handleImageClick}
            src={`https://covers.openlibrary.org/b/id/${post.cover_id}.jpg?default=https://openlibrary.org/static/images/icons/avatar_book-sm.png`}
            alt={post.title}
          />
        </div>
        <div className="col-md-9">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex flex-column">
                <div className="d-flex align-items-center mb-2">
                  <div
                    className="rounded-circle d-flex justify-content-center align-items-center"
                    onClick={handleUserProfileClick}
                    style={{
                      width: '40px',
                      height: '40px',
                      fontSize: '20px',
                      backgroundColor: !post.name || post.name === 'Anonym' ? '#ffffff' : '#000000',
                      color: !post.name || post.name === 'Anonym' ? '#000000' : '#ffffff',
                      border: !post.name || post.name === 'Anonym' ? '1px solid #000000' : '1px solid #ffffff',
                      cursor: 'pointer'
                    }}
                  >
                    {post.name ? post.name.charAt(0).toUpperCase() : '-'}
                  </div>
                  {/* Kullanıcı Bilgisi, tıklanabilir olacak */}
                  <div className="ms-2">
                    <h6 className="card-title mb-1" onClick={handleUserProfileClick} style={{ cursor: 'pointer' }}>{post.name ? post.name : 'Anonym'}</h6>
                    <span className="text-black fw-bold">{post.title}</span>
                    <span className="text-muted">
                      {' '}
                      by <span className="fst-italic"> {post.author} </span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-muted" style={{ fontSize: '14px' }}>
                {post.is_public ? 'Public' : 'Private'}
              </div>
            </div>
            <p className="card-text mt-2 overflow-auto" style={{ maxHeight: '200px' }}>
              {post.review}
            </p>
            <div className="d-flex align-items-center">
              <div className="text-warning" style={{ fontSize: '16px' }}>
                {Array.from({ length: roundedRating }, (_, i) => (
                  <span key={i}>⭐</span>
                ))}
              </div>
              <span className="ms-2 text-muted">{post.rating}/5</span>
            </div>
            <small className="text-muted mt-3">{new Date(post.time).toLocaleDateString()}</small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicPost;
