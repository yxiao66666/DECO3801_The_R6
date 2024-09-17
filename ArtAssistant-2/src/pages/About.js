import React from "react";
import "../styles/About.css";
import william from './app-icon.png'; 

// About Us page
export default function About() {
    return (
        <>
        <link href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet" />
    
        {/* About Us */}
        <div className="about-us-block" style={{ backgroundImage: 'url(/images/about_bg.JPG)', backgroundSize: 'cover', backgroundPosition: 'center', padding: '230px 0', textAlign: 'center' }}>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-lg-8">
                        <h1 style={{ color: 'white', fontSize: '4em', fontFamily: 'cursive', fontWeight: 'bold' }}>Nice to meet u</h1>
                        <p style={{ color: 'white', fontSize: '1.5em', marginTop: '20px' }}>
                            We are thrilled to introduce ourselves and share our passion for AI and art.
                        </p>
                        <a href="#what-we-do" className="btn-learn-more" style={{ marginTop: '100px' }}>Learn More</a>
                    </div>
                </div>
            </div>
        </div>


        {/* What We Do */}
        <div id="what-we-do" className="what-we-do-block" style={{ backgroundColor: 'white', padding: '50px 0', marginTop: '50px' }}>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-12 col-sm-8 col-lg-6">
                        <div className="section_heading text-center wow fadeInUp" 
                            data-wow-delay="0.2s" 
                            style={{ visibility: 'visible', animationDelay: '0.2s', animationName: 'fadeInUp' }}>
                            <h2 style={{ fontFamily: 'cursive', fontSize: '4em', color: 'black', fontWeight: 'bold' }}>
                                What We Do
                            </h2>
                            <img src="images/what we do.png" alt="Illustration" className="illustration" style={{  marginTop: '60px', maxWidth: '70%', height: 'auto' }} />

                            <p style={{ fontSize: '1.5em', color: 'black', marginTop: '30px' }}>
                                Our platform is dedicated to providing innovative AI-driven tools for artists.
                            </p>
                            <p style={{ fontSize: '1.5em', color: 'black', marginTop: '40px' }}>
                                We offer smart image generation, advanced style recognition, and seamless integration to enhance creativity and productivity.
                            </p>
                            <p style={{ fontSize: '1.5em', color: 'black', marginTop: '40px' }}>
                                By leveraging cutting-edge technology, we aim to support artists in exploring new artistic possibilities and bringing their creative visions to life.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* What you can do */}
        <div className="what-you-can-do-block" style={{ backgroundColor: 'white', padding: '50px 0', marginTop: '50px' }}>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-12 col-sm-8 col-lg-6">
                        <div className="section_heading text-center wow fadeInUp" 
                            data-wow-delay="0.2s" 
                            style={{ visibility: 'visible', animationDelay: '0.2s', animationName: 'fadeInUp' }}>
                            <h2 style={{ fontFamily: 'cursive', fontSize: '4em', color: 'black', fontWeight: 'bold' }}>
                                What You Can Do
                            </h2>
                            <img src="images/what you can do.png" alt="Illustration" className="illustration" style={{  marginTop: '10px', maxWidth: '70%', height: 'auto' }} />

                            <p style={{ fontSize: '1.5em', color: 'black', marginTop: '30px' }}>
                            - Search for References: Enter text prompts to search for reference images that match your creative needs.
                            </p>
                            <p style={{ fontSize: '1.5em', color: 'black', marginTop: '30px' }}>
                            - Real-Time Reference Generation: Generate and arrange assets by inputting text or images to create reference images that align with your creative intentions.
                            </p>
                            <p style={{ fontSize: '1.5em', color: 'black', marginTop: '30px' }}>
                            - Cross-Device Usage: Use the software on desktop, laptop, or iPad to assist in their creative process.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>


        <div className="container">
            <div className="row justify-content-center">
                <div className="col-12 col-sm-8 col-lg-6">
                    <div className="section_heading text-center wow fadeInUp" 
                        data-wow-delay="0.2s" 
                        style={{ visibility: 'visible', animationDelay: '0.2s', animationName: 'fadeInUp' }}>
                        <h3 style={{  marginTop: '100px', fontFamily:'cursive', fontSize: '4em', color: 'black', fontWeight: 'bold' }}>
                        Who We <span> Are</span>
                        </h3>
                        <p style={{ fontSize: '1.3em', color: 'black', marginTop: '50px'}}>
                        A team of innovators pushing the boundaries of art and technology.
                        </p>
                        <p style={{ fontSize: '1.3em', color: 'black', marginTop: '30px',marginBottom: '80px'}}>
                        Our mission is to blend creativity with AI to empower artists and inspire new forms of expression.
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
                        <div className="advisor_thumb"><img src="images/william.JPG" alt="" />
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
                        <div className="advisor_thumb"><img src="images/brian.JPG" alt="" />
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
                        <div className="advisor_thumb"><img src="images/ryuto.PNG" alt="" />
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
                        <div className="advisor_thumb"><img src="images/yang.JPG" alt="" />
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
                        <div className="advisor_thumb"><img src="images/shan.jpeg" alt="" />
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
                        <div className="advisor_thumb"><img src="images/hongyingzi.jpg" alt="" />
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
