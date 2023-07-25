import React, { useEffect, useState } from 'react';
import { UnifiedCheckout, useHyper, useWidgets } from '@juspay-tech/react-hyper-js';

function CheckoutForm() {
    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const hyper = useHyper();
    const widgets = useWidgets();

    var unifiedCheckoutOptions = {
        wallets: {
            walletReturnUrl: "https://example.com/complete",
            //Mandatory parameter for Wallet Flows such as Googlepay, Paypal and Applepay
        },
    };

    useEffect(() => {
        if (!hyper) {
            return;
        }
        //Look for a parameter called `payment_intent_client_secret` in the url which gives a payment ID, which is then used to retrieve the status of the payment
        const paymentID = new URLSearchParams(window.location.search).get(
            "payment_intent_client_secret"
        );

        if (!paymentID) {
            return;
        }

        hyper.retrievePaymentIntent(paymentID).then(({ paymentIntent }) => {
            switch (paymentIntent?.status) {
                case "succeeded":
                    setMessage("Payment succeeded!");
                    break;
                case "processing":
                    setMessage("Your payment is processing.");
                    break;
                case "requires_payment_method":
                    setMessage("Your payment was not successful, please try again.");
                    break;
                case "failed":
                    setMessage("Payment Failed")
                    break;
                default:
                    setMessage("Something went wrong.");
                    break;
            }
        });

    }, [hyper])


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!hyper || !widgets) {
            // hyper-js has not yet loaded.
            // Make sure to disable form submission until hyper-js has loaded.
            return;
        }

        setIsLoading(true);

        const response = await hyper.confirmPayment({
            widgets,
            confirmParams: {
                // Make sure to change this to your payment completion page
                return_url: "http://localhost:3000",
            },
            redirect: "if_required",
        });

        // This point will only be reached if there is an immediate error occurring while confirming the payment. Otherwise, your customer will be redirected to your `return_url`

        // For some payment flows such as Sofort, iDEAL, your customer will be redirected to an intermediate page to complete authorization of the payment, and then redirected to the `return_url`.

        console.log(("Response", response))
        if (response) {
            if (response.status === "succeeded") {
                setMessage("Payment Successful");
            } else if (response.error) {
                setMessage(response.error.message);
            } else {
                setMessage("An unexpected error occurred.");
            }
        } else {
            setMessage("An unexpected error occurred.");
        }
        setIsLoading(false);
    };

    return (
        <form id="payment-form" onSubmit={handleSubmit}>
            <UnifiedCheckout id="unified-checkout" options={unifiedCheckoutOptions} />

            <button id="submit">
                <span id="button-text">
                    {isLoading ? <div className="spinner" id="spinner"></div> : "Pay Now"}
                </span>
            </button>

            {/* Show any error or success messages */}
            {message && <div id="payment-message">{message}</div>}
        </form>
    )
}

export default CheckoutForm