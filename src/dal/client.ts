import pkg from 'pg';
const { Client,  } = pkg;


interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  url: string;
}

class DatabaseClient {
  private config: any;
  constructor(config: DatabaseConfig) {
    this.config = config;
  }

  

  public async query(text: string, params?: any[]): Promise<any> {
    const client = new Client(this.config);
    await client.connect();
    try {
      const res = await client.query(text, params);
      return res;
    } catch (err) {
      throw err;
    } finally {
      await client.end();
    }
  }

  private handleError(err: unknown, message: string): never {
    if (err instanceof Error) {
      console.error(`${message}: ${err.message}`);
      throw err;
    } else {
      console.error(message);
      throw new Error(message);
    }
  }
}

export default DatabaseClient;

