export interface Doctor {
    id?: number;
    firstName: string;
    lastName: string;
    specialization: string;
    contactNumber: string;
    email: string;
    password?: string;
    createdAt?: Date; 
    updatedAt?: Date; 
  }