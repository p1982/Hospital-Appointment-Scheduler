import DoctorsService from '../../bll/doctors/doctors.service.ts';
import { Service } from 'typedi';
import express from 'express';
import { rolesValidation } from '../../server/middleware/roles.middleware.ts';
import { isAuthenticated } from '../../server/middleware/auth.middleware.ts';

@Service()
class DoctorController {
  public path = '/doctors';
  public router = express.Router();

  constructor(private doctorsService: DoctorsService) {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.get('/', this.getDoctor);
    this.router.get(
      '/:id',
      isAuthenticated,
      rolesValidation(['admin', 'patient', 'doctor']),
      this.getDoctorById,
    );
  }

  getDoctor = async (
    request: express.Request,
    response: express.Response,
  ): Promise<void> => {
    const params = {
      size: request.query.size ? Number(request.query.size) : null,
      page: request.query.page ? Number(request.query.page) : null,
      filter: { specialization: request.query.specialization || null },
    };
    const doctors = await this.doctorsService.getDoctor(params);
    response.send(doctors);
  };

  getDoctorById = async (
    request: express.Request,
    response: express.Response,
  ): Promise<void> => {
    const id = request.params.id;
    const doctors = await this.doctorsService.getDoctorById(id);
    response.send(doctors);
  };
}

export default DoctorController;
