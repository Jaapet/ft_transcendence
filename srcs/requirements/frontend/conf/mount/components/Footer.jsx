import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import styles from '../styles/header.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <Container>
        <Row className="justify-content-center">

          <Col sm={6} md={4}>
            <h6 >Contact Us :</h6>
              <div> no please don't</div>
          </Col>

		  <Col sm={6} md={4}>
            <p className="text-white">&copy; {new Date().getFullYear()} my footer. All Rights Reserved.</p>
            <p className="text-white">Designed by *Me*</p>
          </Col>

		  <Col sm={6} md={4}>
            <h6>Social Media</h6>
              <div><a href="https://youtu.be/dQw4w9WgXcQ?feature=shared" className="text-white" target="_blank" rel="noopener noreferrer">Youtube</a></div>
              {/* target="_blank" and rel="noopener noreferrer" new window */}
          </Col>

    
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
