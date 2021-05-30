const contractABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "string",
        name: "domAdd",
        type: "string",
      },
    ],
    name: "domainAddress",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bool",
        name: "state",
        type: "bool",
      },
    ],
    name: "isReserved",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bool",
        name: "state",
        type: "bool",
      },
    ],
    name: "isReservedSender",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "reservationTime",
        type: "uint256",
      },
    ],
    name: "reservedTime",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bool",
        name: "state",
        type: "bool",
      },
    ],
    name: "returned",
    type: "event",
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "string",
        name: "domainName",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "paymentAmount",
        type: "uint256",
      },
    ],
    name: "calculateReservationTime",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "string",
        name: "domainName",
        type: "string",
      },
    ],
    name: "extendDomainNameReservation",
    outputs: [],
    payable: true,
    stateMutability: "payable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "string",
        name: "domainName",
        type: "string",
      },
    ],
    name: "getDomainAddress",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "string",
        name: "domainName",
        type: "string",
      },
    ],
    name: "isDomainNameReserved",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "string",
        name: "domainName",
        type: "string",
      },
    ],
    name: "isDomainNameReservedBySender",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "pendingDepositReturns",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [],
    name: "pullDeposit",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "string",
        name: "domainName",
        type: "string",
      },
    ],
    name: "releaseDomainName",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "string",
        name: "domainName",
        type: "string",
      },
    ],
    name: "reserveDomainName",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    payable: true,
    stateMutability: "payable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "string",
        name: "domainName",
        type: "string",
      },
      {
        internalType: "string",
        name: "domainAlias",
        type: "string",
      },
    ],
    name: "setCustomDomainAddress",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "string",
        name: "domainName",
        type: "string",
      },
      {
        internalType: "string",
        name: "domainAddress",
        type: "string",
      },
    ],
    name: "setDomainAddress",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
];

exports.data = contractABI;
