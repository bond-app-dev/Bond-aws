import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import routes from './routes/index.js'; // Importa tus rutas
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: './public/.env' });
}

const port = process.env.PORT || 8080

const app = express();

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());

app.use(morgan('dev'));
app.use('/', routes);

app.use(express.static(path.join(__dirname, 'public')));


app.listen(port, () => {
  console.log('listening on port ', port);
});