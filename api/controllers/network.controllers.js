require("dotenv").config();

const mongoose = require("mongoose");

const User = require("../models/users.model");
const axios = require("axios");

const Web3 = require("web3");
const web3 = new Web3(process.env.TESTNET_URL);

const Tx = require("ethereumjs-tx").Transaction;

const contractAddress = process.env.CONTRACT_ADDRESS;
const contractABI = require("../../utils/ABI.js").data;

const contract = new web3.eth.Contract(contractABI, contractAddress);
const startBlockNumber = process.env.INITIAL_BLOCK;

const getNetworkDetails = async (req, res) => {
  try {
    const hardFork = "berlin";
    const chain = "ropsten";
    const txConfBlock = await web3.eth.transactionConfirmationBlocks;
    const avgGas = await web3.eth.getGasPrice();
    const currBlock = await web3.eth.getBlockNumber();
    const nodeInfo = await web3.eth.getNodeInfo();
    const txCount = await web3.eth.getTransactionCount(contractAddress);

    let config = {
      method: "get",
      url: `https://api-ropsten.etherscan.io/api?module=account&action=txlist&address=${contractAddress}&startblock=${startBlockNumber}&endblock=${currBlock}&sort=des&apikey=${process.env.ETHERSCAN_APIKEY}`,
      headers: {},
    };

    axios(config)
      .then(function (response) {
        res.status(200).json({
          contractAddress,
          hardFork,
          chain,
          txConfBlock,
          avgGas,
          initBlock: process.env.INITIAL_BLOCK,
          currBlock,
          nodeInfo,
          txCount,
          txList: response.data,
        });
      })
      .catch(function (error) {
        console.log(error.toString());
        return res.status(500).json({
          message: "Something went wrong",
          contractAddress,
          hardFork,
          chain,
          txConfBlock,
          avgGas,
          initBlock: process.env.INITIAL_BLOCK,
          currBlock,
          nodeInfo,
          txCount,
        });
      });
  } catch (error) {
    res.status(500).json({
      error: error.toString(),
      message: "Error finding details",
    });
  }
};

module.exports = {
  getNetworkDetails,
};
