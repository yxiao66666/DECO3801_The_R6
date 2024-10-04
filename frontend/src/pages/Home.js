/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import "../styles/Home.css";

// Home / Landing page
export default function Home() {
    return ( 
        // Main section of the homepage, with full height
        <div className="full-height-section"> 
            {/* Section with background image and content */}
            <div className="text-start ms-auto me-auto styled-background" style={{
                backgroundImage: 'url("../images/Sketch.png")'
                }}>
                    {/* Logo image with defined width and margin */}
                    <img 
                        src="../images/ARTY.png" 
                        alt="ARTY" 
                        style={{ width: 'auto', height: '18vw' ,margin:'50px 0'}} 
                    />
                    {/* Text content for the main message */}
                    <div className="col-12">
                        <h1 className="display-7 mb-3">Unleash Your Creativity with Us</h1>
                        <p className="mb-2">Mesh the creativity of your mind with our empowering tools and let's create magic.</p>
                        <p className="mb-2">Go beyond the ordinary and unleash the artist within.</p>
                        <p className="mb-2">Upload your masterpieces or build them right here. You're in control.</p>
                        <p className="mb-2">Dare to express, dare to impress.</p>
                    </div>
            </div>

            {/*Feature sections*/}
            <section>
                <div className="container">
                    {/* First feature row: API Search Engine */}
                    <div className="row align-items-center mb-5">
                        <div className="col-lg-6 col-md-12 mb-4">
                            <img src="images/Group 1.png" alt="Landing" className="img-fluid rounded shadow w-100"></img>
                        </div>
                        <div className="col-lg-6 col-md-12 text-lg-center">
                            <h4>Integrated API Search Engine</h4>
                            <p>Effortlessly search and access a wide range of images with our powerful API, offering fast results and comprehensive filtering options to find the perfect image for your needs.</p>
                        </div>
                    </div>
                    {/* Second feature row: AI Art Generator */}
                    <div className="row align-items-center mb-5"> 
                        <div className="col-lg-6 col-md-12 order-lg-2 mb-4">
                            <img src="images/Group 2.png" alt="Landing" className="img-fluid rounded shadow w-100"></img>
                        </div>
                        <div className="col-lg-6 col-md-12 order-lg-1 text-lg-center">
                            <h4 className="card-title">AI Art Generator</h4>
                            <p className="card-text">Create unique digital artworks effortlessly with our AI-powered generator, turning your ideas into visually stunning pieces in seconds.</p>
                        </div>
                    </div>
                    {/* Third feature row: Easy-to-Use Interface */}
                    <div className="row align-items-center mb-5"> 
                        <div className="col-lg-6 col-md-12 mb-4">
                            <img src="images/Group 3.png" alt="Landing" className="img-fluid rounded shadow w-100"></img>
                        </div>
                        <div className="col-lg-6 col-md-12 text-lg-center">
                            <h4 className="card-title">Easy-to-Use Interface</h4>
                            <p className="card-text">Create your resume quickly and easily with our user-friendly interface, designed to simplify every step of the process.</p>
                        </div>
                    </div>

                    {/* Call-to-action button */}
                    <div className="text-center">
                        <a href="Upload" className="btn btn-light mb-5 mt-5">Get Started</a>
                    </div>
                </div>
            </section>
        </div> 
    ); 
} 