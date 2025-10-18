import React from "react";
import ReactDOM from "react-dom/client"; // Use 'react-dom/client' for React 18
import { BrowserRouter as Router } from "react-router-dom"; // Wrap the app with Router
import App from "./App"; // Import the App component
import "./index.css"; // Make sure to import your styles
import { CookiesProvider } from "react-cookie";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Router>
    <CookiesProvider>
      <App />

    </CookiesProvider>
  </Router>
);
