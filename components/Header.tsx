
import React from 'react';

interface HeaderProps {
  toggleDarkMode: () => void;
  isDarkMode: boolean;
}

const Header: React.FC<HeaderProps> = ({ toggleDarkMode, isDarkMode }) => {
  return (
    <header>
      <div className="header">ROMAN SOROKA</div>
      <span className="info">
        I'm Roman Soroka, a professional retoucher with over 14 years of experience. I have extensive experience in stock photo editing (lifestyle, sport, business, portraits, still-life) and an ability to work quickly and efficiently under tight deadlines.
      </span>
      <br />
      <a href="mailto:romeosoroka@gmail.com" title="Email">
        <i className='contact fa-solid fa-envelope' style={{ fontSize: '23px' }}></i>
      </a>
      <a href="https://t.me/romeosoroka" target="_blank" title="Telegram" rel="noopener noreferrer">
        <i className='contact fa-brands fa-telegram' style={{ fontSize: '23px' }}></i>
      </a>
      <div className="dark-mode-button" onClick={toggleDarkMode} title="switch background">
        <i className={`dark-mode-icon ${isDarkMode ? 'fa-solid fa-sun' : 'fa-solid fa-moon'}`}></i>
      </div>
      <hr style={{ margin: '20px auto', width: '40%' }} />
    </header>
  );
};

export default Header;
