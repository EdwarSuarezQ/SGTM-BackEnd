// Migration script to convert Tarea.asignado (String) to Tarea.asignadoId (ObjectId)
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/sgtm-crud';

// Define schemas
const personalSchema = new mongoose.Schema({
  nombre: String,
  email: String,
  puesto: String,
  departamento: String,
});

const tareaSchema = new mongoose.Schema({
  titulo: String,
  descripcion: String,
  asignado: String,
  asignadoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Personal' },
  fecha: Date,
  prioridad: String,
  estado: String,
  departamento: String,
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { strict: false });

const Personal = mongoose.model('Personal', personalSchema);
const Tarea = mongoose.model('Tarea', tareaSchema);

async function migrateTareas() {
  try {
    console.log('🔄 Conectando a MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Conectado a MongoDB');

    // Get all personal records
    const personalRecords = await Personal.find({});
    console.log(`📋 Encontrados ${personalRecords.length} registros de personal`);

    // Create a map of nombre -> _id
    const personalMap = {};
    personalRecords.forEach(p => {
      personalMap[p.nombre.toLowerCase().trim()] = p._id;
    });

    console.log('📊 Mapa de personal:', personalMap);

    // Get all tareas
    const tareas = await Tarea.find({});
    console.log(`📋 Encontradas ${tareas.length} tareas para migrar`);

    let migrated = 0;
    let notFound = 0;
    let alreadyMigrated = 0;

    for (const tarea of tareas) {
      // Skip if already has asignadoId
      if (tarea.asignadoId) {
        console.log(`⏭️  Tarea "${tarea.titulo}" ya tiene asignadoId, saltando...`);
        alreadyMigrated++;
        continue;
      }

      if (!tarea.asignado) {
        console.log(`⚠️  Tarea "${tarea.titulo}" no tiene campo asignado, saltando...`);
        continue;
      }

      const asignadoNombre = tarea.asignado.toLowerCase().trim();
      const personalId = personalMap[asignadoNombre];

      if (personalId) {
        tarea.asignadoId = personalId;
        await tarea.save();
        console.log(`✅ Migrada tarea "${tarea.titulo}": "${tarea.asignado}" → ${personalId}`);
        migrated++;
      } else {
        console.log(`❌ No se encontró personal con nombre "${tarea.asignado}" para tarea "${tarea.titulo}"`);
        notFound++;
      }
    }

    console.log('\n📊 Resumen de migración:');
    console.log(`   ✅ Migradas: ${migrated}`);
    console.log(`   ⏭️  Ya migradas: ${alreadyMigrated}`);
    console.log(`   ❌ No encontradas: ${notFound}`);
    console.log(`   📋 Total: ${tareas.length}`);

    if (notFound > 0) {
      console.log('\n⚠️  ADVERTENCIA: Algunas tareas no pudieron ser migradas porque no se encontró el personal correspondiente.');
      console.log('   Revisa los nombres en la base de datos de Personal.');
    }

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Conexión cerrada');
  }
}

// Run migration
migrateTareas()
  .then(() => {
    console.log('\n✅ Migración completada exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error en la migración:', error);
    process.exit(1);
  });
