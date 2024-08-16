import React from "react";
import "../styles/About.css";
import william from './app-icon.png'; 

// About Us page
export default function About() {
    return (
        <div>
            <div className="about-section">
                <h1>About Us</h1>
                <p>Our creative team is passionate about empowering artists like you.</p>
            </div>
            <h2 style={{ textAlign: "center", margin: "5%"}}>The Ryuto 6</h2>
            <div className="row">
                <div className="column">
                    <div className="card">
                        <img src={""} alt="william" style={{ width: "100%" }} />
                        <div className="container">
                            <h2>William Mercado</h2>
                            <p className="title">Team Leader</p>
                            <p>Some text that describes me.</p>
                            <p>William@example.com</p>
                            <p><button className="button">Contact</button></p>
                        </div>
                    </div>
                </div>
                <div className="column">
                    <div className="card">
                        <img src="/Ryuto.jpg" alt="Ryuto" style={{ width: "100%" }} />
                        <div className="container">
                            <h2>Ryuto Hisamoto</h2>
                            <p className="title">Team Member</p>
                            <p>Some text that describes me.</p>
                            <p>Ryuto@example.com</p>
                            <p><button className="button">Contact</button></p>
                        </div>
                    </div>
                </div>
                <div className="column">
                    <div className="card">
                        <img src="/Olivia.jpg" alt="Olivia" style={{ width: "100%" }} />
                        <div className="container">
                            <h2>Olivia Lu</h2>
                            <p className="title">Team Member</p>
                            <p>Some text that describes me.</p>
                            <p>Olivia@example.com</p>
                            <p><button className="button">Contact</button></p>
                        </div>
                    </div>
                </div>
                <div className="column">
                    <div className="card">
                        <img src="/Brian.jpg" alt="Brian" style={{ width: "100%" }} />
                        <div className="container">
                            <h2>Brian Zhang</h2>
                            <p className="title">Team Member</p>
                            <p>Some text that describes me.</p>
                            <p>Brian@example.com</p>
                            <p><button className="button">Contact</button></p>
                        </div>
                    </div>
                </div>
                <div className="column">
                    <div className="card">
                        <img src="/Cecilia.jpg" alt="Cecilia" style={{ width: "100%" }} />
                        <div className="container">
                            <h2>Cecilia Liu</h2>
                            <p className="title">Team Member</p>
                            <p>Some text that describes me.</p>
                            <p>Cecilia@example.com</p>
                            <p><button className="button">Contact</button></p>
                        </div>
                    </div>
                </div>
                <div className="column">
                    <div className="card">
                        <img src="/Yang.jpg" alt="Yang" style={{ width: "100%" }} />
                        <div className="container">
                            <h2>Yang Xiao</h2>
                            <p className="title">Team Member</p>
                            <p>Some text that describes me.</p>
                            <p>Yang@example.com</p>
                            <p><button className="button">Contact</button></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
