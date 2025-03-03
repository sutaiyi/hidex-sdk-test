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
            "name": "buyCreateTokenIdempotent3",
            "accounts": [
                {
                    "name": "detradeConfigPda",
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
                    "name": "tokenMint",
                    "isMut": false,
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
                    "name": "amount",
                    "type": "u64"
                }
            ]
        },
        {
            "name": "buyComplete3",
            "accounts": [
                {
                    "name": "swapPda",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "detradeConfigPda",
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
                    "name": "tokenMint",
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
                    "name": "amount",
                    "type": "u64"
                },
                {
                    "name": "transactionType",
                    "type": "u64"
                }
            ]
        },
        {
            "name": "saleCreateWsolIdempotent3",
            "accounts": [
                {
                    "name": "detradeConfigPda",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "user",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "wsolMint",
                    "isMut": false,
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
            "args": []
        },
        {
            "name": "saleComplete3",
            "accounts": [
                {
                    "name": "swapPda",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "detradeConfigPda",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "user",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "wsolMint",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "tokenMint",
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
                    "name": "amount",
                    "type": "u64"
                },
                {
                    "name": "totalFee",
                    "type": "u64"
                },
                {
                    "name": "transactionType",
                    "type": "u64"
                }
            ]
        },
        {
            "name": "buyCompletedEvent",
            "accounts": [
                {
                    "name": "swapPda",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "detradeConfigPda",
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
                    "name": "tokenMint",
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
                    "name": "amount",
                    "type": "u64"
                },
                {
                    "name": "userAtaAmountBefore",
                    "type": "u64"
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
            "name": "buyToken2022CompletedEvent",
            "accounts": [
                {
                    "name": "swapPda",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "detradeConfigPda",
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
                    "name": "tokenMint",
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
                    "name": "amount",
                    "type": "u64"
                },
                {
                    "name": "userAtaAmountBefore",
                    "type": "u64"
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
            "name": "saleCompletedEvent",
            "accounts": [
                {
                    "name": "swapPda",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "detradeConfigPda",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "user",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "wsolMint",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "tokenMint",
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
                    "name": "amount",
                    "type": "u64"
                },
                {
                    "name": "userLamportsBefore",
                    "type": "u64"
                },
                {
                    "name": "totalFee",
                    "type": "u64"
                },
                {
                    "name": "transactionType",
                    "type": "u64"
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
            "name": "saleToken2022CompletedEvent",
            "accounts": [
                {
                    "name": "swapPda",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "detradeConfigPda",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "user",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "wsolMint",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "tokenMint",
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
                    "name": "amount",
                    "type": "u64"
                },
                {
                    "name": "userLamportsBefore",
                    "type": "u64"
                },
                {
                    "name": "totalFee",
                    "type": "u64"
                },
                {
                    "name": "transactionType",
                    "type": "u64"
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
            "name": "saleCreateWsolIdempotentByTg",
            "accounts": [
                {
                    "name": "detradeConfigPda",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "user",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "wsolMint",
                    "isMut": false,
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
            "args": []
        },
        {
            "name": "buyCreateTokenIdempotentByTg",
            "accounts": [
                {
                    "name": "detradeConfigPda",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "user",
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
                    "name": "amount",
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
