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

// 4. NUESTRA PRIMERA RUTA (Endpoint)
// Cuando alguien entre a la ruta "/materias", ejecutamos esta función:
app.get('/materias', async (req, res) => {
  try {
    // Le pedimos a Prisma que busque TODAS las materias en la base de datos
    const todasLasMaterias = await prisma.materia.findMany();
    
    // Devolvemos esas materias al usuario
    res.json(todasLasMaterias);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Hubo un problema al buscar las materias" });
  }
});

// 5. Encendemos el servidor en el puerto 3000
const PORT = 3000;
// RUTA DE HISTORIA ACADÉMICA
app.get('/historia/:dni', async (req, res) => {
  const { dni } = req.params;
  try {
    // Buscamos al usuario e incluimos sus inscripciones y las materias conectadas
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

    // Devolvemos la lista de inscripciones (Historia)
    res.json(alumno.inscripciones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al cargar la historia" });
  }
});
app.listen(PORT, () => {
  console.log(`¡Servidor del SIU-Guaraní encendido en http://localhost:${PORT}!`);
});
// RUTA DE LOGIN
app.post('/login', async (req, res) => {
  // Recibimos los datos que envía la página web
  const { dni, password } = req.body;

  try {
    // Buscamos en la base de datos si existe alguien con ese DNI
    const usuarioEncontrado = await prisma.usuario.findUnique({
      where: { dni: dni }
    });

    // Validamos: Si no existe el usuario, o si la contraseña no coincide
    if (!usuarioEncontrado || usuarioEncontrado.password_hash !== password) {
      // 401 significa "No Autorizado"
      return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
    }

    // Si pasamos la validación, el login es exitoso
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