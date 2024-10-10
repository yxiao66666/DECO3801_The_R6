import React from "react";
import PropTypes from "prop-types";
import Header from "./Header";
import Footer from "./Footer";
import '../App.css'; 

// Template for all pages with a header and footer
export default function Template({ children }) {
    return (
        <div className="wrapper">
            <Header />
            <main>{children}</main>
            <Footer />

            {/* Stylesheet links for Bootstrap */}
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" />
            
            {/* Bootstrap bundle JS */}
            <script src="<?= base_url('../assets/dist/js/bootstrap.bundle.min.js'); ?>"></script>
        </div>
    );
}

Template.propTypes = {
    // Expecting React nodes as children
    children: PropTypes.node
};
