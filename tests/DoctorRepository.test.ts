import AppointmentRepository from '../src/dal/appointment/appointment.repository.ts';
import { Appointment } from '../src/types/appointment.interface.ts';
import DatabaseClient from '../src/dal/client.ts';

jest.mock('../src/dal/client.ts'); // Mock the DatabaseClient

describe('AppointmentRepository', () => {
  let repository: AppointmentRepository;
  let mockDbClient: jest.Mocked<DatabaseClient>;

  const mockAppointment: Appointment = {
    id: 1,
    patientId: 1,
    doctorId: 1,
    appointmentDate: '2024-08-20',
    time: '10:00:00',
    reason: 'Checkup',
    status: 'Scheduled',
    createdAt: '2024-08-01T10:00:00Z',
    updatedAt: '2024-08-01T10:00:00Z',
  };

  beforeEach(() => {
    mockDbClient = new DatabaseClient({} as any) as jest.Mocked<DatabaseClient>;
    repository = new AppointmentRepository();
    (repository as any).dbClient = mockDbClient; // Inject mock client into repository
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createAppointment', () => {
    it('should create an appointment and return it', async () => {
      // Mock check availability query
      mockDbClient.query.mockResolvedValueOnce({
        rows: [{ id: 1 }],
        rowCount: 1,
      });

      // Mock appointment creation query
      mockDbClient.query.mockResolvedValueOnce({
        rows: [mockAppointment],
        rowCount: 1,
      });

      const result = await repository.createAppointment(mockAppointment);

      expect(mockDbClient.query).toHaveBeenCalledTimes(3); // For availability check, appointment creation, and final commit
      expect(result).toEqual(mockAppointment);
    });
  });

  describe('updateAppointment', () => {
    it('should update an appointment and return the updated appointment', async () => {
      // Mock check existing appointment query
      mockDbClient.query.mockResolvedValueOnce({
        rows: [mockAppointment],
        rowCount: 1,
      });

      // Mock check availability query
      mockDbClient.query.mockResolvedValueOnce({
        rows: [{ id: 1 }],
        rowCount: 1,
      });

      // Mock appointment update query
      mockDbClient.query.mockResolvedValueOnce({
        rows: [mockAppointment],
        rowCount: 1,
      });

      const result = await repository.updateAppointment(mockAppointment);

      expect(mockDbClient.query).toHaveBeenCalledTimes(4); // For locking, freeing old slot, checking availability, and updating
      expect(result).toEqual(mockAppointment);
    });
  });

  describe('deleteAppointment', () => {
    it('should delete an appointment and return a success message', async () => {
      // Mock delete appointment query
      mockDbClient.query.mockResolvedValueOnce({
        rows: [{ id: 1, doctor_id: 1, date: '2024-08-20', time: '10:00:00' }],
        rowCount: 1,
      });

      const result = await repository.deleteAppointment('1');

      expect(mockDbClient.query).toHaveBeenCalledTimes(3); // For deletion, updating schedule, and final commit
      expect(result).toBe(
        "Appointment deleted successfully and doctor's slot is now available",
      );
    });
  });

  describe('getAppointments', () => {
    it('should return a list of appointments for a patient', async () => {
      mockDbClient.query.mockResolvedValueOnce({
        rows: [mockAppointment],
        rowCount: 1,
      });

      const result = await repository.getAppointments('1');

      expect(mockDbClient.query).toHaveBeenCalledWith(expect.any(String), [
        '1',
      ]);
      expect(result).toEqual([mockAppointment]);
    });
  });
});
