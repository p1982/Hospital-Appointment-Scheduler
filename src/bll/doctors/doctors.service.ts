import { Service } from 'typedi';
import DoctorRepository from '../../dal/doctors/doctors.repository';
import { Doctor } from '../../types/doctor.interface';
import { Params } from '../../types/params.interface';
import { AppError } from '../../server/utils/customErrors';

@Service()
class DoctorsService {
  constructor(private doctorRepository: DoctorRepository) {}

  getDoctorById = async (id: string): Promise<Doctor | AppError> => {
    return this.doctorRepository.getDoctorById(id);
  };

  getDoctors = async (params: Params): Promise<Doctor[] | AppError> => {
    return this.doctorRepository.getDoctors(params);
  };
}

export default DoctorsService;
