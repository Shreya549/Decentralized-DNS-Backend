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
  console.log(req.body);
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

            await User.updateOne(
              { _id: req.user.userId },
              { $addToSet: { domainNames: domainName } }
            )
              .then(() => {
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
      console.log(err);
      return res.status(500).json({
        message: "Wallet Address Not Found",
        error: err.toString(),
        err,
      });
    });
};

const isDomainNameReserved = async (req, res) => {
  const { domainName } = req.body;

  if (!domainName) {
    return res.status(400).json({
      message: "Domain name missing from req.body",
    });
  }

  const user = await User.findById(req.user.userId);
  if (!user) {
    return res.status(500).json({
      message: "Wallet Address Not Found",
    });
  }

  const acAddress = user.accountAddress;
  const secretKey = Buffer.from(user.secretKey.substring(2, 66), "hex");

  const contractMethod = contract.methods.isDomainNameReserved(domainName);

  web3.eth.getTransactionCount(acAddress, (err, txCount) => {
    //Create the transaction object
    const txObject = {
      from: acAddress,
      to: contractAddress,
      nonce: web3.utils.toHex(txCount),
      gasLimit: web3.utils.toHex(6000000),
      gasPrice: web3.utils.toHex(web3.utils.toWei("100", "gwei")),
      data: contractMethod.encodeABI(),
    };

    //Sign the transaction
    const tx = new Tx(txObject, { chain: "ropsten" });
    tx.sign(secretKey);

    const serializedTx = tx.serialize();
    const raw = "0x" + serializedTx.toString("hex");

    //Broadcast the transaction
    web3.eth
      .sendSignedTransaction(raw)
      .then(async (txHash) => {
        console.log(txHash);
        console.log("TxHash:", txHash.transactionHash);
        res.status(200).json({
          isReserved: web3.utils.hexToNumber(txHash.logs[0].data),
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
};

const isDomainNameReservedByMe = async (req, res) => {
  const { domainName } = req.body;

  if (!domainName) {
    return res.status(400).json({
      message: "Domain name missing from req.body",
    });
  }

  const user = await User.findById(req.user.userId);
  if (!user) {
    return res.status(500).json({
      message: "Wallet Address Not Found",
    });
  }

  const acAddress = user.accountAddress;
  const secretKey = Buffer.from(user.secretKey.substring(2, 66), "hex");

  const contractMethod =
    contract.methods.isDomainNameReservedBySender(domainName);

  web3.eth.getTransactionCount(acAddress, (err, txCount) => {
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
    web3.eth
      .sendSignedTransaction(raw)
      .then(async (txHash) => {
        console.log(txHash);
        console.log("TxHash:", txHash.transactionHash);
        res.status(200).json({
          isReserved: web3.utils.hexToNumber(txHash.logs[0].data),
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
};

const extendDomainNameReservation = async (req, res) => {
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

      const contractMethod =
        contract.methods.extendDomainNameReservation(domainName);

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
      console.log(err);
      return res.status(500).json({
        message: "Wallet Address Not Found",
        error: err.toString(),
        err,
      });
    });
};

const releaseDomain = async (req, res) => {
  const { domainName } = req.body;

  if (!domainName) {
    return res.status(400).json({
      message: "domain name missing from req.body",
    });
  }

  await User.findById(req.user.userId)
    .then(async (user) => {
      const acAddress = user.accountAddress;

      const secretKey = Buffer.from(user.secretKey.substring(2, 66), "hex");

      const contractMethod = contract.methods.releaseDomainName(domainName);

      web3.eth.getTransactionCount(acAddress, async (err, txCount) => {
        //Create the transaction object
        const txObject = {
          from: acAddress,
          to: contractAddress,
          nonce: web3.utils.toHex(txCount),
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
            await User.updateOne(
              { _id: req.user.userId },
              {
                $pull: { domainNames: domainName },
              }
            )
              .then(() => {
                res.status(200).json({
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
      console.log(err);
      return res.status(500).json({
        message: "Wallet Address Not Found",
        error: err.toString(),
        err,
      });
    });
};

const pullDeposit = async (req, res) => {
  await User.findById(req.user.userId)
    .then(async (user) => {
      const acAddress = user.accountAddress;
      const secretKey = Buffer.from(user.secretKey.substring(2, 66), "hex");

      const contractMethod = contract.methods.pullDeposit();

      web3.eth.getTransactionCount(acAddress, async (err, txCount) => {
        //Create the transaction object
        const txObject = {
          from: acAddress,
          to: contractAddress,
          nonce: web3.utils.toHex(txCount),
          gasLimit: web3.utils.toHex(6000000),
          gasPrice: web3.utils.toHex(web3.utils.toWei("100", "gwei")),
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
            console.log("TxHash:", txHash.transactionHash);
            console.log(txHash);

            res.status(200).json({
              returned: web3.utils.hexToNumber(txHash.logs[0].data),
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
      console.log(err);
      return res.status(500).json({
        message: "Wallet Address Not Found",
        error: err.toString(),
        err,
      });
    });
};

const setDomainAddress = async (req, res) => {
  const { domainName, domainAddress } = req.body;

  await User.findById(req.user.userId)
    .then(async (user) => {
      const acAddress = user.accountAddress;
      const secretKey = Buffer.from(user.secretKey.substring(2, 66), "hex");

      const contractMethod = contract.methods.setDomainAddress(
        domainName,
        domainAddress
      );

      web3.eth.getTransactionCount(acAddress, async (err, txCount) => {
        //Create the transaction object
        const txObject = {
          from: acAddress,
          to: contractAddress,
          nonce: web3.utils.toHex(txCount),
          gasLimit: web3.utils.toHex(6000000),
          gasPrice: web3.utils.toHex(web3.utils.toWei("100", "gwei")),
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
            console.log("TxHash:", txHash.transactionHash);
            console.log(txHash);

            res.status(200).json({
              set: web3.utils.hexToNumber(txHash.logs[0].data),
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
      console.log(err);
      return res.status(500).json({
        message: "Wallet Address Not Found",
        error: err.toString(),
        err,
      });
    });
};

const setCustomDomainAddress = async (req, res) => {
  const { domainName, domainAlias } = req.body;

  await User.findById(req.user.userId)
    .then(async (user) => {
      const acAddress = user.accountAddress;
      const secretKey = Buffer.from(user.secretKey.substring(2, 66), "hex");

      const contractMethod = contract.methods.setCustomDomainAddress(
        domainName,
        domainAlias
      );

      web3.eth.getTransactionCount(acAddress, async (err, txCount) => {
        //Create the transaction object
        const txObject = {
          from: acAddress,
          to: contractAddress,
          nonce: web3.utils.toHex(txCount),
          gasLimit: web3.utils.toHex(6000000),
          gasPrice: web3.utils.toHex(web3.utils.toWei("100", "gwei")),
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
            console.log("TxHash:", txHash.transactionHash);
            console.log(txHash);

            res.status(200).json({
              set: web3.utils.hexToNumber(txHash.logs[0].data),
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
      console.log(err);
      return res.status(500).json({
        message: "Wallet Address Not Found",
        error: err.toString(),
        err,
      });
    });
};

const getDomainAddress = async (req, res) => {
  const { domainName } = req.body;
  console.log(domainName);

  await User.findById(req.user.userId)
    .then(async (user) => {
      const acAddress = user.accountAddress;
      const secretKey = Buffer.from(user.secretKey.substring(2, 66), "hex");

      const contractMethod = contract.methods.getDomainAddress(domainName);

      web3.eth.getTransactionCount(acAddress, async (err, txCount) => {
        //Create the transaction object
        const txObject = {
          from: acAddress,
          to: contractAddress,
          nonce: web3.utils.toHex(txCount),
          gasLimit: web3.utils.toHex(6000000),
          gasPrice: web3.utils.toHex(web3.utils.toWei("100", "gwei")),
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
            console.log("TxHash:", txHash.transactionHash);
            console.log(txHash);
            let data = web3.eth.abi.decodeLog(
              [
                {
                  internalType: "string",
                  name: "",
                  type: "string",
                },
              ],
              txHash.logs[txHash.logs.length - 1].data,
              txHash.logs[txHash.logs.length - 1].topics
            );
            console.log(data);

            res.status(200).json({
              data: data["0"],
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
      console.log(err);
      return res.status(500).json({
        message: "Wallet Address Not Found",
        error: err.toString(),
        err,
      });
    });
};

module.exports = {
  checkReservationTime,
  reserveDomain,
  isDomainNameReserved,
  isDomainNameReservedByMe,
  extendDomainNameReservation,
  releaseDomain,
  pullDeposit,
  setDomainAddress,
  setCustomDomainAddress,
  getDomainAddress,
};
