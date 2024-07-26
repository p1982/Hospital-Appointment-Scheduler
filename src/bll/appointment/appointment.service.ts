import AppointmentRepository from '../../dal/appointment/appointment.repository.ts';
import { Service } from 'typedi';
import { Appointment } from '../../types/appointment.interface';

@Service()
class AppointmentsService {
  constructor(private appointmentRepository: AppointmentRepository) {}

  deleteAppointment = async (id: string) => {
    return this.appointmentRepository.deleteAppointment(id);
  };

  updateAppointment = async (
    appointment: Appointment,
  ): Promise<Appointment> => {
    return this.appointmentRepository.updateAppointment(appointment);
  };

  createAppointment = async (
    appointment: Appointment,
  ): Promise<Appointment> => {
    return this.appointmentRepository.createAppointment(appointment);
  };

  getAppointment = async (patientId:string): Promise<Appointment[]> => {
    return this.appointmentRepository.getAppointment(patientId);
  };
}

export default AppointmentsService;
