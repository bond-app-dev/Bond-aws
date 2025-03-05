const crypto = require('crypto');
const sign = crypto.createSign('SHA256');
const fs = require('fs');
if (process.env.NODE_ENV !== 'production') require('dotenv').config({path:'./public/.env'})

const clave = process.env.CLAVE;

class CryptoHandlerS {
    constructor(ordenPagoWs) {
        this.cadenaOriginal = "||" +
                ordenPagoWs['empresa'] + "|" + //a
                ordenPagoWs['cuentaOrdenante'] + "|||" ;
    }
    getSign() {
        var sign = crypto.createSign('RSA-SHA256');
        sign.update(this.cadenaOriginal);
        sign.end();
        const key = process.env.CLAVE.split(String.raw`\n`).join('\n');
        let signature_b64 = sign.sign(key, 'base64');
        return signature_b64;
    }    
}

module.exports = CryptoHandlerS;