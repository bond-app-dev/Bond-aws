import express from'express';
import jwt from'jsonwebtoken';
import axios from'axios';
import { CryptoHandler } from '../CryptHandlerMaestro.js';
import { CryptoHandlerC } from '../CryptHandlerMaestro.js';
import { CryptoHandlerCH } from '../CryptHandlerMaestro.js';
import { CryptoHandlerO } from '../CryptHandlerMaestro.js';
import { CryptoHandlerS } from '../CryptHandlerMaestro.js';

const router = express.Router();

router.get('/', (req,res)=>{
   res.status(200).send('ok, 1.0005');
   const ipCliente = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    console.log("Solicitud recibida de IP:", ipCliente);
})

router.post('/', (req,res)=>{
  res.status(401).send('Invalid Endpoint');
  const ipCliente = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
   console.log("Solicitud recibida de IP:", ipCliente);
})
//---------------------------------------------------ENDPOINTS AL STP DIRECTO, TIENE IP CAMBIANTE-------------------------------------------------------------------------------
router.post('/registraOrden', async (req,res)=>{
  console.log('Datos recibidos: ', req.body);
  
  try {
    const ipCliente = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    console.log("Solicitud recibida de IP:", ipCliente);
    const response = await axios({
      url: 'https://bond-app-1.bubbleapps.io/api/1.1/wf/pagoabond',
      method: 'post',
      responseType: 'json',
      data: req.body,
      headers: {'Content-Type':'application/json'},
      rejectUnauthorized: false 
    });
    
    console.log("Respuesta API: ", response.data);
    return res.status(200).send('Ok');

  } catch (error) {
    console.log("Error: ", error.message);
    if (error.response) {
      console.error('Código de estado:', error.response.status);
      console.error('Cuerpo del error:', error.response.data);
      return res.status(error.response.status).json({ 
        error: 'Error en la API externa', 
        detalles: error.response.data 
      });
    }
    if (error.request) {
      console.error('No hubo respuesta de la API externa:', error.request);
      return res.status(500).json({ error: 'No hubo respuesta de la API externa' });
    } 
      console.error('Error al configurar la solicitud:', error.message);
      return res.status(500).json({ error: 'Error interno en el servidor' });
  }          
});

router.post('/cambioEstado', async (req,res)=>{
  const ipCliente = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    console.log("Solicitud recibida de IP:", ipCliente);
  console.log('Datos recibidos: ', req.body);
  try {
    const response = await axios({
      url: 'https://bond-app-1.bubbleapps.io/api/1.1/wf/cambiodeestado',
      method: 'post',
      responseType: 'json',
      data: req.body,
      headers: {'Content-Type':'application/json'},
      rejectUnauthorized: false
    });

    console.log("Respuesta API: ", response.data);
    return res.status(200).send('Ok');

  } catch (error) {
    console.log("Error: ", error.message);
    if (error.response) {
      console.error('Código de estado:', error.response.status);
      console.error('Cuerpo del error:', error.response.data);
      return res.status(error.response.status).json({ 
        error: 'Error en la API externa', 
        detalles: error.response.data 
      });
    } 
    if (error.request) {
      console.error('No hubo respuesta de la API externa:', error.request);
      return res.status(500).json({ error: 'No hubo respuesta de la API externa' });
    } 
      console.error('Error al configurar la solicitud:', error.message);
      return res.status(500).json({ error: 'Error interno en el servidor' });
    
  }

});

//Esta api se usa para obtener una cuenta nueva para asignar a los partners, el input es sin e dìgito verificador
router.post('/getCuenta', (req,res)=>{
  var cuentaEjemplo = req.body.clabe
  const ponderacion = [3,7,1,3,7,1,3,7,1,3,7,1,3,7,1,3,7]
  var resultado = []

  for (var i = 0; i < cuentaEjemplo.length; i++) {
    resultado.push(parseInt(cuentaEjemplo[i]) * ponderacion[i])
  }

  resultado.forEach((element, index) => {
    resultado[index] = resultado[index] % 10
  });

  var sum = resultado.reduce((partialSum, a) => partialSum + a, 0)

  sum = sum % 10
  sum = 10 - sum
  sum = sum % 10
  cuentaEjemplo = cuentaEjemplo + sum

  res.status(200).send({clabePartner: cuentaEjemplo});
});

