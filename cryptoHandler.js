import crypto from('crypto');
import fs from('fs');
const sign = crypto.createSign('SHA256');
if (process.env.NODE_ENV !== 'production') require('dotenv').config({path:'./public/.env'})

const clave = process.env.CLAVE;

export class CryptoHandlerN {
    constructor(ordenPagoWs) {
        this.cadenaOriginal = "||" +
                ordenPagoWs['institucionContraparte'] + "|" + //a
                ordenPagoWs['empresa'] + "|||" + //b
                ordenPagoWs['claveRastreo'] + "|" + //e
                ordenPagoWs['institucionOperante'] + "|" + //f
                (ordenPagoWs['monto']) + "|" + //g
                ordenPagoWs['tipoPago'] + "|" + //h
                ordenPagoWs['tipoCuentaOrdenante'] + "||"; 
        if (ordenPagoWs['nombreOrdenante']) {
            this.cadenaOriginal = this.cadenaOriginal + ordenPagoWs['nombreOrdenante'] + "|"; //j
        }
        if (ordenPagoWs['cuentaOrdenante']) {
            this.cadenaOriginal = this.cadenaOriginal + ordenPagoWs['cuentaOrdenante'] + "|"; //k
        }
        if (ordenPagoWs['rfcCurpOrdenante']) {
            this.cadenaOriginal = this.cadenaOriginal + ordenPagoWs['rfcCurpOrdenante'] + "|"; //l
        }
        this.cadenaOriginal = this.cadenaOriginal + "|" +
                ordenPagoWs['tipoCuentaBeneficiario'] + "|" + //m
                ordenPagoWs['nombreBeneficiario'] + "|" + //n
                ordenPagoWs['cuentaBeneficiario'] + "|" + //o
                ordenPagoWs['rfcCurpBeneficiario'] + "||||||" + //pqrstu
                ordenPagoWs['conceptoPago'] + "||||||" + //vwxyzaa
                ordenPagoWs['referenciaNumerica'] + "||||||||" ; //bbcc
    }
    getSign() {
        var sign = crypto.createSign('RSA-SHA256');
        sign.update(this.cadenaOriginal);
        sign.end();
        const key = process.env.CLAVE.split(String.raw`\n`).join('\n');
        let signature_b64 = sign.sign(key, 'base64');
        console.log(this.cadenaOriginal);
        return signature_b64;
    }


    
}



module.exports = CryptoHandlerN;