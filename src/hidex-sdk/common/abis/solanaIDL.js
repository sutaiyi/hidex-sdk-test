export default {
    "version": "0.1.0",
    "name": "pda",
    "instructions": [
        {
            "name": "closeConfigAccount",
            "accounts": [
                {
                    "name": "configPdaAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "receiver",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "authority",
                    "isMut": true,
                    "isSigner": true
                }
            ],
            "args": []
        },
        {
            "name": "initializeConfigInfo",
            "accounts": [
                {
                    "name": "detradeConfigPda",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "signer",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "owner",
                    "type": "publicKey"
                },
                {
                    "name": "dexCommisionRate",
                    "type": "u64"
                },
                {
                    "name": "inviterCommisionRate",
                    "type": "u64"
                },
                {
                    "name": "commisionDiscountRatio",
                    "type": "u64"
                },
                {
                    "name": "withdrawer",
                    "type": "publicKey"
                },
                {
                    "name": "legalSigner",
                    "type": "publicKey"
                }
            ]
        },
        {
            "name": "claimCommission",
            "accounts": [
                {
                    "name": "swapPda",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "configPda",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "noncePda",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "user",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "ixSysvar",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "bump",
                    "type": "u8"
                },
                {
                    "name": "contents",
                    "type": "bytes"
                },
                {
                    "name": "signature",
                    "type": {
                        "array": [
                            "u8",
                            64
                        ]
                    }
                }
            ]
        },
        {
            "name": "withdraw",
            "accounts": [
                {
                    "name": "detradeConfigPda",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "swapPda",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "to",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "signer",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "bump",
                    "type": "u8"
                },
                {
                    "name": "amount",
                    "type": "u64"
                }
            ]
        },
        {
            "name": "initializeNonceInfo",
            "accounts": [
                {
                    "name": "noncePda",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "signer",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": []
        },
        {
            "name": "tradeNonceVerify",
            "accounts": [
                {
                    "name": "tradeNonceAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "signer",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "nonce",
                    "type": "u64"
                }
            ]
        }
    ],
    "accounts": [
        {
            "name": "ConfigData",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "owner",
                        "type": "publicKey"
                    },
                    {
                        "name": "dexCommisionRate",
                        "type": "u64"
                    },
                    {
                        "name": "inviterCommisionRate",
                        "type": "u64"
                    },
                    {
                        "name": "commisionDiscountRatio",
                        "type": "u64"
                    },
                    {
                        "name": "withdrawer",
                        "type": "publicKey"
                    },
                    {
                        "name": "tradeAmountBefore",
                        "type": "u64"
                    },
                    {
                        "name": "tokenMint",
                        "type": "publicKey"
                    },
                    {
                        "name": "legalSigner",
                        "type": "publicKey"
                    }
                ]
            }
        },
        {
            "name": "NonceData",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "owner",
                        "type": "publicKey"
                    },
                    {
                        "name": "nonceArr",
                        "type": {
                            "array": [
                                "u64",
                                50
                            ]
                        }
                    },
                    {
                        "name": "timeStampArr",
                        "type": {
                            "array": [
                                "u64",
                                50
                            ]
                        }
                    }
                ]
            }
        },
        {
            "name": "TradeNonce",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "tradeNonce",
                        "type": "u64"
                    }
                ]
            }
        }
    ],
    "types": [
        {
            "name": "ChillErrorCode",
            "type": {
                "kind": "enum",
                "variants": [
                    {
                        "name": "InvalidReturnData"
                    },
                    {
                        "name": "IncorrectOwner"
                    },
                    {
                        "name": "InsufficientBalance"
                    },
                    {
                        "name": "InvalidAccountOrInsufficientBalance"
                    },
                    {
                        "name": "InvalidTokenMintAccount"
                    },
                    {
                        "name": "InvalidWithdrawer"
                    },
                    {
                        "name": "InvalidRequire"
                    },
                    {
                        "name": "InvalidSwapRequire"
                    },
                    {
                        "name": "InvalidDataLength"
                    },
                    {
                        "name": "ConversionFailed"
                    },
                    {
                        "name": "InvalidSignature"
                    },
                    {
                        "name": "InvalidInviter"
                    },
                    {
                        "name": "SignatureHasExpired"
                    },
                    {
                        "name": "RepeatedRequests"
                    },
                    {
                        "name": "TooManyRequests"
                    },
                    {
                        "name": "InvaildNonce"
                    }
                ]
            }
        }
    ],
    "errors": [
        {
            "code": 6000,
            "name": "SigVerificationFailed",
            "msg": "Signature verification failed."
        }
    ]
};
