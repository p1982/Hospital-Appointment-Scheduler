import DoctorRepository from '../../dal/doctors/doctors.repository.ts';
import { Service } from 'typedi';
import { Doctor } from '../../types/doctor.interface.ts';
import { Params } from '../../types/params.interface.ts';

@Service()
class DoctorsService {
  constructor(private doctorRepository: DoctorRepository) {}

  //   deleteAppointment = async (id: string) => {
  //     return this.doctorRepository.deleteDoctor(id);
  //   };

  //   updateAppointment = async (
  //     appointment: Appointment,
  //   ): Promise<Appointment> => {
  //     return this.doctorRepository.updateDoctor(appointment);
  //   };

  //   createAppointment = async (
  //     appointment: Appointment,
  //   ): Promise<Appointment> => {
  //     return this.doctorRepository.createDoctor(appointment);
  //   };

  getDoctorById = async (id: string): Promise<Doctor> => {
    return this.doctorRepository.getDoctorById(id);
  };

  getDoctor = async (params: Params): Promise<Doctor[]> => {
    return this.doctorRepository.getDoctor(params);
  };
}

export default DoctorsService;
