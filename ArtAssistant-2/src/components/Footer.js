import React from "react";
import { Link } from "react-router-dom";

// Footer
export default function Footer() {
    return (
        <footer className="text-light py-4" style={{ backgroundColor: 'black' }}>
          <div className="container">
              <div className="row">
                  <div className="social_box">
                        <ul className="d-inline-block">
                            <li><i className="fab fa-facebook-f facebook"></i></li>
                            <li><i className="fab fa-twitter twitter"></i></li>
                            <li><i className="fab fa-instagram instagram"></i></li>
                            <li><i className="fab fa-linkedin-in linkedin"></i></li>
                            <li><i className="fab fa-youtube youtube"></i></li>
                        </ul>
                  </div>
                  <p className="text-light me-5 mt-3">@2024 ArtAssistant. All rights reserved.</p> 
                  <Link className="nav-link" class="text-light " to="/privacy">Privacy Policy</Link>
                  <Link className="nav-link" class="text-light" to="/terms">Terms of Service</Link> 
              </div>
          </div>
          
        </footer>
        
    );
}