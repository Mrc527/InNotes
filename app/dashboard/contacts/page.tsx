// app/dashboard/contacts/page.tsx
import executeQuery from '@/utils/dbUtils';
import { getServerSession } from "next-auth";
import { redirect } from 'next/navigation';
import ContactsList from '@/components/ContactsList';
import {RowDataPacket} from "mysql2";
import {authOptions} from "@/app/api/auth/[...nextauth]/config";

export interface Contact extends RowDataPacket {
    id: string;
    linkedinUser: string;
    name: string | null;
    statusId: number | null;
    note: string | null;
    tags: [] | null;
    notesCount: number;
    pictureUrl: string | null;
}

interface Status extends RowDataPacket {
    id: number;
    name: string;
}

async function getContacts(userId: string, page: number, searchTerm: string = ""): Promise<Contact[]> {
    const pageSize = 21;
    const offset = (page - 1) * pageSize;
    let query = `
        SELECT
            d.*,
            (SELECT COUNT(*) FROM notes n WHERE n.linkedinDataId = d.id AND n.userId = d.userId) as notesCount
        FROM contacts d
        WHERE d.userId = ?
    `;
    const params: any[] = [userId];

    if (searchTerm) {
        query += ` AND (d.linkedinUser LIKE ? OR d.name LIKE ?)`;
        params.push(`%${searchTerm}%`, `%${searchTerm}%`);
    }

    query += ` ORDER BY d.linkedinUser ASC LIMIT ? OFFSET ?`;
    params.push(pageSize, offset);

    const contacts = await executeQuery<Contact>(query, params);
    return contacts as Contact[];
}

async function getStatuses(userId: string): Promise<Status[]> {
    const statuses = await executeQuery<Status>('SELECT * FROM statuses WHERE userId = ?', [userId]);
    return statuses as Status[];
}

async function getTotalContactsCount(userId: string, searchTerm: string = ""): Promise<number> {
    let query = `SELECT COUNT(*) as total FROM contacts WHERE userId = ?`;
    const params: any[] = [userId];

     if (searchTerm) {
        query += ` AND (linkedinUser LIKE ? OR name LIKE ?)`;
        params.push(`%${searchTerm}%`, `%${searchTerm}%`);
    }

    const result = await executeQuery(query, params);
    return result[0]?.total || 0;
}

interface UserSession {
    id: string;
}

export default async function PeoplePage({ searchParams }: { searchParams: Promise<{ page?: string, search?: string }> }) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/api/auth/signin');
    }

    const userId = (session.user as UserSession).id;
    const page = parseInt((await searchParams)?.page || '1', 10);
    const searchTerm = (await searchParams)?.search || "";
    const contacts = await getContacts(userId, page, searchTerm);
    const statuses = await getStatuses(userId);
    const totalContactsCount = await getTotalContactsCount(userId, searchTerm);
    const totalPages = Math.ceil(totalContactsCount / 10);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Contacts</h1>
            <ContactsList
                contacts={contacts}
                statuses={statuses}
                totalPages={totalPages}
                searchTerm={searchTerm}
                page={page}
            />
        </div>
    );
}
