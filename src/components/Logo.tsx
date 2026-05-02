import React from 'react';

interface LogoProps {
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

const Logo: React.FC<LogoProps> = ({ size = 24, color = 'currentColor', className = '', style = {} }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill={color} 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <path d="M13 2L3 14H11L10 22L21 10H13L14 2Z" />
    </svg>
  );
};

export default Logo;
