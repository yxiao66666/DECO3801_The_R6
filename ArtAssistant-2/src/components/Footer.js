import React from "react";
import { Link } from "react-router-dom";

// Footer
export default function Footer() {
    return (
        <footer class="text-light py-4" style={{ backgroundColor: 'black' }}>
          <div class="container">
              <div class="row">
                  <div class="col-md-6">
                      <p>&copy; 2024 ArtAssistant. All rights reserved.</p>
                  </div>
                  <div class="col-md-6 text-md-end">
                    <Link className="nav-link" class="text-light me-3" to="/privacy">Privacy Policy</Link>
                    <Link className="nav-link" class="text-light me-3" to="/terms">Terms of Service</Link>
                  </div>
              </div>
          </div>
        </footer>
    );
}
