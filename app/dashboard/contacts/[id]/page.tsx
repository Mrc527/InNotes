// app/dashboard/contacts/[id]/page.tsx
import executeQuery from '@/utils/dbUtils';
import { getServerSession } from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/config";
import { redirect } from 'next/navigation';
import {Contact} from "@/app/dashboard/contacts/page";

interface Status {
    id: number;
    name: string;
}

interface Note {
    id: string;
    text: string;
    creationDate: Date;
}

async function getContact(userId: string, id: string): Promise<Contact | null> {
    const query = `
        SELECT
            d.*,
            (SELECT COUNT(*) FROM notes n WHERE n.linkedinDataId = d.id AND n.userId = d.userId) as notesCount
        FROM contacts d
        WHERE d.userId = ? AND d.id = ?
    `;
    const params: any[] = [userId, id];
    const contacts = await executeQuery(query, params);
    return contacts[0] as Contact || null;
}

async function getStatuses(userId: string): Promise<Status[]> {
    const statuses = await executeQuery('SELECT * FROM statuses WHERE userId = ?', [userId]);
    return statuses as Status[];
}

async function getNotes(userId: string, linkedinDataId: string): Promise<Note[]> {
    const query = `SELECT * FROM notes WHERE userId = ? AND linkedinDataId = ? ORDER BY creationDate DESC`;
    const params: any[] = [userId, linkedinDataId];
    const notes = await executeQuery(query, params);
    return notes as Note[];
}

interface UserSession {
    id: string;
}

export default async function ContactPage({params}: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/api/auth/signin');
    }

    const userId = (session.user as UserSession).id;
    const contactId = (await params).id;
    const contact = await getContact(userId, contactId);

    if (!contact) {
        return <div>Contact not found</div>;
    }

    const statuses = await getStatuses(userId);
    const status = statuses.find(s => s.id === contact.statusId);
    const statusName = status ? status.name : 'No Status';
    const tags = contact.tags ? contact.tags : [];
    const notes = await getNotes(userId, contactId);


    return (
        <div className="p-4">
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Contact: {contact.linkedinUser}</h1>

            <div className="rounded-md bg-white dark:bg-gray-800 shadow-md p-4 mb-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Information</h2>
                <p className="text-gray-600 dark:text-gray-400">Status: {statusName}</p>
                <p className="text-gray-600 dark:text-gray-400">Tags: {tags.join(', ')}</p>
            </div>

            <div className="rounded-md bg-white dark:bg-gray-800 shadow-md p-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Notes</h2>
                {notes.length > 0 ? (
                    <ul>
                        {notes.map((note) => (
                            <li key={note.id} className="py-2 border-b border-gray-200 dark:border-gray-700">
                                <p className="text-gray-800 dark:text-gray-200">{decodeURIComponent(note.text)}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Created at: {note.creationDate.toDateString()}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-600 dark:text-gray-400">No notes found.</p>
                )}
            </div>
        </div>
    );
}
