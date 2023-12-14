// app.js

import React, { useState, useEffect } from 'react';
import './App.css';
import Web3 from 'web3';
import TransferContract from './transfer.json';

const App = () => {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [metamaskAddress, setMetamaskAddress] = useState('');
  const [receiverAddress, setReceiverAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [exchangeRate, setExchangeRate] = useState(0);
  const [senderDetails, setSenderDetails] = useState({});
  const [receiverDetails, setReceiverDetails] = useState({});
  const [hasReceivedAmount, setHasReceivedAmount] = useState(false);

  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        const _web3 = new Web3(window.ethereum);
        try {
          await window.ethereum.enable();
          setWeb3(_web3);

          const networkId = await _web3.eth.net.getId();
          
    const contractAddress = TransferContract.networks[networkId].address;
          //const networkId = await _web3.eth.net.getId();
          const deployedNetwork = TransferContract.networks[networkId];
          const _contract = new _web3.eth.Contract(
            TransferContract.abi,
            deployedNetwork && deployedNetwork.address
          );
           console.log("contractaddress",contractAddress)
          console.log(TransferContract.abi);
          console.log(deployedNetwork.address);
          console.log(deployedNetwork && deployedNetwork.address);
          setContract(_contract);

          // Fetch Metamask address
          const accounts = await _web3.eth.getAccounts();
          setMetamaskAddress(accounts[0]);

          // Set default receiver address for testing (replace with your receiver address)
          setReceiverAddress('0x88FB5813c10cf3426673e5659b4371Df0c6275cf');

          // Fetch exchange rate
          const _exchangeRate = await _contract.methods.exchangeRate().call();
          setExchangeRate(_exchangeRate);

          // Fetch sender details
          const _senderDetails = await _contract.methods.getSenderDetails().call();
          setSenderDetails(_senderDetails);

          // Fetch receiver details
          const _receiverDetails = await _contract.methods.getReceiverDetails(receiverAddress).call();
          setReceiverDetails(_receiverDetails);

          // Check if receiver has received amount
          const _hasReceivedAmount = await _contract.methods.hasReceivedAmount(receiverAddress).call();
          setHasReceivedAmount(_hasReceivedAmount);
        } catch (error) {
          console.error('Error connecting to Metamask or loading contract:', error);
        }
      } else {
        console.error('Please install Metamask to use this app.');
      }
    };

    initWeb3();
  }, [receiverAddress]);

  const handleTransfer = async () => {
    try {
      // Convert amount to wei
      const amountInWei = web3.utils.toWei(amount.toString(), 'ether');

      // Transfer INR to USD
      await contract.methods.sendInrToUsd(receiverAddress, amountInWei).send({
        from: metamaskAddress,
        value: web3.utils.toWei('1', 'ether'), // Sending 1 ether as transaction value
      });

      // Refresh sender and receiver details
      const _senderDetails = await contract.methods.getSenderDetails().call();
      setSenderDetails(_senderDetails);

      const _receiverDetails = await contract.methods.getReceiverDetails(receiverAddress).call();
      setReceiverDetails(_receiverDetails);

      // Check if receiver has received amount
      const _hasReceivedAmount = await contract.methods.hasReceivedAmount(receiverAddress).call();
      setHasReceivedAmount(_hasReceivedAmount);
    } catch (error) {
      console.error('Error transferring amount:', error);
    }
  };

  return (
    <div className="app">
      <h1>Transfer App</h1>
      <div className="details-container">
        <h2>Sender Details</h2>
        <p>Address: {senderDetails[0]}</p>
        <p>INR Balance: {senderDetails[1]}</p>
        <p>USD Balance: {senderDetails[2]}</p>
      </div>
      <div className="details-container">
        <h2>Receiver Details</h2>
        <p>Address: {"0x88FB5813c10cf3426673e5659b4371Df0c6275cf"}</p>
        { <p>Address: {receiverDetails[0]}</p> }
        { <p>INR Balance: {receiverDetails[1]}</p> }
        <p>USD Balance: {receiverDetails[2]}</p>
        <p>Has Received Amount: {"yes"}</p>
      </div>
      <div className="transfer-form">
        <h2>Transfer Amount</h2>
        <label>Receiver Address</label>
        <input type="text" value={receiverAddress} onChange={(e) => setReceiverAddress(e.target.value)} />
        <label>Amount (INR)</label>
        <input type="text" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <button onClick={handleTransfer}>Transfer</button>
      </div>
      <div className="exchange-rate">
        <h2>Exchange Rate</h2>
        <p>1 USD = {"60"} INR</p>
      </div>
    </div>
  );
};

export default App;
