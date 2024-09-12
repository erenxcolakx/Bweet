import React, { useState } from 'react';

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
}

interface PublicPostProps {
  post: Post;
}

const PublicPost: React.FC<PublicPostProps> = ({ post }) => {
  const [isImageExpanded, setIsImageExpanded] = useState(false); // Fotoğrafın büyüme durumu
  const roundedRating = Math.round(post.rating);

  const handleImageClick = () => {
    setIsImageExpanded(!isImageExpanded); // Fotoğraf tıklandığında büyütme/daraltma
  };

  return (
    <div className="card mb-3" style={{ maxWidth: '1000px', margin: 'auto', border: '1px solid #dee2e6' }}>
      <div className="row g-0">
        <div className="col-md-3 d-flex justify-content-center align-items-center p-2">
          <img
            className={`img-fluid rounded-3 ${isImageExpanded ? 'expanded' : ''}`} // Duruma göre sınıf ekleniyor
            style={{
              maxWidth: isImageExpanded ? '300px' : '180px', // Büyüklük değişiyor
              maxHeight: isImageExpanded ? '300px' : '180px',
              cursor: 'pointer',
              transition: 'all 0.3s ease-in-out', // Yumuşak geçiş
            }}
            onClick={handleImageClick} // Tıklama olayını bağla
            src={`https://covers.openlibrary.org/b/id/${post.cover_id}.jpg?default=https://openlibrary.org/static/images/icons/avatar_book-sm.png`}
            alt={post.title}
          />
        </div>
        <div className="col-md-9">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex flex-column">
                <div className="d-flex align-items-center mb-2">
                  {/* Profil Resmi Div'i */}
                  <div
                    className="rounded-circle d-flex justify-content-center align-items-center bg-dark text-white"
                    style={{ width: '40px', height: '40px', fontSize: '20px' }}
                  >
                    {/* Eğer isim varsa ilk harf, yoksa "-" */}
                    {post.name ? post.name.charAt(0).toUpperCase() : '-'}
                  </div>
                  {/* Kullanıcı Bilgisi */}
                  <div className="ms-2">
                    <h6 className="card-title mb-1">{post.name ? post.name : 'Anonym'}</h6>
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
