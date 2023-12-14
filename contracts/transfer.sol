// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Transfer {
    address public owner;
    uint public exchangeRate = 60; // 1 USD = 60 INR

    mapping(address => UserInfo) public users;

    struct UserInfo {
        address payable ethAddress;
        uint inrBalance;
        uint usdBalance;
    }

    event Transfer(address indexed sender, address indexed receiver, uint inrAmount, uint usdAmount, uint etherAmount);
    event TransactionSuccessful(address indexed sender, address indexed receiver, uint inrAmount, uint usdAmount, uint etherAmount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    constructor(address _senderAddress, uint _senderInrBalance) {
        owner = msg.sender;
        users[_senderAddress] = UserInfo({
            ethAddress: payable(_senderAddress),
            inrBalance: _senderInrBalance,
            usdBalance: 0
        });
    }

    function sendInrToUsd(address payable _receiver, uint _inrAmount) external payable {
        uint usdAmount = _inrAmount / exchangeRate; // Convert INR to USD
        require(users[msg.sender].inrBalance >= _inrAmount, "Insufficient INR balance");

        // Ensure the function is payable
        require(msg.value == 1 ether, "Send 1 Ether per transaction");

        // Send 1 Ether to the receiver
        _receiver.transfer(1 ether);

        users[msg.sender].inrBalance -= _inrAmount;
        users[msg.sender].usdBalance += usdAmount;

        // Correct the initialization of the UserInfo struct for the receiver
        if(users[_receiver].ethAddress == address(0)) {
            users[_receiver].ethAddress = payable(_receiver);
            users[_receiver].inrBalance = 0;
            users[_receiver].usdBalance = 0;
        }

        users[_receiver].usdBalance += usdAmount;

        emit Transfer(msg.sender, _receiver, _inrAmount, usdAmount, 1 ether);
        emit TransactionSuccessful(msg.sender, _receiver, _inrAmount, usdAmount, 1 ether);
        
        // Console log message
        consoleLog("Transaction Successful");
    }

    function consoleLog(string memory _message) private {
        // Log the message to the console or any other logging mechanism
        // For demonstration purposes, you can emit an event or use external tools like Chainlink VRF log services
        // Example: emit ConsoleLog(_message);
    }

    function getSenderDetails() external view returns (address, uint, uint) {
        UserInfo memory senderInfo = users[msg.sender];
        return (senderInfo.ethAddress, senderInfo.inrBalance, senderInfo.usdBalance);
    }

    function getReceiverDetails(address _receiver) external view returns (address, uint, uint) {
        UserInfo memory receiverInfo = users[_receiver];
        return (receiverInfo.ethAddress, receiverInfo.inrBalance, receiverInfo.usdBalance);
    }

    function getReceiverBalance(address _receiver) external view returns (uint) {
        return users[_receiver].usdBalance;
    }

    function hasReceivedAmount(address _receiver) external view returns (bool) {
        UserInfo memory receiverInfo = users[_receiver];
        return receiverInfo.usdBalance > 0 && receiverInfo.ethAddress != address(0);
    }
}