//Dispersión --Done
router.get('/registrarOrden', (req,res)=>{
    const {authorization} = req.headers;  
    if(!authorization){return res.status(400);}else
      jwt.verify(authorization,'BdK=zEw6@}x(z0=I`pm&&e”Fyyv', function(err, decoded) { //esta linea es para desencriptar el json encriptado en jwt
        if (decoded) {
          let ordenPagoWs = { //se asignan los valores
            empresa: decoded.empresa1,
            monto: decoded.monto1,
            claveRastreo: decoded.claveRastreo1,
            conceptoPago: decoded.conceptoPago1,
            cuentaBeneficiario: decoded.cuentaBeneficiario1,
            institucionContraparte: decoded.institucionContraparte1,
            institucionOperante: decoded.institucionOperante1,
            nombreBeneficiario: decoded.nombreBeneficiario1,
            referenciaNumerica: decoded.referenciaNumerica1,
            tipoCuentaBeneficiario: decoded.tipoCuentaBeneficiario1,
            tipoCuentaOrdenante: decoded.tipoCuentaOrdenante1,
            cuentaOrdenante: decoded.cuentaOrdenante1,
            rfcCurpBeneficiario: decoded.rfcCurpBeneficiario1,
            tipoPago: decoded.tipoPago1
          }
          
          let crypto =  new CryptoHandler(ordenPagoWs); 
          
          console.log(crypto);
          ordenPagoWs['firma'] = crypto.getSign(); //se obtiene la firma que pide STP
          console.log(ordenPagoWs);
          console.log('entra axios');
          axios({
            url: 'https://10.5.1.1:7002/speiws/rest/ordenPago/registra', 
            method: 'PUT',
            responseType: 'JSON',
            data: ordenPagoWs,
            headers: {'Content-Type':'application/json', 'Host': 'prod.stpmex.com'}
          })
          .then(function (response) {
            console.log('Respuesta'); //se loggea en la consola
            res.send(response.data);
          })
          .catch((error) => { 
            console.log('Catch')
            console.log(error)
            res.status(400).send(error)
          }) 
          
      }if(err){
        res.status(400).send('jwt expired');
      }
    }
    );
});


//Conciliación para el dia especifico en el que se llama el api
router.get('/Conciliacion', (req,res)=>{
  const {authorization} = req.headers;  
  if(!authorization){return res.status(400);}else   
    jwt.verify(authorization,'BdK=zEw6@}x(z0=I`pm&&e”Fyyv', function(err, decoded) {  //esta linea es para desencriptar el json encriptado en jwt
      if (decoded) {
        let ordenPagoWs = {
          empresa: decoded.empresa1,
          tipoOrden: decoded.tipoOrden1
        }
        let crypto = new CryptoHandlerC(ordenPagoWs);
        console.log(crypto, "hola");
        console.log("hola", crypto.getSign())
        ordenPagoWs['page'] = decoded.page1;
        ordenPagoWs['firma'] = crypto.getSign();
      
        console.log(ordenPagoWs);

        axios({
          url: 'https://10.5.1.1:7002/efws/API/V2/conciliacion', 
          method: 'POST',
          responseType: 'JSON',
          data: ordenPagoWs,
          headers: {'Content-Type':'application/json', 'Host': 'prod.stpmex.com'}
        })
        .then(function (response) {
          res.send(response.data);
        }) 
        .catch((error) => {
          console.log('Catch')
          console.log(JSON.stringify(error))
          res.status(400).send(error)
        }) 
      }if(err){
        res.status(400).send('jwt expired');
      }
    });
});

