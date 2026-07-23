const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Limpiando datos de pruebas anteriores...");
  // Borramos de abajo hacia arriba para no romper relaciones
  await prisma.inscripcionCursada.deleteMany({});
  await prisma.comision.deleteMany({});

  console.log("🌱 Iniciando la carga de datos nueva...");

  // 1. Crear o buscar el DOCENTE (obligatorio para la comisión)
  let docente = await prisma.usuario.findUnique({ where: { dni: "11111111" } });
  if (!docente) {
    docente = await prisma.usuario.create({
      data: {
        nombre_completo: "Profesor Titular",
        email: "profesor@sistemau.com",
        rol: "DOCENTE",
        dni: "11111111",
        password_hash: "proffe123"
      }
    });
  }

  // 2. Crear o buscar tu usuario ALUMNO
  let alumno = await prisma.usuario.findUnique({ where: { dni: "46218679" } });
  if (!alumno) {
    alumno = await prisma.usuario.create({
      data: {
        nombre_completo: "Agustin Torassa",
        email: "torassaagus@gmail.com",
        rol: "ALUMNO",
        dni: "46218679",
        password_hash: "agusloco05"
      }
    });
  }

  // 3. Crear MATERIAS
  const matematica = await prisma.materia.upsert({
    where: { codigo: "MAT101" },
    update: {},
    create: { 
      codigo: "MAT101", 
      nombre: "Matemática I", 
      anio_carrera: 1,
      cuatrimestre: 1 
    }
  });

  const programacion = await prisma.materia.upsert({
    where: { codigo: "PROG102" },
    update: {},
    create: { 
      codigo: "PROG102", 
      nombre: "Algoritmos y Estructuras de Datos", 
      anio_carrera: 1,
      cuatrimestre: 1 
    }
  });

  // 4. Crear COMISIONES (Conectadas correctamente)
  const comisionMat = await prisma.comision.create({
    data: {
      ciclo_lectivo: "2026",
      cupo_maximo: 50,
      horario: "Mañana",
      materia: { connect: { id: matematica.id } },
      docente: { connect: { id: docente.id } }
    }
  });

  const comisionProg = await prisma.comision.create({
    data: {
      ciclo_lectivo: "2026",
      cupo_maximo: 50,
      horario: "Tarde",
      materia: { connect: { id: programacion.id } },
      docente: { connect: { id: docente.id } }
    }
  });

  // 5. Inscribirte en las comisiones (Corregido a nota_final)
  await prisma.inscripcionCursada.create({
    data: {
      estado: "APROBADO",
      nota_final: 9,
      alumno: { connect: { id: alumno.id } },
      comision: { connect: { id: comisionMat.id } }
    }
  });

  await prisma.inscripcionCursada.create({
    data: {
      estado: "CURSANDO",
      nota_final: null,
      alumno: { connect: { id: alumno.id } },
      comision: { connect: { id: comisionProg.id } }
    }
  });

  console.log("🎉 ¡Listo! Base de datos poblada con éxito y sin errores.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });