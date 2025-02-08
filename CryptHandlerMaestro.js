import crypto from 'crypto';
import dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: './public/.env' });
}
class Metodo {
    getSign() {
        var sign = crypto.createSign('RSA-SHA256');
        sign.update(this.cadenaOriginal);
        sign.end();
        const key = process.env.CLAVE.split(String.raw`\n`).join('\n');
        let signature_b64 = sign.sign(key, 'base64');
        return signature_b64;
    }    
}

export class CryptoHandlerS extends Metodo {
    constructor(ordenPagoWs) {
        this.cadenaOriginal = "||" +
                ordenPagoWs['empresa'] + "|" + //a
                ordenPagoWs['cuentaOrdenante'] + "|||" ;
    }
}

export class CryptoHandlerO {
    constructor(ordenPagoWs) {
        this.cadenaOriginal = "||" +
                ordenPagoWs['empresa'] + "|" + //a
                ordenPagoWs['claveRastreo'] + "|" +
                ordenPagoWs['tipoOrden'] + "|||" ; //b
    }
}

export class CryptoHandlerCH {
    constructor(ordenPagoWs) {
        this.cadenaOriginal = "||" +
                ordenPagoWs['empresa'] + "|" + //a
                ordenPagoWs['tipoOrden'] + "|" +
                ordenPagoWs['fechaOperacion'] + "||" ;
    }
}


export class CryptoHandlerC {
    constructor(ordenPagoWs) {
        this.cadenaOriginal = "||" +
                ordenPagoWs['empresa'] + "|" + //a
                ordenPagoWs['tipoOrden'] + "|||" ;
    }
}



export class CryptoHandler {
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
}


//export {CryptoHandler, CryptoHandlerC, CryptoHandlerCH, CryptoHandlerO, CryptoHandlerS}

