"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var crypto = __importStar(require("crypto"));
var Transaction = /** @class */ (function () {
    function Transaction(amount, payer, //public key
    payee //private key
    ) {
        this.amount = amount;
        this.payer = payer;
        this.payee = payee;
    }
    Transaction.prototype.toString = function () {
        return JSON.stringify(this);
    };
    return Transaction;
}());
var Block = /** @class */ (function () {
    function Block(prevHash, transaction, ts) {
        if (ts === void 0) { ts = Date.now(); }
        this.prevHash = prevHash;
        this.transaction = transaction;
        this.ts = ts;
        this.nonce = Math.round(Math.random() * 999999999);
    }
    Object.defineProperty(Block.prototype, "hash", {
        get: function () {
            var str = JSON.stringify(this);
            var hash = crypto.createHash('SHA256');
            hash.update(str).end();
            return hash.digest('hex');
        },
        enumerable: false,
        configurable: true
    });
    return Block;
}());
var Chain = /** @class */ (function () {
    function Chain() {
        this.chain = [new Block("null", new Transaction(100, 'genesis', 'fardu'))];
    }
    Object.defineProperty(Chain.prototype, "lastBlock", {
        get: function () {
            return this.chain[this.chain.length - 1];
        },
        enumerable: false,
        configurable: true
    });
    Chain.prototype.mine = function (nonce) {
        var solution = 1;
        console.log("Mining farduCoin...");
        while (true) {
            var hash = crypto.createHash('SHA256');
            hash.update((nonce + solution).toString()).end();
            var attempt = hash.digest('hex');
            //increment number of 0 to make farduCoin mining harder
            if (attempt.substr(0, 4) === '0000') {
                console.log("Solved: " + solution);
                return solution;
            }
            solution += 1;
        }
    };
    Chain.prototype.addBlock = function (transaction, senderPublicKey, signature) {
        var verifier = crypto.createVerify('SHA256');
        verifier.update(transaction.toString());
        var isValid = verifier.verify(senderPublicKey, signature);
        if (isValid) {
            var newBlock = new Block(this.lastBlock.hash, transaction);
            this.mine(newBlock.nonce);
            this.chain.push(newBlock);
        }
    };
    Chain.instance = new Chain();
    return Chain;
}());
var Wallet = /** @class */ (function () {
    function Wallet(initialBalance) {
        var keypair = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: { type: 'spki', format: 'pem' },
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
        });
        this.walletBalance = initialBalance || 0;
        this.privateKey = keypair.privateKey;
        this.publicKey = keypair.publicKey;
    }
    Wallet.prototype.sendMoney = function (amount, payeePublicKey) {
        if (amount > this.walletBalance) {
            console.log('amount attempted to send is larger than current balance');
            return;
        }
        var transaction = new Transaction(amount, this.publicKey, payeePublicKey);
        var sign = crypto.createSign('SHA256');
        sign.update(transaction.toString()).end();
        var signature = sign.sign(this.privateKey);
        Chain.instance.addBlock(transaction, this.publicKey, signature);
    };
    return Wallet;
}());
var fardu = new Wallet(100);
var maps = new Wallet();
maps.sendMoney(4000, fardu.publicKey);
fardu.sendMoney(10, maps.publicKey);
console.log(Chain.instance);
