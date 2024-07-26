import { Doctor } from '../../types/doctor.interface.ts';
import { Service } from 'typedi';
import DatabaseClient from '../client.ts';
import { dbConfig } from '../../config/index.ts';
import { Params } from '../../types/params.interface.ts';

@Service()
class DoctorRepository {
  private dbClient: DatabaseClient;
  constructor() {
    this.dbClient = new DatabaseClient(dbConfig);
  }

  //   createDoctor = async (
  //     appointment: Doctor,
  //   ): Promise<Doctor> => {

  //     try {
  //       await this.dbClient.connect();
  //       const queryText = `
  //           INSERT INTO appointments (patient_id, doctor_id, appointment_date, reason, time, status)
  //           VALUES ($1, $2, $3, $4, $5, $6)
  //           RETURNING id, patient_id AS "patientId", doctor_id AS "doctorId", appointment_date AS "appointmentDate",
  //                     reason, time, status, created_at AS "createdAt", updated_at AS "updatedAt";
  //         `;
  //       const values = [
  //         appointment.patientId,
  //         appointment.doctorId,
  //         appointment.appointmentDate,
  //         appointment.reason,
  //         appointment.time,
  //         appointment.status,
  //       ];

  //       const result = await this.dbClient.query(queryText, values);

  //       if (result.rows.length > 0) {
  //         return result.rows[0];
  //       } else {
  //         throw new Error('Appointment not created');
  //       }
  //     } catch (err) {
  //       console.error('Error executing query:', err);
  //       throw err;
  //     } finally {
  //       await this.dbClient.disconnect();
  //     }
  //   };

  //   updateDoctor = async (
  //     doctor: Doctor,
  //   ): Promise<Doctor> => {
  //     try {
  //       await this.dbClient.connect();
  //       const queryText = `
  //         INSERT INTO appointments (patient_id, doctor_id, appointment_date, reason, time, status)
  //           VALUES ($1, $2, $3, $4, $5, $6)
  //           RETURNING id, patient_id AS "patientId", doctor_id AS "doctorId", appointment_date AS "appointmentDate",
  //                     reason, time, status, created_at AS "createdAt", updated_at AS "updatedAt";
  //       `;

  //       const values = [
  //         appointment.patientId,
  //         appointment.doctorId,
  //         appointment.appointmentDate,
  //         appointment.reason,
  //         appointment.time,
  //         appointment.status,
  //       ];

  //       const result = await this.dbClient.query(queryText, values);
  //       return result.rows[0];
  //     } catch (err) {
  //       console.error('Error creating user:', err);
  //       throw err;
  //     } finally {
  //       await this.dbClient.disconnect();
  //     }
  //   };
  //   deleteDoctor = async (id: string): Promise<void> => {

  //     try {
  //       await this.dbClient.connect();
  //       const queryText = `DELETE FROM appointments WHERE id = $1`;
  //       await this.dbClient.query(queryText, [id]);
  //       console.log(`Appointment with ID ${id} deleted successfully.`);
  //     } catch (err) {
  //       console.error('Error executing query:', err);
  //       throw err;
  //     } finally {
  //       await this.dbClient.disconnect();
  //     }
  //   };
  getDoctorById = async (id: string): Promise<Doctor> => {
    const queryText = `
    SELECT d.id, d.first_name, d.last_name, d.specialization, d.contact_number, d.email, 
           json_agg(json_build_object(
             'date', st.date,
             'start_schedule', st.start_schedule,
             'end_schedule', st.end_schedule,
             'is_available', st.is_available
           )) as schedules
    FROM doctors d
    JOIN schedules_time st ON d.id = st.doctor_id
    WHERE d.id = $1
    GROUP BY d.id, d.first_name, d.last_name, d.specialization, d.contact_number, d.email;
  `;

    try {
      const result = await this.dbClient.query(queryText, [id]);
      return result.rows;
    } catch (err) {
      console.error('Error executing query:', err);
      throw err;
    }
  };

  getDoctor = async (params: Params): Promise<Doctor[]> => {
    try {
      const { size, page, filter } = params;
      const { specialization } = filter;

      let queryText = `
      SELECT d.id, d.first_name, d.last_name, d.specialization, d.contact_number, d.email, 
             json_agg(json_build_object(
               'available_date', s.available_date, 
               'start_appointment', s.start_appointment, 
               'end_appointment', s.end_appointment
             )) as schedules
      FROM doctors d
      JOIN schedules s ON d.id = s.doctor_id
    `;

      const queryParams: any[] = [];

      if (specialization) {
        queryText += ' AND d.specialization = $1';
        queryParams.push(specialization);
      }

      queryText +=
        ' GROUP BY d.id, d.first_name, d.last_name, d.specialization, d.contact_number, d.email LIMIT $2 OFFSET $3';
      queryParams.push(size || 10);
      queryParams.push(page ? (page - 1) * (size || 10) : 0);

      if (!specialization) {
        queryText = queryText.replace('$2', '$1').replace('$3', '$2');
      }

      const result = await this.dbClient.query(queryText, queryParams);

      return result.rows;
    } catch (err) {
      console.error('Error executing query:', err);
      throw err;
    }
  };
}

export default DoctorRepository;
