import AppointmentsService from '../../bll/appointment/appointment.service.ts';
import { Service } from 'typedi';
import express from 'express';
import { rolesValidation } from '../../server/middleware/roles.middleware.ts';
import { isAuthenticated } from '../../server/middleware/auth.middleware.ts';
import { Appointment } from '../../types/appointment.interface.ts';


@Service()
class AppointmentController {
  public path = '/appointments';
  public router = express.Router();

  constructor(private appointmenstService: AppointmentsService) {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.get('/:id', isAuthenticated, this.getAppointment);
    this.router.post('/', isAuthenticated, this.createAppointment);
    this.router.put('/', isAuthenticated, this.updateAppointment);
    this.router.delete('/:id', isAuthenticated, rolesValidation(["admin", "patient"]), this.deleteAppointment);

  }

  getAppointment= async (request: express.Request, response: express.Response): Promise<void>  => {
    const patientId: string = request.params.id
    const appointments = this.appointmenstService.getAppointment(patientId)
    response.status(200).json(appointments); 
  }


  deleteAppointment = async (request: express.Request, response: express.Response) =>{
    const appointmentId: string = request.params.id
    const message = this.appointmenstService.deleteAppointment(appointmentId)
    response.status(200).json({message}); 
  }

  updateAppointment = async (request: express.Request, response: express.Response):Promise<void> =>{
    const appointment:Appointment = request.body
    const updatedAppointment = await this.appointmenstService.updateAppointment(appointment)
    response.status(200).json(updatedAppointment); 
  }

  createAppointment = async (request: express.Request, response: express.Response):Promise<void> =>{
    const appointment:Appointment = request.body
    const newAppointment = await this.appointmenstService.createAppointment(appointment)
    response.status(201).json(newAppointment); 
  }
}

export default AppointmentController;
