import React, { useState, useEffect } from "react";
import { loadHyper } from "@juspay-tech/hyper-js";
import { HyperElements } from "@juspay-tech/react-hyper-js";
import './App.css';
import CheckoutForm from "./CheckoutForm";

const hyperPromise = loadHyper("HYPERSWITCH_PUBLISHABLE_KEY");

function App() {
  const [options, setOptions] = useState(null);

  useEffect(() => {
    fetch("/create-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: [{ id: "xl-tshirt" }] }),
    }).then((res) => res.json())
      .then((data) => {
        setOptions({
          clientSecret: data.client_secret,
          appearance: {
            theme: "midnight"
          }
        })
      })
  }, [])

  return (
    <div className="app">
      {options && (
        <HyperElements options={options} hyper={hyperPromise}>
          <CheckoutForm return_url={`${window.location.origin}/completion`} />
        </HyperElements>
      )}
    </div>
  );
}

export default App;
