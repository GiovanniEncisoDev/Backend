require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();

// PostgreSQL config
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  ssl: {
    rejectUnauthorized: false
  }
});

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan('dev'));
app.use(express.static('public'));

// Obtener películas
app.get('/peliculas', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM peliculas');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener películas' });
  }
});

// Agregar película
app.post('/peliculas', async (req, res) => {
  const { titulo, director, genero, anio, imagen, url } = req.body;
  try {
    const query = `
      INSERT INTO peliculas (titulo, director, genero, anio, imagen, url)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;
    await pool.query(query, [titulo, director, genero, anio, imagen, url]);
    res.status(201).json({ mensaje: 'Película agregada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al agregar película' });
  }
});

// Modificar película
app.patch('/peliculas/:id', async (req, res) => {
  const { id } = req.params;
  const { titulo, director, genero, anio } = req.body;
  try {
    const query = `
      UPDATE peliculas SET titulo = $1, director = $2, genero = $3, anio = $4
      WHERE idPelicula = $5
    `;
    await pool.query(query, [titulo, director, genero, anio, id]);
    res.json({ mensaje: 'Película actualizada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar película' });
  }
});

// Eliminar película
app.delete('/peliculas/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM peliculas WHERE idPelicula = $1', [id]);
    res.json({ mensaje: 'Película eliminada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar película' });
  }
});

// Ruta no encontrada
app.use((req, res) => {
  res.status(404).send('Ruta no encontrada');
});

// Iniciar servidor
app.listen(process.env.PORT, () => {
  console.log(`Servidor ejecutándose en puerto ${process.env.PORT}`);
});
