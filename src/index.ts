import 'reflect-metadata';
import { Container } from 'typedi';
import App from './server/app';
import config from './config/index';
import AuthController from './server/auth/auth.controller';
import DoctorController from './server/doctors/doctors.controller';
import AppointmentController from './server/appointment/appointment.controller';
import TestController from './server/test/test.controller';

const PORT = config.get('PORT');
const HOST = config.get('HOST');

const init = async (PORT: number, HOST: string) => {
  const app = await new App(
    [
      Container.get(AuthController),
      Container.get(DoctorController),
      Container.get(AppointmentController),
      Container.get(TestController),
    ],
    PORT,
    HOST,
  );
  app.listen();
};

init(PORT, HOST);
