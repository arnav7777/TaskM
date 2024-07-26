import Navbar from './Navbar';
import '../css/layout.css';
import Footer from './Footer';

const Layout = ({ children }) => {
    return (
        <div className="wrapper">
            <Navbar className="navbar" />
            <div className="content">
                {children}
            </div>
            <Footer className="footer"/>
        </div>
    );
};

export default Layout;
