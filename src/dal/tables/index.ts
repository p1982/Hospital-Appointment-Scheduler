import DatabaseClient from '../client';
import { dbConfig } from '../../config/index';
import {
  createPatientsTable,
  createPatientsUpdatedAtTrigger,
  dropPatientsTable,
} from './patients';
import {
  createDoctorsTable,
  createDoctorsUpdatedAtTrigger,
  dropDoctorsTable,
} from './doctors';
import {
  createAppointmentsTable,
  createAppointmentsUpdatedAtTrigger,
  dropAppointmentsTable,
} from './appointments';
import {
  createSchedulesTable,
  createSchedulesUpdatedAtTrigger,
  dropSchedulesTable,
} from './schedule';
import {
  createMedicalCardsTable,
  createMedicalCardsUpdatedAtTrigger,
  dropMedicalCardsTable,
} from './medicalCard';
import {
  createSchedulesTimeTable,
  createSchedulesTimeUpdatedAtTrigger,
  createUpdateUpdatedAtFunction,
  dropSchedulesTimeTable,
} from './schedules_time';

const dbClient = new DatabaseClient(dbConfig);

const createUpdatedAtTriggerFunction = `
  CREATE OR REPLACE FUNCTION update_updated_at_column()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;
`;

export async function main() {
  try {
    // Удаление таблиц
    await dbClient.query(dropDoctorsTable);
    await dbClient.query(dropPatientsTable);
    await dbClient.query(dropAppointmentsTable);
    await dbClient.query(dropMedicalCardsTable);
    await dbClient.query(dropSchedulesTable);
    await dbClient.query(dropSchedulesTimeTable);

    await dbClient.query(createPatientsTable);
    await dbClient.query(createDoctorsTable);
    await dbClient.query(createAppointmentsTable);
    await dbClient.query(createSchedulesTable);
    await dbClient.query(createMedicalCardsTable);
    await dbClient.query(createSchedulesTimeTable);

    await dbClient.query(createUpdatedAtTriggerFunction);
    await dbClient.query(createPatientsUpdatedAtTrigger);
    await dbClient.query(createDoctorsUpdatedAtTrigger);
    await dbClient.query(createAppointmentsUpdatedAtTrigger);
    await dbClient.query(createSchedulesUpdatedAtTrigger);
    await dbClient.query(createUpdateUpdatedAtFunction);
    await dbClient.query(createSchedulesTimeUpdatedAtTrigger);
    await dbClient.query(createMedicalCardsUpdatedAtTrigger);

    console.log('Tables created successfully');
  } catch (err) {
    console.error('Database operation failed:', err);
  }
}