//Conciliación para el dia que el api especifica
router.get('/ConciliacionHistorica', (req,res)=>{
  const {authorization} = req.headers;  
  if(!authorization){return res.status(400);}else   
    jwt.verify(authorization,'BdK=zEw6@}x(z0=I`pm&&e”Fyyv', function(err, decoded) {  
      if (decoded) {
        let ordenPagoWs = {
          empresa: decoded.empresa1,
          tipoOrden: decoded.tipoOrden1,
          fechaOperacion: decoded.fechaOperacion1
        }
        console.log(ordenPagoWs);
        console.log('crypto:')
        let crypto = new CryptoHandlerCH(ordenPagoWs);

        console.log(crypto);
        ordenPagoWs['page'] = decoded.page1;
        ordenPagoWs['firma'] = crypto.getSign();
        console.log('ordenpagos:')
        console.log(ordenPagoWs);

        axios({
          url: 'https://10.5.1.1:7002/efws/API/V2/conciliacion', 
          method: 'POST',
          responseType: 'JSON',
          data: ordenPagoWs,
          headers: {'Content-Type':'application/json', 'Host': 'prod.stpmex.com'}
        })
        .then(function (response) {
          res.send(response.data);
        }) 
        .catch((error) => {
          console.log('Catch')
          console.log(error.message)
          res.status(400).send(error)
        }) 
      }if(err){
        res.status(400).send('jwt expired');
      }
    });
});


//Consulta Orden --Done
router.get('/ConsultaOrden', (req,res)=>{
  const {authorization} = req.headers;  
  
  if(!authorization){return res.status(400);}else   
    jwt.verify(authorization,'BdK=zEw6@}x(z0=I`pm&&e”Fyyv', function(err, decoded) {
      
      if (decoded) {   
        let ordenPagoWs = {
          empresa: decoded.empresa1,
          claveRastreo: decoded.claveRastreo1,
          tipoOrden: decoded.tipoOrden1
        }
        let crypto = new CryptoHandlerO(ordenPagoWs);
      
        console.log(crypto)
        ordenPagoWs['firma'] = crypto.getSign();
        console.log(ordenPagoWs);
        
        axios({
          url: 'https://10.5.1.1:7002/efws/API/consultaOrden', 
          method: 'post',
          responseType: 'json',
          data: ordenPagoWs,
          headers: {'Content-Type':'application/json', 'Host':'prod.stpmex.com'},
          rejectUnauthorized: false
        })
        .then(function (response) {
          res.send(response.data)
        })
        .catch((error) => {
          console.log(error.response.data)
          res.send(error.response.data)
        }) 
        

      }if(err){
        res.status(400).send('jwt expired');
      }
    });
});

//Consulta Ordenes
router.get('/ConsultaOrdenes', (req,res)=>{
  const {authorization} = req.headers;  
  
  if(!authorization){return res.status(400);}else   
    jwt.verify(authorization,'BdK=zEw6@}x(z0=I`pm&&e”Fyyv', function(err, decoded) {
      
      if (decoded) {   
        let ordenPagoWs = {
          empresa: decoded.empresa1,
          claveRastreo: decoded.claveRastreo1,
          tipoOrden: decoded.tipoOrden1,
          fechaOperacion: decoded.fechaOperacion1
        }
        let crypto = new CryptoHandlerO(ordenPagoWs);
        console.log(crypto)
        ordenPagoWs['firma'] = crypto.getSign();
        console.log(ordenPagoWs);
        
        axios({
          url: 'https://10.5.1.1:7002/efws/API/consultaOrdenes', 
          method: 'POST',
          responseType: 'JSON',
          data: ordenPagoWs,
          headers: {'Content-Type':'application/json', 'Host': 'prod.stpmex.com'}
        })
        .then(function (response) {
          res.send(response.data)
        })
        .catch((error) => {
          console.log('Catch')
          console.log(JSON.stringify(error))
          res.status(400).send(error)
        }) 
        

      }if(err){
        res.status(400).send('jwt expired');
      }
    });
});



//Saldo --done
router.get('/Saldo', (req,res)=>{
  const {authorization} = req.headers;  
  
  if(!authorization){return res.status(400);}else   
    jwt.verify(authorization,'BdK=zEw6@}x(z0=I`pm&&e”Fyyv', function(err, decoded) {
      
      if (decoded) {
        console.log('Paso el JwT')

        let ordenPagoWs = {
          empresa:decoded.empresa1,
          cuentaOrdenante: decoded.cuentaordenante1,
        }
        /*let cadena ='||BOND_APP|646180370300000002|||'*/
        let crypto = new CryptoHandlerS(ordenPagoWs);
        console.log(crypto)
        ordenPagoWs['firma'] = crypto.getSign();
        console.log('se formateo el json')
        console.log(ordenPagoWs)
        axios({
          url: 'https://10.5.1.1:7002/efws/API/consultaSaldoCuenta',
          method: 'POST',
          responseType: 'JSON',
          data: ordenPagoWs,
          headers: {'Content-Type':'application/json', 'Host': 'prod.stpmex.com'},
        })
        .then(function (response) {
          res.send(response.data)
        })
        .catch((error) => {
          console.log('Catch')
          console.log(JSON.stringify(error))
          res.status(400).send(error)
        }) 

      }if(err){
        res.status(400).send('jwt expired');
      }
    });
});










