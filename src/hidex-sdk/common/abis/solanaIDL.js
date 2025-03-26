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
            "name": "initializeTradeConfigPda",
            "accounts": [
                {
                    "name": "tradeConfigPda",
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
                }
            ]
        },
        {
            "name": "buySwapPrepare",
            "accounts": [
                {
                    "name": "tradeConfigPda",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "userTokenAtaAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "userWsolAtaAccount",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "user",
                    "isMut": true,
                    "isSigner": true
                }
            ],
            "args": []
        },
        {
            "name": "buySwapCompleted",
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
                    "name": "tradeConfigPda",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "user",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "userAtaAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "userWsolAtaAccount",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "inviter",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "associateTokenProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
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
                    "name": "isAntiMev",
                    "type": "u8"
                },
                {
                    "name": "transactionType",
                    "type": "u8"
                },
                {
                    "name": "commissionDiscountRate",
                    "type": "u64"
                },
                {
                    "name": "inviteCommissionRate",
                    "type": "u64"
                }
            ]
        },
        {
            "name": "buySwapCompletedSimple",
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
                    "name": "tradeConfigPda",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "user",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "userAtaAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "userWsolAtaAccount",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "inviter",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "associateTokenProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
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
                    "name": "isAntiMev",
                    "type": "u8"
                },
                {
                    "name": "transactionType",
                    "type": "u8"
                },
                {
                    "name": "commissionDiscountRate",
                    "type": "u64"
                },
                {
                    "name": "inviteCommissionRate",
                    "type": "u64"
                },
                {
                    "name": "lamportsBefore",
                    "type": "u64"
                },
                {
                    "name": "userWsolAtaLamports",
                    "type": "u64"
                },
                {
                    "name": "tokenAtaAmountBefore",
                    "type": "u64"
                },
                {
                    "name": "tokenAtaLamports",
                    "type": "u64"
                },
                {
                    "name": "gasFee",
                    "type": "u64"
                }
            ]
        },
        {
            "name": "saleSwapPrepare",
            "accounts": [
                {
                    "name": "tradeConfigPda",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "userWsolAtaAccount",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "user",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "userAtaAccount",
                    "isMut": true,
                    "isSigner": false
                }
            ],
            "args": []
        },
        {
            "name": "saleSwapCompleted",
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
                    "name": "tradeConfigPda",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "wsolMint",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "userWsolAtaAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "swapPdaWsolAtaAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "user",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "userAtaAccount",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "inviter",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "associateTokenProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
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
                    "name": "amount",
                    "type": "u64"
                },
                {
                    "name": "isAntiMev",
                    "type": "u8"
                },
                {
                    "name": "transactionType",
                    "type": "u8"
                },
                {
                    "name": "commissionDiscountRate",
                    "type": "u64"
                },
                {
                    "name": "inviteCommissionRate",
                    "type": "u64"
                }
            ]
        },
        {
            "name": "saleSwapCompletedSimple",
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
                    "name": "tradeConfigPda",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "wsolMint",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "userWsolAtaAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "swapPdaWsolAtaAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "user",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "userAtaAccount",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "inviter",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "associateTokenProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
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
                    "name": "amount",
                    "type": "u64"
                },
                {
                    "name": "isAntiMev",
                    "type": "u8"
                },
                {
                    "name": "transactionType",
                    "type": "u8"
                },
                {
                    "name": "commissionDiscountRate",
                    "type": "u64"
                },
                {
                    "name": "inviteCommissionRate",
                    "type": "u64"
                },
                {
                    "name": "lamportsBefore",
                    "type": "u64"
                },
                {
                    "name": "wsolAtaAmountBefore",
                    "type": "u64"
                },
                {
                    "name": "userWsolAtaLamports",
                    "type": "u64"
                },
                {
                    "name": "tokenAtaLamports",
                    "type": "u64"
                },
                {
                    "name": "tokenMintStr",
                    "type": "string"
                },
                {
                    "name": "gasFee",
                    "type": "u64"
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
            "name": "TradeConfigData",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "owner",
                        "type": "publicKey"
                    },
                    {
                        "name": "lamportsBefore",
                        "type": "u64"
                    },
                    {
                        "name": "wsolMint",
                        "type": "publicKey"
                    },
                    {
                        "name": "wsolAtaAmountBefore",
                        "type": "u64"
                    },
                    {
                        "name": "tokenMint",
                        "type": "publicKey"
                    },
                    {
                        "name": "tokenAtaAmountBefore",
                        "type": "u64"
                    },
                    {
                        "name": "tokenAtaLamports",
                        "type": "u64"
                    },
                    {
                        "name": "userWsolAtaLamports",
                        "type": "u64"
                    }
                ]
            }
        }
    ],
    "errors": [
        {
            "code": 6000,
            "name": "InvalidReturnData"
        },
        {
            "code": 6001,
            "name": "IncorrectOwner"
        },
        {
            "code": 6002,
            "name": "InsufficientBalance"
        },
        {
            "code": 6003,
            "name": "InvalidAccountOrInsufficientBalance"
        },
        {
            "code": 6004,
            "name": "InvalidTokenMintAccount"
        },
        {
            "code": 6005,
            "name": "InvalidWithdrawer"
        },
        {
            "code": 6006,
            "name": "InvalidRequire"
        },
        {
            "code": 6007,
            "name": "InvalidSwapRequire"
        },
        {
            "code": 6008,
            "name": "InvalidDataLength"
        },
        {
            "code": 6009,
            "name": "ConversionFailed"
        },
        {
            "code": 6010,
            "name": "InvalidSignature"
        },
        {
            "code": 6011,
            "name": "InvalidInviter"
        },
        {
            "code": 6012,
            "name": "SignatureHasExpired"
        }
    ]
};
