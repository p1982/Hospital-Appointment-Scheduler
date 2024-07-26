import { Appointment } from '../../types/appointment.interface.ts';
import { Service } from 'typedi';
import DatabaseClient from '../client.ts';
import { dbConfig } from '../../config/index.ts';

@Service()
class AppointmentRepository {
  private dbClient: DatabaseClient;

  constructor() {
    this.dbClient = new DatabaseClient(dbConfig);
  }

  createAppointment = async (
    appointment: Appointment,
  ): Promise<Appointment> => {
    const queryText = `
      INSERT INTO appointments (patient_id, doctor_id, appointment_date, reason, time, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, patient_id AS "patientId", doctor_id AS "doctorId", appointment_date AS "appointmentDate",
                reason, time, status, created_at AS "createdAt", updated_at AS "updatedAt";
    `;

    const values = [
      appointment.patientId,
      appointment.doctorId,
      appointment.appointmentDate,
      appointment.reason,
      appointment.time,
      appointment.status,
    ];

    try {
      await this.dbClient.query('BEGIN');

      // Check availability in schedules_time table
      const checkAvailabilityQuery = `
        SELECT id FROM schedules_time 
        WHERE doctor_id = $1 AND date = $2 AND start_schedule <= $3 AND end_schedule > $3 AND is_available = TRUE
        FOR UPDATE;
      `;
      const checkAvailabilityValues = [
        appointment.doctorId,
        appointment.appointmentDate,
        appointment.time,
      ];

      const availabilityResult = await this.dbClient.query(
        checkAvailabilityQuery,
        checkAvailabilityValues,
      );

      if (availabilityResult.rows.length === 0) {
        throw new Error('The time slot is not available');
      }

      const result = await this.dbClient.query(queryText, values);
      if (result.rows.length > 0) {
        const appointmentData = result.rows[0];
        const patientId = appointmentData.patientId;
        const doctorId = appointmentData.doctorId;

        const patientQuery = `SELECT id, first_name AS "firstName", last_name AS "lastName", email FROM patients WHERE id = $1`;
        const doctorQuery = `SELECT id, first_name AS "firstName", last_name AS "lastName", email, specialization FROM doctors WHERE id = $1`;

        const patientResult = await this.dbClient.query(patientQuery, [
          patientId,
        ]);
        const doctorResult = await this.dbClient.query(doctorQuery, [doctorId]);

        const patientData =
          patientResult.rows.length > 0 ? patientResult.rows[0] : null;
        const doctorData =
          doctorResult.rows.length > 0 ? doctorResult.rows[0] : null;

        const scheduleTimeId = availabilityResult.rows[0].id;
        const updateScheduleTimeQuery = `
          UPDATE schedules_time
          SET is_available = FALSE, updated_at = NOW()
          WHERE id = $1;
        `;
        await this.dbClient.query(updateScheduleTimeQuery, [scheduleTimeId]);

        await this.dbClient.query('COMMIT');

        return {
          ...appointmentData,
          patient: patientData,
          doctor: doctorData,
        };
      } else {
        throw new Error('Appointment not created');
      }
    } catch (err) {
      await this.dbClient.query('ROLLBACK');
      console.error('Error executing query:', err);
      throw err;
    }
  };

  updateAppointment = async (
    appointment: Appointment,
  ): Promise<Appointment> => {
    const queryText = `
    UPDATE appointments
    SET patient_id = $1, doctor_id = $2, appointment_date = $3, reason = $4, time = $5, status = $6
    WHERE id = $7
    RETURNING id, patient_id AS "patientId", doctor_id AS "doctorId", appointment_date AS "appointmentDate",
              reason, time, status, created_at AS "createdAt", updated_at AS "updatedAt";
  `;

    const values = [
      appointment.patientId,
      appointment.doctorId,
      appointment.appointmentDate,
      appointment.reason,
      appointment.time,
      appointment.status,
      appointment.id,
    ];

    try {
      await this.dbClient.query('BEGIN');

      // Check availability in schedules_time table
      const checkAvailabilityQuery = `
      SELECT id FROM schedules_time 
      WHERE doctor_id = $1 AND date = $2 AND start_schedule <= $3 AND end_schedule > $3 AND is_available = TRUE
      FOR UPDATE;
    `;
      const checkAvailabilityValues = [
        appointment.doctorId,
        appointment.appointmentDate,
        appointment.time,
      ];

      const availabilityResult = await this.dbClient.query(
        checkAvailabilityQuery,
        checkAvailabilityValues,
      );

      if (availabilityResult.rows.length === 0) {
        throw new Error('The time slot is not available');
      }

      // Proceed with appointment update
      const result = await this.dbClient.query(queryText, values);
      if (result.rows.length > 0) {
        const appointmentData = result.rows[0];
        const patientId = appointmentData.patientId;
        const doctorId = appointmentData.doctorId;

        const patientQuery = `SELECT id, first_name AS "firstName", last_name AS "lastName", email FROM patients WHERE id = $1`;
        const doctorQuery = `SELECT id, first_name AS "firstName", last_name AS "lastName", email, specialization FROM doctors WHERE id = $1`;

        const patientResult = await this.dbClient.query(patientQuery, [
          patientId,
        ]);
        const doctorResult = await this.dbClient.query(doctorQuery, [doctorId]);

        const patientData =
          patientResult.rows.length > 0 ? patientResult.rows[0] : null;
        const doctorData =
          doctorResult.rows.length > 0 ? doctorResult.rows[0] : null;

        // Mark the schedule_time slot as unavailable
        const scheduleTimeId = availabilityResult.rows[0].id;
        const updateScheduleTimeQuery = `
        UPDATE schedules_time
        SET is_available = FALSE
        WHERE id = $1;
      `;
        await this.dbClient.query(updateScheduleTimeQuery, [scheduleTimeId]);

        await this.dbClient.query('COMMIT');

        return {
          ...appointmentData,
          patient: patientData,
          doctor: doctorData,
        };
      } else {
        throw new Error('Appointment not updated');
      }
    } catch (err) {
      await this.dbClient.query('ROLLBACK');
      console.error('Error updating appointment:', err);
      throw err;
    }
  };

  deleteAppointment = async (id: string): Promise<string> => {
    const queryText = `DELETE FROM appointments WHERE id = $1`;
    try {
      await this.dbClient.query(queryText, [id]);
      return `Appointment with ID ${id} deleted successfully.`;
    } catch (err) {
      return `Error executing query: ${err}`;
    }
  };

  getAppointment = async (patientId: string): Promise<Appointment[]> => {
    const queryText = `
      SELECT *
      FROM appointments
      WHERE patient_id = $1
    `;

    try {
      const result = await this.dbClient.query(queryText, [patientId]);

      return result.rows;
    } catch (err) {
      console.error('Error executing query:', err);
      throw err;
    }
  };
}

export default AppointmentRepository;
