package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

const HYPER_SWITCH_API_KEY = "HYPERSWITCH_API_KEY"
const HYPER_SWITCH_API_BASE_URL = "https://sandbox.hyperswitch.io"

func createPaymentHandler(w http.ResponseWriter, r *http.Request) {
	
	/*
        	If you have two or more “business_country” + “business_label” pairs configured in your Hyperswitch dashboard,
        	please pass the fields business_country and business_label in this request body.
        	For accessing more features, you can check out the request body schema for payments-create API here :
        	https://api-reference.hyperswitch.io/docs/hyperswitch-api-reference/60bae82472db8-payments-create
        */
	
	payload := []byte(`{"amount": 100, "currency": "USD"}`)
	client := &http.Client{}
	req, err := http.NewRequest("POST", HYPER_SWITCH_API_BASE_URL+"/payments", bytes.NewBuffer(payload))
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")
	req.Header.Set("api-key", HYPER_SWITCH_API_KEY)

	resp, err := client.Do(req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		http.Error(w, fmt.Sprintf("API request failed with status code: %d", resp.StatusCode), http.StatusInternalServerError)
		return
	}

	var data map[string]interface{}
	err = json.NewDecoder(resp.Body).Decode(&data)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{"client_secret": data["client_secret"]})
}

func main() {
	fs := http.FileServer(http.Dir("public"))
	http.Handle("/", fs)
	http.HandleFunc("/create-payment", createPaymentHandler)

	addr := "localhost:4242"
	log.Printf("Listening on %s ...", addr)
	log.Fatal(http.ListenAndServe(addr, nil))
}
