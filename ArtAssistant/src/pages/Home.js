import React from "react";

// Home / Landing page
export default function Home() {
    return ( 
        <div className="home"> 
            <main>
                <section class="py-5 bg-light">
                    <div class="container">
                        <div class="row">
                            <div class="col-lg-6">
                                <h1 class="display-4">Unleash Your Creativity with Art Assistant</h1>
                                <p class="lead">Explore, create, and transform art with cutting-edge tools in your hand.</p>
                                <a href="#" class="btn btn-primary btn-lg mb-3 mb-lg-0">Get Started</a>
                            </div>
                            <div class="col-lg-6">
                                <img src="#" alt="Landing" class="img-fluid rounded shadow"></img>
                            </div>
                        </div>
                    </div>
                </section>

                <section class="py-5">
                    <div class="container">
                        <h2 class="text-center mb-4">Key Features</h2>
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
                                        <p class="card-text">Our intuitive interface makes it simple to create and edit your resume.</p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>
            </main>
        </div> 
    ); 
} 