//---------------------------------------------------ENDPOINTS AL PROXY-------------------------------------------------------------------------------
//SON LOS MISMOS QUE LOS DE ARRIBA, PERO MANDAN LLAMAR A LOS ENDPOINTS QUE ESTÁN EN EL PROXY
//CONVIENE TENER LOS DE ARRIBA COMO BACKUP
//endpoint para el saldo de la cuenta
router.post('/SaldoProx', (req,res)=>{
  const authorization = req.body.token;  
  
  if(!authorization){return res.status(400);}else   
    jwt.verify(authorization,'BdK=zEw6@}x(z0=I`pm&&e”Fyyv', function(err, decoded) { //decodifica el jwt que recibe de Bubble, con ese string como llave
      if (decoded) {
        let ordenPagoWs = {
          empresa: decoded.empresa1,
          cuentaOrdenante: decoded.cuentaordenante1
        }
        
        let crypto = CryptoHandlerS(ordenPagoWs);
        ordenPagoWs['firma'] = crypto.getSign();
        axios({
          url: 'https://10.5.1.1:7002/efws/API/consultaSaldoCuenta', //este manda llamar el proxy al endpoint de obtener saldo, que se usa para tener mismo IP
          method: 'POST',
          responseType: 'JSON',
          data: ordenPagoWs,
          headers: {'Content-type': 'application/json', 'Host': 'prod.stpmex.com'}
        })
        .then(function (response) {
          res.send(response.data) // manda la respuesta a Bubble
        })
        .catch((error) => {
          console.log('Catch')
          console.log(JSON.stringify(error))
          res.status(400).send(error)
        }) 

      }if(err){
        res.status(400).send('jwt expired');
      }
    });
});

// endpoint para tener el ip del servidor
router.get('/ping',(req,res)=>{
  axios({
    url: process.env.url,
    proxy: {
      host: process.env.host,
      port: process.env.pot
    }
  }).then(response => {
    console.log(response)
  }).catch(error => {
    console.log(error)
  })

})

router.get('/ip',(req,res)=>{
  axios({
    url: 'https://jsonip.com/',
  }).then(response => {
    res.status(200).send(response.data)
  }).catch(error => {
    res.status(400).send(error)
  })

})

//enpoint para dispersar
router.get('/registrarOrdenProx', (req,res)=>{
  const {authorization} = req.headers;  
  if(!authorization){return res.status(400);}else
    jwt.verify(authorization,'BdK=zEw6@}x(z0=I`pm&&e”Fyyv', function(err, decoded) { //decodifica el jwt que recibe de Bubble, con ese string como llave
      if (decoded) {
        let ordenPagoWs = { // se setea el body que recibe de bubble
          empresa: decoded.empresa1,
          monto: decoded.monto1,
          claveRastreo: decoded.claveRastreo1,
          conceptoPago: decoded.conceptoPago1,
          cuentaBeneficiario: decoded.cuentaBeneficiario1,
          institucionContraparte: decoded.institucionContraparte1,
          institucionOperante: decoded.institucionOperante1,
          nombreBeneficiario: decoded.nombreBeneficiario1,
          referenciaNumerica: decoded.referenciaNumerica1,
          tipoCuentaBeneficiario: decoded.tipoCuentaBeneficiario1,
          tipoCuentaOrdenante: decoded.tipoCuentaOrdenante1,
          cuentaOrdenante: decoded.cuentaOrdenante1,
          rfcCurpBeneficiario: decoded.rfcCurpBeneficiario1,
          tipoPago: decoded.tipoPago1
        }
        
        let crypto =  new CryptoHandler(ordenPagoWs); 
        console.log(crypto);
        ordenPagoWs['firma'] = crypto.getSign(); //se obtiene la firma con el algoritmo de encriptacion
        console.log(ordenPagoWs);
        console.log('entra axios');
        axios({
          url: 'http://35.202.214.126:80/speiws/rest/ordenPago/registra', //este manda llamar el proxy al endpoint de registraOrden, que se usa para tener mismo IP
          method: 'PUT',
          responseType: 'JSON',
          data: ordenPagoWs,
          headers: {'Content-Type':'application/json', 'Host': 'prod.stpmex.com'}
        })
        .then(function (response) {
          console.log('Respuesta');
          res.send(response.data); //manda la respuesta a Bubble
        })
        .catch((error) => { 
          console.log('Catch')
          console.log(error)
          res.status(400).send(error)
        }) 
        
    }if(err){
      res.status(400).send('jwt expired');
    }
  }
  );

});

