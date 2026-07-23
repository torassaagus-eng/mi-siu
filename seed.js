const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 1. Buscamos tu usuario específicamente por tu DNI real
  let alumno = await prisma.usuario.findUnique({
    where: { dni: "46218679" }
  });

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

  console.log(`👤 Usuario encontrado: ${alumno.nombre_completo}. Preparando la base de datos...`);

  // 2. Limpiamos solo tu historial viejo para cargar el nuevo de cero
  await prisma.inscripcionCursada.deleteMany({
    where: { alumno_id: alumno.id }
  });
  console.log("🧹 Limpiando historial anterior...");

  // 3. El historial completo que me pasaste
  const historial = [
    // --- PRIMER AÑO | 1º Cuatrimestre ---
    { cod: "CFG01", nom: "Universidad, Sociedad y Conocimientos", anio_carrera: 1, cuatrimestre: 1, notas: [{ est: "Aprobada", nota: 6, fecha: "2024-07-05" }] },
    { cod: "CFG02", nom: "Problemáticas contemporáneas", anio_carrera: 1, cuatrimestre: 1, notas: [{ est: "Promocionada", nota: 8, fecha: "2024-07-12" }] },
    { cod: "CB01", nom: "Taller de Estadística y Cálculo", anio_carrera: 1, cuatrimestre: 1, notas: [{ est: "Aprobada", nota: 8, fecha: "2024-07-18" }] },
    { cod: "CB02", nom: "Taller de Lectura y Escritura Académica", anio_carrera: 1, cuatrimestre: 1, notas: [{ est: "Aprobada", nota: 7, fecha: "2024-07-22" }] },

    // --- PRIMER AÑO | 2º Cuatrimestre ---
    { cod: "CB05", nom: "Introducción al Análisis Matemático", anio_carrera: 1, cuatrimestre: 2, notas: [{ est: "Aprobada", nota: 6, fecha: "2024-12-10" }] },
    { cod: "CB06", nom: "Fundamentos de Informática", anio_carrera: 1, cuatrimestre: 2, notas: [{ est: "Promocionada", nota: 9, fecha: "2024-12-14" }] },
    { cod: "CB07", nom: "Química General", anio_carrera: 1, cuatrimestre: 2, notas: [{ est: "Aprobada", nota: 8, fecha: "2024-12-18" }] },
    { cod: "CB08", nom: "Física I", anio_carrera: 1, cuatrimestre: 2, notas: [{ est: "Aprobada", nota: 6, fecha: "2024-12-21" }] },
    { cod: "CB09", nom: "Algoritmos y Estructuras de Datos", anio_carrera: 1, cuatrimestre: 2, notas: [{ est: "Aprobada", nota: 7, fecha: "2024-12-26" }] },

    // --- SEGUNDO AÑO | 1º Cuatrimestre ---
    { cod: "CC01", nom: "Fundamentos de Computación", anio_carrera: 2, cuatrimestre: 1, notas: [{ est: "Aprobada", nota: 8, fecha: "2025-07-06" }] },
    { cod: "CB10", nom: "Análisis Matemático I", anio_carrera: 2, cuatrimestre: 1, notas: [{ est: "Aprobada", nota: 6, fecha: "2025-07-10" }] },
    { cod: "CB11", nom: "Álgebra y Geometría Analítica", anio_carrera: 2, cuatrimestre: 1, notas: [{ est: "Aprobada", nota: 7, fecha: "2025-07-15" }] },
    { cod: "CB12", nom: "Sistema de Representación Gráfica", anio_carrera: 2, cuatrimestre: 1, notas: [{ est: "Promocionada", nota: 9, fecha: "2025-07-20" }] },
    { cod: "CC14", nom: "Inglés I", anio_carrera: 2, cuatrimestre: 1, notas: [{ est: "Promocionada", nota: 8, fecha: "2025-07-25" }] },

    // --- SEGUNDO AÑO | 2º Cuatrimestre ---
    { cod: "CB13", nom: "Análisis Matemático II", anio_carrera: 2, cuatrimestre: 2, notas: [{ est: "Aprobada", nota: 6, fecha: "2025-12-05" }] },
    { cod: "CS01", nom: "Economía", anio_carrera: 2, cuatrimestre: 2, notas: [{ est: "Aprobada", nota: 7, fecha: "2025-12-10" }] },
    { cod: "CC15", nom: "Inglés II", anio_carrera: 2, cuatrimestre: 2, notas: [{ est: "Promocionada", nota: 8, fecha: "2025-12-15" }] },
    { cod: "CB14", nom: "Física II", anio_carrera: 2, cuatrimestre: 2, notas: [{ est: "Aprobada", nota: 6, fecha: "2025-12-18" }] },
    { cod: "CC02", nom: "Ingeniería en Computación I", anio_carrera: 2, cuatrimestre: 2, notas: [{ est: "Aprobada", nota: 7, fecha: "2025-12-22" }] },

    // --- TERCER AÑO | 1º Cuatrimestre ---
    { cod: "CB15", nom: "Probabilidad y Estadística", anio_carrera: 3, cuatrimestre: 1, notas: [{ est: "Regular", nota: 5, fecha: "2026-07-20" }] },
    { cod: "CB16", nom: "Física III", anio_carrera: 3, cuatrimestre: 1, notas: [{ est: "Aprobada", nota: 6, fecha: "2026-07-21" }] },
    { cod: "CC03", nom: "Programación", anio_carrera: 3, cuatrimestre: 1, notas: [{ est: "Aprobada", nota: 7, fecha: "2026-07-14" }] },
    { cod: "CC04", nom: "Electrónica Analógica", anio_carrera: 3, cuatrimestre: 1, notas: [{ est: "Aprobada", nota: 7, fecha: "2026-07-19" }] },
    { cod: "CC16", nom: "Inglés III", anio_carrera: 3, cuatrimestre: 1, notas: [{ est: "Promocionada", nota: 8, fecha: "2026-07-10" }] }
  ];

  // 4. Guardamos todo en la base de datos
  for (const item of historial) {
    const materia = await prisma.materia.upsert({
      where: { codigo: item.cod },
      update: {}, 
      create: { 
          codigo: item.cod, 
          nombre: item.nom, 
          anio_carrera: item.anio_carrera, 
          cuatrimestre: item.cuatrimestre 
      }
    });

    for (const nota of item.notas) {
      const comision = await prisma.comision.create({
        data: { 
            materia: { connect: { id: materia.id } },
            ciclo_lectivo: nota.fecha.substring(0, 4),
            cupo_maximo: 50,
            horario: "A definir",
            docente: { connect: { id: alumno.id } }
        }
      });

      await prisma.inscripcionCursada.create({
        data: {
          alumno: { connect: { id: alumno.id } },
          comision: { connect: { id: comision.id } },
          estado: nota.est,
          nota_final: nota.nota,
          fecha_inscripcion: new Date(nota.fecha)
        }
      });
    }
    console.log(`✅ ${item.nom} procesada.`);
  }

  console.log("🎉 ¡Listo! Base de datos actualizada con todo tu historial real.");
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => {
    console.error("❌ Hubo un error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });