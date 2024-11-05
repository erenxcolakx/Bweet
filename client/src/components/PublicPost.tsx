import { useNavigate } from 'react-router-dom';
import '../styles/PostStyles.css'
interface Post {
  id: number;
  title: string;
  author: string;
  review: string;
  rating: number;
  time: string;
  cover_id: string | null;
  cover_image: Buffer | null;
  is_public: boolean;
  name: string;
  user_id: number;
}

interface PublicPostProps {
  post: Post;
}



const PublicPost: React.FC<PublicPostProps> = ({ post }) => {
  const roundedRating = Math.round(post.rating);
  const navigate = useNavigate();


  const handleUserProfileClick = () => {
    navigate(`/user/${post.user_id}`); // Profil sayfasına yönlendirme
  };

  const handleBookClick = (title: string, author: string) => {
    navigate(`/books/${encodeURIComponent(title)}/${encodeURIComponent(author)}`); // Title ve author bilgileriyle yönlendirme
  };
  return (
    <div className='post container'> {/* Just for class filtering */}
      <div className="card mb-3" style={{ maxWidth: '1000px', margin: 'auto', border: '1px solid #dee2e6' }}>
        <div className="row g-0">
          <div className="col-md-3 d-flex justify-content-center align-items-center p-2">
            <img
              className={`img-fluid rounded-3 `}
              src={
                post.cover_id
                  ? `https://covers.openlibrary.org/b/id/${post.cover_id}.jpg`
                  : post.cover_image
                  ? `data:image/jpeg;base64,${post.cover_image}`
                  : '/images/defbookcover.jpg'
              }
              alt={post.title}
            />
          </div>
          <div className="col-md-8">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex flex-column">
                  <div className="d-flex align-items-center mb-2">
                    <div
                      className="user-profile-img rounded-circle d-flex justify-content-center align-items-center"
                      onClick={post.name ? handleUserProfileClick : undefined}
                      style={{
                        backgroundColor: !post.name || post.name === 'Anonym' ? '#ffffff' : '#000000',
                        color: !post.name || post.name === 'Anonym' ? '#000000' : '#ffffff',
                        border: !post.name || post.name === 'Anonym' ? '1px solid #000000' : '1px solid #ffffff',
                        cursor: post.name ? 'pointer' : 'default'
                      }}
                    >
                      {post.name ? post.name.charAt(0).toUpperCase() : '-'}
                    </div>
                    {/* Kullanıcı Bilgisi, tıklanabilir olacak */}
                    <div className="ms-2">
                      <h6
                        className="card-title mb-1 user-name-text"
                        onClick={post.name ? handleUserProfileClick : undefined} // Eğer post.name yoksa onClick'i devre dışı bırak
                        style={{ cursor: post.name ? 'pointer' : 'default' }} // Cursor işaretçisi tıklanabilirlik durumuna göre değişir
                      >
                        {post.name ? post.name : 'Anonym'}
                      </h6>
                      <span
                        className="book-text fw-bold"
                        style={{cursor: 'pointer'}}
                        onClick={() => handleBookClick(post.title, post.author)}>
                        {post.title}
                      </span>
                      <span className="text-muted">
                        {' '}
                        by <span className="fst-italic"> {post.author} </span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-muted px-2" style={{ fontSize: '14px' }}>
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
    </div>
  );
};

export default PublicPost;
