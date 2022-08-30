import { TelescopeIcon } from '@primer/octicons-react';
import Logo from './logo.svg';

const Header = () => (
  <div className="banner">
    <div className="banner-container">
      <div className="banner-left">
        <img className="logo" src={Logo} alt="iExec logo" />
      </div>
      <div className="banner-middle">
        Oracle <span>Watcher</span>
        <div className="telescope-div">
          <TelescopeIcon size={24} className="telescope-icon" />
        </div>
      </div>
      <div className="banner-right">
        <div className="chain">iExec Sidechain</div>
      </div>
    </div>
  </div>
);

export default Header;
