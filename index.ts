import * as crypto from 'crypto';

class Transaction {
    constructor (
        public amount : number,
        public payer : string,  //public key
        public payee : string   //private key
    ) {}
    
    toString(){
        return JSON.stringify(this)
    }

}

class Block {

    public nonce = Math.round(Math.random() * 999999999)

    constructor(
        public prevHash : string,
        public transaction : Transaction,
        public ts = Date.now()
    ){}

    get hash() {
        const str = JSON.stringify(this)
        const hash = crypto.createHash('SHA256')
        hash.update(str).end()
        return hash.digest('hex')
    }
    
}

class Chain {
    public static instance = new Chain()

    chain: Block[]

    constructor(){
        this.chain = [new Block("null", new Transaction(100, 'genesis', 'onie'))]       
    }

    get lastBlock(){
        return this.chain[this.chain.length - 1]
    }

    mine(nonce: number){
        let solution = 1
        console.log("Mining farduCoin...")

        while(true) {
            const hash = crypto.createHash('SHA256')
            hash.update((nonce + solution).toString()).end()

            const attempt = hash.digest('hex')

            //increment number of 0 to make farduCoin mining harder
            if(attempt.substr(0,4) === '0000'){
                console.log(`Solved: ${solution}`)
                return solution
            }

            solution += 1
        }

    }

    addBlock(transaction: Transaction, senderPublicKey: string, signature: Buffer){
        const verifier = crypto.createVerify('SHA256')
        verifier.update(transaction.toString())

        const isValid = verifier.verify(senderPublicKey, signature)

        if(isValid){
            const newBlock = new Block(this.lastBlock.hash, transaction)
            this.mine(newBlock.nonce)
            this.chain.push(newBlock)
        }
        
    }  
}

class Wallet {
    public publicKey : string
    public privateKey : string
    //todo: need to implement balance, need to initialize balance
    public walletBalance : number


    constructor(initialBalance?: number){
        const keypair = crypto.generateKeyPairSync('rsa', {
            modulusLength : 2048,
            publicKeyEncoding : {type : 'spki', format : 'pem'},
            privateKeyEncoding : {type : 'pkcs8', format : 'pem'}
        })
        this.walletBalance = initialBalance || 0;

        this.privateKey = keypair.privateKey
        this.publicKey = keypair.publicKey
    }

    sendMoney(amount: number, payeePublicKey: string){
        if(amount > this.walletBalance){
            console.log('amount attempted to send is larger than current balance')
            return
        }

        const transaction = new Transaction(amount, this.publicKey, payeePublicKey);

        const sign = crypto.createSign('SHA256')
        sign.update(transaction.toString()).end()

        const signature = sign.sign(this.privateKey)
        Chain.instance.addBlock(transaction, this.publicKey, signature)
    }
}

const fardu = new Wallet(100)
const maps = new Wallet()

maps.sendMoney(4000, fardu.publicKey)
fardu.sendMoney(10, maps.publicKey)

console.log(Chain.instance)
