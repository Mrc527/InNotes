import executeQuery from '@/utils/dbUtils';
import { getServerSession } from "next-auth";
import { redirect } from 'next/navigation';
import ContactsList from '@/components/ContactsList';
import {RowDataPacket} from "mysql2";
import {authOptions} from "@/app/api/auth/[...nextauth]/config";
import {
    Heading,
    Container
} from '@radix-ui/themes';
import '@radix-ui/themes/styles.css';

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
const pageSize = 21;
async function getContacts(userId: string, page: number, searchTerm: string = ""): Promise<Contact[]> {
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
        const callbackUrl = encodeURIComponent(process.env.NEXT_PUBLIC_URL + "/dashboard/contacts");
        redirect(`/api/auth/signin?callbackUrl=${callbackUrl}`);
    }

    const userId = (session.user as UserSession).id;
    const page = parseInt((await searchParams)?.page || '1', 10);
    const searchTerm = (await searchParams)?.search || "";
    const contacts = await getContacts(userId, page, searchTerm);
    const statuses = await getStatuses(userId);
    const totalContactsCount = await getTotalContactsCount(userId, searchTerm);
    const totalPages = Math.ceil(totalContactsCount / pageSize);

    return (
        <Container>
            <Heading as="h1" size="2">Contacts</Heading>
            <ContactsList
                contacts={contacts}
                statuses={statuses}
                totalPages={totalPages}
                searchTerm={searchTerm}
                page={page}
            />
        </Container>
    );
}
