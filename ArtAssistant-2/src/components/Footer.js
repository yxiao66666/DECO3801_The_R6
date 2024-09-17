import React from "react";
import { Link } from "react-router-dom";

// Footer
export default function Footer() {
    return (
        <footer class="text-light py-4" style={{ backgroundColor: 'black' }}>
          <div class="container">
              <div class="row">
                  <div class="social_box">
                        <ul class="d-inline-block">
                            <li><i class="fab fa-facebook-f facebook"></i></li>
                            <li><i class="fab fa-twitter twitter"></i></li>
                            <li><i class="fab fa-instagram instagram"></i></li>
                            <li><i class="fab fa-linkedin-in linkedin"></i></li>
                            <li><i class="fab fa-youtube youtube"></i></li>
                        </ul>
                  </div>
                  <p class="text-light me-5 mt-3">@2024 ArtAssistant. All rights reserved.</p> 
                  <Link className="nav-link" class="text-light " to="/privacy">Privacy Policy</Link>
                  <Link className="nav-link" class="text-light" to="/terms">Terms of Service</Link> 
              </div>
          </div>
          
        </footer>
        
    );
}
