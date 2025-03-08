import mysql, { PoolOptions, RowDataPacket } from "mysql2/promise";

// Define a type for the query result
export type QueryResult<T extends RowDataPacket> = T[];

// Define a type for the full query result, including insertId
export type FullQueryResult<T extends RowDataPacket> = {
  rows: T[];
  insertId: number | null;
};

// Define a type for the parameters
export type QueryParams = any[];

const poolConfig: PoolOptions = {
  waitForConnections: true,
  queueLimit: 0,
  connectionLimit: 100,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  connectTimeout: Number(process.env.DB_CONNECT_TIMEOUT) || 10000 // Connection timeout
};

const pool = mysql.createPool(poolConfig);

export default async function executeQuery<T extends RowDataPacket>(query: string, params: QueryParams): Promise<QueryResult<T>> {
  try {
    const [rows] = await pool.query<T[]>(query, params);
    return rows;
  } catch (error: any) {
    console.error("Error executing query:", error);
    throw error;
  }
}

export async function executeQueryWithFullResult<T extends RowDataPacket>(query: string, params: QueryParams): Promise<FullQueryResult<T>> {
  try {
    const [result] = await pool.query<T[]>(query, params);
    return {
      rows: result,
      insertId: (result as any).insertId ?? null, // Ensure insertId is properly returned
    };
  } catch (error: any) {
    console.error("Error executing query:", error);
    throw error;
  }
}
