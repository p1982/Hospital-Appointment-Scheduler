import { Service } from 'typedi';
import { AppError } from '../../server/utils/customErrors';
import UsersRepository from '../../dal/users/users.repository';
import { User } from '../../types/users.interface';

@Service()
class UsersService {
  constructor(private usersRepository: UsersRepository) {}
  private normalizeDate = (date: string | Date): string => {
    const normalizedDate = new Date(date);
    normalizedDate.setUTCHours(0, 0, 0, 0);
    return normalizedDate.toISOString().split('T')[0];
  };

  private formatDate = (birthday: string): string => {
    const date = new Date(birthday);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  getUserByEmail = (email: string): Promise<User | null | AppError> => {
    return this.usersRepository.getByEmail(email);
  };

  createAUser = async (user: User): Promise<User | AppError> => {
    const { birthday } = user;
    const normalDate = this.normalizeDate(birthday);
    const newUser = await this.usersRepository.createAUser({
      ...user,
      birthday: normalDate,
    });

    if (this.isAppError(newUser)) {
      return newUser;
    }

    if (!newUser || !newUser.birthday) {
      return newUser;
    }

    const date = this.formatDate(newUser.birthday);
    return { ...newUser, birthday: date };
  };
  private isAppError(user: User | AppError): user is AppError {
    return (user as AppError).message !== undefined;
  }
}

export default UsersService;
