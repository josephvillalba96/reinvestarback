const mongoose = require('mongoose');
const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const solicitudRoutes = require('./routes/solicitudRoutes');
app.use('/api/solicitudes', solicitudRoutes);

// Conectar a MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ Conectado a MongoDB Atlas');

    // 🔹 Importa tu modelo aquí
    const Solicitud = require('./models/solicitud');

    // 🔹 Fuerza la creación de la colección si no existe
    const collectionName = Solicitud.collection.collectionName;

    const exists = await mongoose.connection.db
      .listCollections({ name: collectionName })
      .hasNext();

    if (!exists) {
      await mongoose.connection.createCollection(collectionName);
      console.log(`📁 Colección "${collectionName}" creada forzadamente.`);
    } else {
      console.log(`📁 Colección "${collectionName}" ya existe.`);
    }

    // 🔹 Levanta el servidor
    app.listen(process.env.PORT, () =>
      console.log(`🚀 Servidor corriendo en puerto ${process.env.PORT}`)
    );
  })
  .catch((error) => {
    console.error('❌ Error al conectar a MongoDB Atlas:', error.message);
  });

