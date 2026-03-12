import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSearch } from '../context/SearchContext';
import logo from '../assets/logo.svg';
import ProfileDropdown from './ProfileDropdown';
import { FiShoppingCart } from 'react-icons/fi';
import './Navbar.css';

function Navbar() {
  const { isLoggedIn, isAdmin, logout } = useAuth();
  const { searchQuery, setSearchQuery, isSearching } = useSearch();

  const handleSearch = (e) => {
    e.preventDefault();
    // Search is handled automatically by the context
  };

  return (
    <header className="navbar-header">
      <Link to="/" className="logo-container">
        <img src={logo} alt="Cool Couture" className="logo-image" />
      </Link>
      
      <div className="search-container">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-btn">
            {isSearching ? '⏳' : '🔍'}
          </button>
        </form>
      </div>

      <nav className="navbar-nav">
        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          {!isAdmin && (
            <li><Link to="/cart" className="cart-link"><FiShoppingCart size={22} style={{ verticalAlign: 'middle' }} /> Cart</Link></li>
          )}
          {isAdmin && (
            <li><Link to="/admin/products">Admin</Link></li>
          )}
          {isLoggedIn ? (
            <li><ProfileDropdown /></li>
          ) : (
            <li><Link to="/login">Login</Link></li>
          )}
        </ul>
        {isLoggedIn && (
          <button onClick={logout} className="logout-btn navbar-logout" style={{ display: 'none' }}>Logout</button>
        )}
      </nav>
    </header>
  );
}

export default Navbar;