// endpoint para conciliacion del mismo dìa que se manda llamar el endpoint
router.get('/ConciliacionProx', (req,res)=>{
  const {authorization} = req.headers;  
  if(!authorization){return res.status(400);}else   
    jwt.verify(authorization,'BdK=zEw6@}x(z0=I`pm&&e”Fyyv', function(err, decoded) {  //decodifica el jwt que recibe de Bubble, con ese string como llave
      if (decoded) {
        let ordenPagoWs = {
          empresa: decoded.empresa1,
          tipoOrden: decoded.tipoOrden1
        }
        let crypto = new CryptoHandlerC(ordenPagoWs);
        console.log(crypto);
        console.log(crypto.getSign()) //se obtiene la firma encriptada para STP
        ordenPagoWs['page'] = decoded.page1;
        ordenPagoWs['firma'] = crypto.getSign();
      
        console.log(ordenPagoWs);

        axios({
          url: 'http://35.202.214.126:80/efws/API/V2/conciliacion', //este manda llamar el proxy al endpoint de conciliacion del mismo dìa, que se usa para tener mismo IP
          method: 'POST',
          responseType: 'JSON',
          data: ordenPagoWs,
          headers: {'Content-Type':'application/json', 'Host': 'prod.stpmex.com'}
        })
        .then(function (response) {
          res.send(response.data); //manda respuesta a Bubble
        }) 
        .catch((error) => {
          console.log('Catch')
          console.log(JSON.stringify(error))
          res.status(400).send(error)
        }) 
      }if(err){
        res.status(400).send('jwt expired');
      }
    });
});

//endpoint para consultar las ordenes de una fecha
router.get('/ConsultaOrdenesProx', (req,res)=>{
  const {authorization} = req.headers;  
  
  if(!authorization){return res.status(400);}else   
    jwt.verify(authorization,'BdK=zEw6@}x(z0=I`pm&&e”Fyyv', function(err, decoded) { //decodifica el jwt que recibe de Bubble, con ese string como llave
      
      if (decoded) {   
        let ordenPagoWs = {
          empresa: decoded.empresa1,
          claveRastreo: decoded.claveRastreo1,
          tipoOrden: decoded.tipoOrden1,
          fechaOperacion: decoded.fechaOperacion1 //recibe fecha en vez de clave rastero
        }
        let crypto = new CryptoHandlerO(ordenPagoWs);
        console.log(crypto)
        ordenPagoWs['firma'] = crypto.getSign(); //encriptacion del body para la firma que pide STP
        console.log(ordenPagoWs);
        
        axios({
          url: 'http://35.202.214.126:80/efws/API/consultaOrdenes', //manda llamar al proxy al endpoint de consultaOrdenes
          method: 'POST',
          responseType: 'JSON',
          data: ordenPagoWs,
          headers: {'Content-Type':'application/json', 'Host': 'prod.stpmex.com'}
        })
        .then(function (response) {
          res.send(response.data) //manda respuesta a Bubble
        })
        .catch((error) => {
          console.log('Catch')
          console.log(JSON.stringify(error))
          res.status(400).send(error)
        }) 
        

      }if(err){
        res.status(400).send('jwt expired');
      }
    });
});

