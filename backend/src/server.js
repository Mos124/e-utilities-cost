const app = require('./app');
const { sequelize } = require('./models');
const seedInitialData = require('./seeders/init.seeder');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    console.log('🔄 Connecting to Database...');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully.');

    console.log('🔄 Syncing database tables...');
    await sequelize.sync({ alter: false });
    console.log('✅ Database tables synchronized.');

    console.log('🔄 Running initial data seeder...');
    await seedInitialData();

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
