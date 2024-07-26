import UsersRepository from '../../dal/users/users.repository.ts';
import { User } from '../../types/users.interface.ts';
import { Service } from 'typedi';

@Service()
class UsersService {
  constructor(private usersRepository: UsersRepository) {}
  private normalizeDate = (date: string | Date): string => {
    const normalizedDate = new Date(date);
    normalizedDate.setUTCHours(0, 0, 0, 0); // Устанавливаем время на 00:00 UTC
    return normalizedDate.toISOString().split('T')[0]; // Возвращаем только дату в формате 'yyyy-MM-dd'
  };

  private formatDate = (birthday: string): string => {
    const date = new Date(birthday);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  getUserByEmail = (email: string): Promise<User | null> => {
    return this.usersRepository.getByEmail(email);
  };

  createAUser = async (user: User): Promise<User> => {
    const { birthday } = user;
    const normalDate = this.normalizeDate(birthday);
    const newUser = await this.usersRepository.createAUser({
      ...user,
      birthday: normalDate,
    });
    const date = this.formatDate(newUser.birthday);
    return { ...newUser, birthday: date };
  };
}

export default UsersService;