//endpoint para consultar una orden especifica
router.get('/ConsultaOrdenProx', (req,res)=>{
  const {authorization} = req.headers;  
  
  if(!authorization){return res.status(400);}else   
    jwt.verify(authorization,'BdK=zEw6@}x(z0=I`pm&&e”Fyyv', function(err, decoded) { //decodifica el jwt que recibe de Bubble, con ese string como llave
      
      if (decoded) {   
        let ordenPagoWs = {
          empresa: decoded.empresa1,
          claveRastreo: decoded.claveRastreo1, //recibe la calve de rastreo
          tipoOrden: decoded.tipoOrden1
        }
        let crypto = new CryptoHandlerO(ordenPagoWs);
        console.log(crypto)
        ordenPagoWs['firma'] = crypto.getSign(); //firma de encriptacion para STP
        console.log(ordenPagoWs);
        
        axios({
          url: 'http://35.202.214.126:80/efws/API/consultaOrden', //manda llamar al proxy al endpoint de consulta orden
          method: 'post',
          responseType: 'json',
          data: ordenPagoWs,
          headers: {'Content-Type':'application/json', 'Host':'prod.stpmex.com'},
          rejectUnauthorized: false
        })
        .then(function (response) {
          res.send(response.data)
        })
        .catch((error) => {
          console.log(error.response.data)
          res.send(error.response.data)
        }) 
        

      }if(err){
        res.status(400).send('jwt expired');
      }
    });
});

//endpoint para conciliacion por dia
router.get('/ConciliacionHistoricaProx', (req,res)=>{
  const {authorization} = req.headers;  
  if(!authorization){return res.status(400);}else   
    jwt.verify(authorization,'BdK=zEw6@}x(z0=I`pm&&e”Fyyv', function(err, decoded) {  //decodifica el jwt que recibe de Bubble, con ese string como llave
      if (decoded) {
        let ordenPagoWs = {
          empresa: decoded.empresa1,
          tipoOrden: decoded.tipoOrden1,
          fechaOperacion: decoded.fechaOperacion1 //recibe la fecha de operacion que se desee la conciliacion
        }
        console.log(ordenPagoWs);
        console.log('crypto:')
        let crypto = new CryptoHandlerCH(ordenPagoWs);
        console.log(crypto);
        ordenPagoWs['page'] = decoded.page1;
        ordenPagoWs['firma'] = crypto.getSign(); //firma encriptada que pide STP
        console.log('ordenpagos:')
        console.log(ordenPagoWs);

        axios({
          url: 'http://35.202.214.126:80/efws/API/V2/conciliacion', //manda llamar al endpoint del proxy de conciliacion
          method: 'POST',
          responseType: 'JSON',
          data: ordenPagoWs,
          headers: {'Content-Type':'application/json', 'Host': 'prod.stpmex.com'}
        })
        .then(function (response) {
          res.send(response.data); //manda respuesta a Bubble
        }) 
        .catch((error) => {
          console.log('Catch')
          console.log(error.message)
          res.status(400).send(error)
        }) 
      }if(err){
        res.status(400).send('jwt expired');
      }
    });
});



/*NUEVO ENDPOINT*/

router.get('/CHistorica', (req,res)=>{
  const {authorization} = req.headers;  
  if(!authorization){return res.status(400);}else   
    jwt.verify(authorization,'BdK=zEw6@}x(z0=I`pm&&e”Fyyv', function(err, decoded) {  //decodifica el jwt que recibe de Bubble, con ese string como llave
      if (decoded) {
        let ordenPagoWs = {
          empresa: decoded.empresa1,
          tipoOrden: decoded.tipoOrden1,
          fechaOperacion: decoded.fechaOperacion1 //recibe la fecha de operacion que se desee la conciliacion
        }
        console.log(ordenPagoWs);
        console.log('crypto:')
        let crypto = new CryptoHandlerCH(ordenPagoWs);
        console.log(crypto);
        ordenPagoWs['page'] = decoded.page1;
        ordenPagoWs['firma'] = crypto.getSign(); //firma encriptada que pide STP
        console.log('ordenpagos:')
        console.log(ordenPagoWs);

        axios({
          url: 'http://35.202.214.126:80/efws/API/V2/conciliacion', //manda llamar al endpoint del proxy de conciliacion
          method: 'POST',
          responseType: 'JSON',
          data: ordenPagoWs,
          headers: {'Content-Type':'application/json', 'Host': 'prod.stpmex.com'}
        })
        .then(function (response) {
          res.send(response.data); //manda respuesta a Bubble
        }) 
        .catch((error) => {
          console.log('Catch')
          console.log(error.message)
          res.status(400).send(error)
        }) 
      }if(err){
        res.status(400).send('jwt expired');
      }
    });
});

export default router;