import { registerAs } from '@nestjs/config';
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';

export default registerAs(
  'dbconfig.dev',
  (): MysqlConnectionOptions => ({
    type: 'mariadb',
    host: process.env.DB_HOST || '0.0.0.0', // Utilisation de variables d'environnement pour plus de sécurité
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'onetube',
    synchronize: true,
    dropSchema: false,
    logging: false,
  }),
);
