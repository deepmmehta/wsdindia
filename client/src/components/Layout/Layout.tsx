import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { Heart, Home, Users, Dog, Menu, X } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navigationItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/dogs', label: 'Dogs', icon: Dog },
    { path: '/volunteers', label: 'Volunteers', icon: Users },
  ];

  const isActivePath = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Container>
      <Header>
        <HeaderContent>
          <Logo>
            <Heart size={24} color="#ef4444" />
            <LogoText>
              <span>WSD</span>
              <span>Care Tracker</span>
            </LogoText>
          </Logo>

          <MobileMenuButton 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </MobileMenuButton>

          <DesktopNav>
            {navigationItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                $isActive={isActivePath(item.path)}
              >
                <item.icon size={20} />
                {item.label}
              </NavLink>
            ))}
          </DesktopNav>
        </HeaderContent>
      </Header>

      <MobileNav $isOpen={isMobileMenuOpen}>
        {navigationItems.map((item) => (
          <MobileNavLink
            key={item.path}
            to={item.path}
            $isActive={isActivePath(item.path)}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <item.icon size={20} />
            {item.label}
          </MobileNavLink>
        ))}
      </MobileNav>

      <Main $isMobileMenuOpen={isMobileMenuOpen}>
        {children}
      </Main>
    </Container>
  );
};

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f8fafc;
`;

const Header = styled.header`
  background-color: white;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: inherit;
`;

const LogoText = styled.div`
  display: flex;
  flex-direction: column;
  line-height: 1.2;

  span:first-child {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1e293b;
  }

  span:last-child {
    font-size: 0.75rem;
    font-weight: 500;
    color: #64748b;
  }

  @media (max-width: 640px) {
    span:first-child {
      font-size: 1.125rem;
    }
    span:last-child {
      font-size: 0.6875rem;
    }
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.375rem;
  transition: all 0.2s;

  &:hover {
    background-color: #f1f5f9;
    color: #334155;
  }

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const DesktopNav = styled.nav`
  display: flex;
  gap: 1rem;

  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled(Link)<{ $isActive: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.2s;
  
  color: ${props => props.$isActive ? '#2563eb' : '#64748b'};
  background-color: ${props => props.$isActive ? '#eff6ff' : 'transparent'};

  &:hover {
    background-color: ${props => props.$isActive ? '#dbeafe' : '#f1f5f9'};
    color: ${props => props.$isActive ? '#1d4ed8' : '#334155'};
  }
`;

const MobileNav = styled.nav<{ $isOpen: boolean }>`
  display: none;
  position: fixed;
  top: 64px;
  left: 0;
  right: 0;
  background-color: white;
  border-bottom: 1px solid #e2e8f0;
  z-index: 90;
  transform: ${props => props.$isOpen ? 'translateY(0)' : 'translateY(-100%)'};
  transition: transform 0.3s ease;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
  }
`;

const MobileNavLink = styled(Link)<{ $isActive: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  text-decoration: none;
  font-weight: 500;
  font-size: 1rem;
  border-bottom: 1px solid #f1f5f9;
  transition: all 0.2s;
  
  color: ${props => props.$isActive ? '#2563eb' : '#64748b'};
  background-color: ${props => props.$isActive ? '#eff6ff' : 'transparent'};

  &:hover {
    background-color: ${props => props.$isActive ? '#dbeafe' : '#f8fafc'};
    color: ${props => props.$isActive ? '#1d4ed8' : '#334155'};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const Main = styled.main<{ $isMobileMenuOpen: boolean }>`
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem 1rem;
  width: 100%;
  
  @media (max-width: 768px) {
    opacity: ${props => props.$isMobileMenuOpen ? 0.3 : 1};
    pointer-events: ${props => props.$isMobileMenuOpen ? 'none' : 'auto'};
    transition: opacity 0.3s ease;
    padding: 1rem;
  }
`;

export default Layout;