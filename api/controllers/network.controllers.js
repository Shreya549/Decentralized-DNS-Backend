require("dotenv").config();

const mongoose = require("mongoose");

const User = require("../models/users.model");

const Web3 = require("web3");
const web3 = new Web3(process.env.TESTNET_URL);

const Tx = require("ethereumjs-tx").Transaction;

const contractAddress = process.env.CONTRACT_ADDRESS;
const contractABI = require("../../utils/ABI.js").data;

const contract = new web3.eth.Contract(contractABI, contractAddress);

