// app/dashboard/people/page.tsx
import executeQuery from '@/utils/dbUtils';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from 'next/navigation';
import ContactsList from '@/components/ContactsList';

export interface Contact {
    id: string;
    linkedinUser: string;
    statusId: number | null;
    note: string | null;
    tags: [] | null;
    notesCount: number;
}

interface Status {
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
        FROM data d
        WHERE d.userId = ?
    `;
    const params: any[] = [userId];

    if (searchTerm) {
        query += ` AND d.linkedinUser LIKE ?`;
        params.push(`%${searchTerm}%`);
    }

    query += ` ORDER BY d.linkedinUser ASC LIMIT ? OFFSET ?`;
    params.push(pageSize, offset);

    const contacts = await executeQuery(query, params);
    return contacts as Contact[];
}

async function getStatuses(userId: string): Promise<Status[]> {
    const statuses = await executeQuery('SELECT * FROM statuses WHERE userId = ?', [userId]);
    return statuses as Status[];
}

async function getTotalContactsCount(userId: string, searchTerm: string = ""): Promise<number> {
    let query = `SELECT COUNT(*) as total FROM data WHERE userId = ?`;
    const params: any[] = [userId];

    if (searchTerm) {
        query += ` AND linkedinUser LIKE ?`;
        params.push(`%${searchTerm}%`);
    }

    const result = await executeQuery(query, params);
    return result[0]?.total || 0;
}

interface UserSession {
    id: string;
}

export default async function PeoplePage({ searchParams }: { searchParams: { page?: string, search?: string } }) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/api/auth/signin');
    }

    const userId = (session.user as UserSession).id;
    const page = parseInt(searchParams?.page || '1', 10);
    const searchTerm = searchParams?.search || "";
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
