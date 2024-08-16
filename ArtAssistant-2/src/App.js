import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "../src/components/HomePage"; 
import AboutPage from "../src/components/AboutPage"; 
import SearchPage from "../src/components/SearchPage"; 
import UploadPage from "../src/components/UploadPage"; 
import PrivacyPage from "../src/components/PrivacyPage"; 
import TermsPage from "../src/components/TermsPage"; 


// Add a new route here for each new page created
export default function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/upload" element={<UploadPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/terms" element={<TermsPage />} />
            </Routes>
        </Router>
    );
}

