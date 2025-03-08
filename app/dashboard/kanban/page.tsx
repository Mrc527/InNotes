import executeQuery from '@/utils/dbUtils';
import {getServerSession } from "next-auth";
import {authOptions } from "@/app/api/auth/[...nextauth]/route";
import {redirect, useRouter} from "next/navigation";
import Kanban from "@/components/Kanban";
import {RowDataPacket} from "mysql2";

async function getProfile(id: string) {
    const users = await executeQuery('SELECT * FROM users where id=?', [id]);
    return users[0];
}

interface LinkedInData extends RowDataPacket {
    id: string;
    linkedinUser: string;
    name: string | null;
    statusId: number | null;
    note: string | null;
    tags: string | null;
    notesCount: number;
    pictureUrl: string | null;
}

async function getLinkedInData(userId: string, searchTerm: string = ""): Promise<LinkedInData[]> {
    let query = `SELECT * FROM contacts WHERE userId = ?`;
    const params: any[] = [userId];

    if (searchTerm) {
        query += ` AND (linkedinUser LIKE ? OR name LIKE ?)`;
        params.push(`%${searchTerm}%`, `%${searchTerm}%`);
    }

    const data = await executeQuery<LinkedInData>(query, params);
    return data;
}

interface Status extends RowDataPacket {
    id: number;
    name: string;
}

async function getStatuses(userId: string): Promise<Status[]> {
    const statuses = await executeQuery<Status>('SELECT * FROM statuses WHERE userId = ?', [userId]);
    return statuses;
}

interface UserSession {
    id: string;
}

export default async function KanbanPage({ searchParams }: { searchParams: { search?: string } }) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect('/api/auth/signin');
    }

    const userId = (session.user as UserSession).id;
    const profile = await getProfile(userId);
    const searchTerm = searchParams?.search || "";
    const linkedInData: LinkedInData[] = await getLinkedInData(userId, searchTerm);
    const statuses: Status[] = await getStatuses(userId);

    // Create a map of statusId to status name
    const statusMap: { [key: number]: string } = statuses.reduce((acc: { [key: number]: string }, status) => {
        acc[status.id] = status.name;
        return acc;
    }, {});

    // Group data by status
    const kanbanData = linkedInData.reduce((acc: { [key: string]: LinkedInData[] }, item) => {
        const statusId = item.statusId || -1;
        const statusName = statusMap[statusId] || 'No Status'; // Default status
        if (!acc[statusName]) {
            acc[statusName] = [];
        }
        acc[statusName].push(item);
        return acc;
    }, {});

    // Add statuses with no data
    statuses.forEach(status => {
        if (!kanbanData[status.name]) {
            kanbanData[status.name] = [];
        }
    });

    let statusNames = Object.keys(kanbanData);

    statusNames = statusNames.sort((a, b) => {
        if (a === 'No Status') return 1;
        if (b === 'No Status') return -1;
        return a.localeCompare(b);
    });

    return (
        <div className="p-4">
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Kanban Board</h1>
            <Kanban
                linkedInData={linkedInData}
                statuses={statuses}
                kanbanData={kanbanData}
                statusNames={statusNames}
                statusMap={statusMap}
                username={profile.username}
                password={profile.password}
                searchTerm={searchTerm}
            />
        </div>
    );
}
