import React from "react";
import "../styles/About.css";
import william from './app-icon.png'; 

// About Us page
export default function About() {
    return (
        <>
           <link href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet" />
    <div className="container">
        <div className="row justify-content-center">
            <div className="col-12 col-sm-8 col-lg-6">
                <div className="section_heading text-center wow fadeInUp" 
                     data-wow-delay="0.2s" 
                     style={{ visibility: 'visible', animationDelay: '0.2s', animationName: 'fadeInUp' }}>
                    <h3 style={{ fontFamily:'cursive', fontSize: '5em', color: 'white', fontWeight: 'bold' }}>
                    Our Creative <span> Team</span>
                    </h3>
                    <p style={{ fontSize: '1.5em', color: 'white', marginTop: '10px' }}>
                    Empowering artists with AI: Discover, create, and get inspired with our platform's smart image generation, style recognition, and seamless integration.
                    </p>
                    <div className="line"></div>
                </div>
            </div>
        </div>
        <div className="row">
            <div className="col-12 col-sm-6 col-lg-4">
                <div className="single_advisor_profile wow fadeInUp" 
                     data-wow-delay="0.2s" 
                     style={{ visibility: 'visible', animationDelay: '0.2s', animationName: 'fadeInUp' }}>
                    <div className="advisor_thumb"><img src="https://bootdey.com/img/Content/avatar/avatar1.png" alt="" />
                        <div className="social-info"><a href="#"><i className="fa fa-facebook"></i></a><a href="#"><i className="fa fa-twitter"></i></a><a href="#"><i className="fa fa-linkedin"></i></a></div>
                    </div>
                    <div className="single_advisor_details_info">
                        <h6>William Mercado</h6>
                        <p className="designation">Leader & Developer</p>
                    </div>
                </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-4">
                <div className="single_advisor_profile wow fadeInUp" 
                     data-wow-delay="0.3s" 
                     style={{ visibility: 'visible', animationDelay: '0.3s', animationName: 'fadeInUp' }}>
                    <div className="advisor_thumb"><img src="https://bootdey.com/img/Content/avatar/avatar7.png" alt="" />
                        <div className="social-info"><a href="#"><i className="fa fa-facebook"></i></a><a href="#"><i className="fa fa-twitter"></i></a><a href="#"><i className="fa fa-linkedin"></i></a></div>
                    </div>
                    <div className="single_advisor_details_info">
                        <h6>Brian Zhang</h6>
                        <p className="designation">Developer</p>
                    </div>
                </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-4">
                <div className="single_advisor_profile wow fadeInUp" 
                     data-wow-delay="0.4s" 
                     style={{ visibility: 'visible', animationDelay: '0.4s', animationName: 'fadeInUp' }}>
                    <div className="advisor_thumb"><img src="https://bootdey.com/img/Content/avatar/avatar6.png" alt="" />
                        <div className="social-info"><a href="#"><i className="fa fa-facebook"></i></a><a href="#"><i className="fa fa-twitter"></i></a><a href="#"><i className="fa fa-linkedin"></i></a></div>
                    </div>
                    <div className="single_advisor_details_info">
                        <h6>Ryuto Hisamoto</h6>
                        <p className="designation">Developer</p>
                    </div>
                </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-4">
                <div className="single_advisor_profile wow fadeInUp" 
                     data-wow-delay="0.5s" 
                     style={{ visibility: 'visible', animationDelay: '0.5s', animationName: 'fadeInUp' }}>
                    <div className="advisor_thumb"><img src="https://bootdey.com/img/Content/avatar/avatar2.png" alt="" />
                        <div className="social-info"><a href="#"><i className="fa fa-facebook"></i></a><a href="#"><i className="fa fa-twitter"></i></a><a href="#"><i className="fa fa-linkedin"></i></a></div>
                    </div>
                    <div className="single_advisor_details_info">
                        <h6>Yang Xiao</h6>
                        <p className="designation">UI Designer</p>
                    </div>
                </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-4">
                <div className="single_advisor_profile wow fadeInUp" 
                     data-wow-delay="0.6s" 
                     style={{ visibility: 'visible', animationDelay: '0.6s', animationName: 'fadeInUp' }}>
                    <div className="advisor_thumb"><img src="https://bootdey.com/img/Content/avatar/avatar3.png" alt="" />
                        <div className="social-info"><a href="#"><i className="fa fa-facebook"></i></a><a href="#"><i className="fa fa-twitter"></i></a><a href="#"><i className="fa fa-linkedin"></i></a></div>
                    </div>
                    <div className="single_advisor_details_info">
                        <h6>Shan Liu</h6>
                        <p className="designation">UI Designer</p>
                    </div>
                </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-4">
                <div className="single_advisor_profile wow fadeInUp" 
                     data-wow-delay="0.7s" 
                     style={{ visibility: 'visible', animationDelay: '0.7s', animationName: 'fadeInUp' }}>
                    <div className="advisor_thumb"><img src="https://bootdey.com/img/Content/avatar/avatar4.png" alt="" />
                        <div className="social-info"><a href="#"><i className="fa fa-facebook"></i></a><a href="#"><i className="fa fa-twitter"></i></a><a href="#"><i className="fa fa-linkedin"></i></a></div>
                    </div>
                    <div className="single_advisor_details_info">
                        <h6>Hongyingzi Lu</h6>
                        <p className="designation">UI Designer</p>
                    </div>
                </div>
            </div>

        </div>
    </div>
    <script src="https://code.jquery.com/jquery-1.10.2.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.5.0/dist/js/bootstrap.bundle.min.js"></script>  
        </>
    );
}
