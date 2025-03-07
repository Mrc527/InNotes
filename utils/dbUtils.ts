import mysql from "mysql2/promise";

const pool = mysql.createPool({
  connectionLimit: 100,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  debug: false
});

export default async function executeQuery(query: string, params: any[]): Promise<any> {
  try {
    const [rows] = await pool.query(query, params);
    return rows;
  } catch (error: any) {
    console.error("Error executing query:", error);
    throw error;
  }
}
export async function executeQueryWithFullResult(query: string, params: any[]): Promise<any> {
  try {
    const [result] = await pool.query(query, params);
    return {
      rows: result,
      insertId: (result as any).insertId ?? null, // Ensure insertId is properly returned
    };
  } catch (error: any) {
    console.error("Error executing query:", error);
    throw error;
  }
}
