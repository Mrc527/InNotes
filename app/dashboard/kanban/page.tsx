import executeQuery from '@/utils/dbUtils';
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";
import {redirect} from "next/navigation";

async function getProfile(id: string) {
    const users = await executeQuery('SELECT * FROM users where id=?', [id]);
    return users[0];
}
async function getLinkedInData(userId: string) {
    return await executeQuery('SELECT * FROM data WHERE userId = ?', [userId]);
}

async function getStatuses(userId: string) {
    return await executeQuery('SELECT * FROM statuses WHERE userId = ?', [userId]);
}

interface LinkedInData {
    id: string;
    linkedinUser: string;
    statusId: number | null;
    // ... other fields
}

interface Status {
    id: number;
    name: string;
}
interface UserSession {
    id: string;
}

export default async function KanbanPage() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect('/api/auth/signin');
    }

    const userId = (session.user as UserSession).id;
    const profile = await getProfile(userId);
    const linkedInData: LinkedInData[] = await getLinkedInData(userId);
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

            <div className="flex overflow-x-auto">
                {statusNames.map((statusName) => (
                    <div key={statusName} className="w-80 p-2 mr-4 rounded-md bg-gray-100 dark:bg-gray-800 shadow">
                        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">{statusName}</h2>
                        {kanbanData[statusName].map((item) => (
                            <div key={item.id} className="p-3 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 mb-2 shadow-sm">
                                {item.linkedinUser}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
