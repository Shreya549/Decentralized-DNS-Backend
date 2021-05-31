require("dotenv").config();

const mongoose = require("mongoose");

const User = require("../models/users.model");

const Web3 = require("web3");
const web3 = new Web3(process.env.TESTNET_URL);

const Tx = require("ethereumjs-tx").Transaction;

const contractAddress = process.env.CONTRACT_ADDRESS;
const contractABI = require("../../utils/ABI.js").data;

const contract = new web3.eth.Contract(contractABI, contractAddress);

const checkReservationTime = async (req, res) => {
  const { domainName, domainValue } = req.body;

  if (!domainName || !domainValue) {
    return res.status(400).json({
      message: "1 or more parameter(s) missing from req.body",
    });
  }

  await User.findById(req.user.userId)
    .then(async (user) => {
      const acAddress = user.accountAddress;
      const secretKey = Buffer.from(user.secretKey.substring(2, 66), "hex");

      const contractMethod = contract.methods.calculateReservationTime(
        domainName,
        domainValue
      );

      web3.eth.getTransactionCount(acAddress, async (err, txCount) => {
        //Create the transaction object
        const txObject = {
          from: acAddress,
          to: contractAddress,
          nonce: web3.utils.toHex(txCount),
          gasLimit: web3.utils.toHex(6000000),
          gasPrice: web3.utils.toHex(web3.utils.toWei("10", "gwei")),
          data: contractMethod.encodeABI(),
        };

        //Sign the transaction
        const tx = new Tx(txObject, { chain: "ropsten" });
        tx.sign(secretKey);

        const serializedTx = tx.serialize();
        const raw = "0x" + serializedTx.toString("hex");

        //Broadcast the transaction

        await web3.eth
          .sendSignedTransaction(raw)
          .then(async (txHash) => {
            console.log(txHash);
            console.log("TxHash:", txHash.transactionHash);
            let reservationTime = web3.utils.hexToNumber(txHash.logs[0].data);
            console.log(reservationTime);

            res.status(200).json({
              reservationTime,
              TransactionHash: txHash.transactionHash,
              TransactionReceipt: txHash,
            });
          })
          .catch((err) => {
            console.log(err.toString());
            return res.status(500).json({
              message: "Something went wrong",
            });
          });
      });
    })
    .catch((err) => {
      return res.status(500).json({
        message: "Wallet Address Not Found",
      });
    });
};

const reserveDomain = async (req, res) => {
  const { domainName, value } = req.body;

  if (!domainName || !value) {
    return res.status(400).json({
      message: "1 or more parameter(s) missing from req.body",
    });
  }

  await User.findById(req.user.userId)
    .then(async (user) => {
      const acAddress = user.accountAddress;
      const secretKey = Buffer.from(user.secretKey.substring(2, 66), "hex");

      const contractMethod = contract.methods.reserveDomainName(domainName);

      web3.eth.getTransactionCount(acAddress, async (err, txCount) => {
        //Create the transaction object
        const txObject = {
          from: acAddress,
          to: contractAddress,
          nonce: web3.utils.toHex(txCount),
          value: web3.utils.toHex(value),
          gasLimit: web3.utils.toHex(6000000),
          gasPrice: web3.utils.toHex(web3.utils.toWei("100", "gwei")),
          data: contractMethod.encodeABI(),
        };

        // console.log(txObject)

        //Sign the transaction
        const tx = new Tx(txObject, { chain: "ropsten" });
        tx.sign(secretKey);

        const serializedTx = tx.serialize();
        const raw = "0x" + serializedTx.toString("hex");

        //Broadcast the transaction
        await web3.eth
          .sendSignedTransaction(raw)
          .then(async (txHash) => {
            console.log("TxHash:", txHash.transactionHash);
            console.log(txHash);

            let reservationTime = web3.utils.hexToNumber(
              txHash.logs[txHash.logs.length - 1].data
            );
            console.log(reservationTime);

            res.status(200).json({
              reservationTime,
              TransactionHash: txHash.transactionHash,
              TransactionReceipt: txHash,
            });
          })
          .catch((err) => {
            console.log(err.toString());
            return res.status(500).json({
              message: "Something went wrong",
            });
          });
      });
    })
      .catch((err) => {
        console.log(err)
      return res.status(500).json({
          message: "Wallet Address Not Found",
          error: err.toString(),
          err
      });
    });
};

module.exports = {
  checkReservationTime,
  reserveDomain,
};