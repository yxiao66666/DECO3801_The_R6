/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";


// Home / Landing page
export default function Home() {
    return ( 
        <div style={{ backgroundColor: 'black', color: 'white', minHeight: '100vh', padding: '20px' }}> 
                <section>
                    <div class="container">
                        <div class="row">
                            <div class="col-lg-15">
                                <h1 class="display-4" className="tittle">ARTY</h1>
                                <h1 class="display-7" className="description">Unleash Your Creativity with Art Assistant</h1>
                                <p class="lead" className="description">Explore, create, and transform art with cutting-edge tools in your hand.</p>
                            </div>
                            <div class="col-lg-4 d-flex justify-content-between align-items-center mt-2">
                                <img src="images/hum-1.jpeg" alt="Landing" class="img-fluid rounded shadow"></img>
                                <img src="images/scen-1.jpeg" alt="Landing" class="img-fluid rounded shadow"></img>
                                <img src="images/scen-2.jpeg" alt="Landing" class="img-fluid rounded shadow"></img>
                                
                            </div>
                        </div>
                    </div>
                </section>

                <section>
                    <div class="container">
                        <h2 class="text-center mb-4" className="description">Key Features</h2>
                        <div class="row">
                            <div class="col-lg-4 mb-4">
                                <div class="card">
                                    <div class="card-body">
                                        <h4 class="card-title">Integrated Api search engine </h4>
                                        <p class="card-text">A short description of api search engine.</p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-lg-4 mb-4">
                                <div class="card">
                                    <div class="card-body">
                                        <h4 class="card-title">AI Art Generator</h4>
                                        <p class="card-text">A short description of AI Art Generator.</p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-lg-4 mb-4">
                                <div class="card">
                                    <div class="card-body">
                                        <h4 class="card-title">Easy-to-Use Interface</h4>
                                        <p class="card-text">Makes it simple to create your resume.</p>
                                    </div>
                                </div>
                            </div>

                        </div>
                        <a href="Upload" class="btn btn-light mb-5">Get Started</a>
                    </div>
                </section>
        </div> 
    ); 
} 




