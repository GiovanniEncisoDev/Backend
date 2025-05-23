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
  ssl: { rejectUnauthorized: false }
});


// Middlewares
app.use(express.json());
const corsOptions = {
  origin: 'https://giovanniencisodev.github.io',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type']
};

app.use(cors(corsOptions));

app.use(morgan('dev'));
app.use(express.static('public'));

// Obtener todas las películas
app.get('/peliculas', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM peliculas ORDER BY id ASC');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener películas:', error);
    res.status(500).json({ error: 'Error al obtener películas' });
  }
});

// Agregar nueva película
app.post('/peliculas', async (req, res) => {
  const { titulo, director, genero, anio, imagen, url } = req.body;

  if (!titulo || !genero) {
    return res.status(400).json({ error: 'Título y género son obligatorios' });
  }

  try {
    const query = `
      INSERT INTO peliculas (titulo, director, genero, anio, imagen, url)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;
    await pool.query(query, [titulo, director, genero, anio, imagen, url]);
    res.status(201).json({ mensaje: 'Película agregada exitosamente' });
  } catch (error) {
    console.error('Error al agregar película:', error);
    res.status(500).json({ error: 'Error al agregar película' });
  }
});

// Modificar una película existente
app.patch('/peliculas/:id', async (req, res) => {
  const { id } = req.params;
  const { titulo, director, genero, anio, imagen, url } = req.body;

  try {
    const query = `
      UPDATE peliculas
      SET titulo = $1, director = $2, genero = $3, anio = $4, imagen = $5, url = $6
      WHERE id = $7
    `;
    const result = await pool.query(query, [titulo, director, genero, anio, imagen, url, id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Película no encontrada' });
    }

    res.json({ mensaje: 'Película actualizada correctamente' });
  } catch (error) {
    console.error('Error al actualizar película:', error);
    res.status(500).json({ error: 'Error al actualizar película' });
  }
});

// Eliminar una película
app.delete('/peliculas/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM peliculas WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Película no encontrada' });
    }

    res.json({ mensaje: 'Película eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar película:', error);
    res.status(500).json({ error: 'Error al eliminar película' });
  }
});

// Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
});
