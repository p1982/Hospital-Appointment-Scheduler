import { User } from "../../types/users.interface.ts";
import { Service } from "typedi";
import DatabaseClient from '../client.ts';
import { dbConfig } from '../../config/index.ts';


@Service()
class UsersRepository {
  constructor(private dbClient = new DatabaseClient(dbConfig)) {}


  getByEmail = async (email: string): Promise<User | null> => {
    const queryText = `
      SELECT id, first_name AS "firstName", last_name AS "lastName", password, birthday, gender, contact_number AS "contactNumber", email, role, address, created_at AS "createdAt", updated_at AS "updatedAt"
      FROM patients
      WHERE email = $1
    `;
    const values = [email];

    try {
      const result = await this.dbClient.query(queryText, values);
      if (result.rows.length > 0) {
        return result.rows[0];
      } else {
        return null;
      }
    } catch (err) {
      console.error('Error executing query:', err);
      throw err;
    }
  };

  createAUser = async (user: User): Promise<User> => {
    const queryText = `
      INSERT INTO patients (first_name, last_name, birthday, gender, contact_number, email, address, password, role)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, first_name AS "firstName", last_name AS "lastName", birthday, gender, contact_number AS "contactNumber", email, address, created_at AS "createdAt", updated_at AS "updatedAt", role;
    `;
    const values = [
      user.firstName,
      user.lastName,
      user.birthday,
      user.gender,
      user.contactNumber,
      user.email,
      user.address,
      user.password,
      "patient"
    ];

    try {
      const result = await this.dbClient.query(queryText, values);
      return result.rows[0];
    } catch (err) {
      console.error('Error creating user:', err);
      throw err;
    }
  };
}

export default UsersRepository;