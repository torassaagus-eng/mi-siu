// 1. Importamos las herramientas que instalamos
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

// 2. Inicializamos el servidor y Prisma
const app = express();
const prisma = new PrismaClient();

// 3. Configuraciones básicas
app.use(cors()); // Permite que otras páginas web se conecten a nuestro servidor
app.use(express.json()); // Permite que el servidor entienda datos en formato JSON

// Sirve los archivos estáticos de la carpeta frontend
app.use(express.static('frontend'));

// Ruta explícita para la página principal
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/frontend/index.html');
});

// 4. RUTA DE MATERIAS
app.get('/materias', async (req, res) => {
  try {
    const todasLasMaterias = await prisma.materia.findMany();
    res.json(todasLasMaterias);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Hubo un problema al buscar las materias" });
  }
});

// RUTA DE HISTORIA ACADÉMICA
app.get('/historia/:dni', async (req, res) => {
  const { dni } = req.params;
  try {
    const alumno = await prisma.usuario.findUnique({
      where: { dni: dni },
      include: {
        inscripciones: {
          include: {
            comision: {
              include: { materia: true }
            }
          }
        }
      }
    });

    if (!alumno) return res.status(404).json({ error: "Alumno no encontrado" });

    res.json(alumno.inscripciones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al cargar la historia" });
  }
});

// RUTA DE LOGIN
app.post('/login', async (req, res) => {
  const { dni, password } = req.body;

  try {
    const usuarioEncontrado = await prisma.usuario.findUnique({
      where: { dni: dni }
    });

    if (!usuarioEncontrado || usuarioEncontrado.password_hash !== password) {
      return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
    }

    res.json({ 
      mensaje: "Login correcto", 
      usuario: {
        nombre: usuarioEncontrado.nombre_completo,
        rol: usuarioEncontrado.rol
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// 5. Puerto dinámico para Render (o 3000 si lo probás en tu PC)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`¡Servidor encendido en el puerto ${PORT}!`);
});