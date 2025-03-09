// app/dashboard/page.tsx
import { getServerSession } from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/config";
import { redirect } from 'next/navigation';
import executeQuery from '@/utils/dbUtils';

async function getProfile(id: string) {
    const users = await executeQuery('SELECT * FROM users where id=?', [id]);
    return users[0];
}

async function getLinkedInData() {
    const data = await executeQuery('SELECT * FROM contacts LIMIT 5', []);
    return data;
}

async function getNotes() {
    const notes = await executeQuery('SELECT * FROM notes LIMIT 5', []);
    return notes;
}
interface UserSession {
  id: string;
}
export default async function Dashboard() {
    const session = await getServerSession(authOptions);

    if (!session) {
      const callbackUrl = encodeURIComponent(process.env.NEXT_PUBLIC_URL + "/dashboard");
      redirect(`/api/auth/signin?callbackUrl=${callbackUrl}`);
    }
    const profile = await getProfile((session.user as UserSession).id);
    const linkedInData = await getLinkedInData();
    const notes = await getNotes();

    return (
        <>
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Dashboard</h1>

            <section className="mt-4">
                <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Profile</h2>
                <pre className="bg-white dark:bg-gray-800 rounded-md p-2 overflow-auto text-gray-800 dark:text-gray-200">{JSON.stringify(profile, null, 2)}</pre>
            </section>

            <section className="mt-4">
                <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">LinkedIn Data</h2>
                <pre className="bg-white dark:bg-gray-800 rounded-md p-2 overflow-auto text-gray-800 dark:text-gray-200">{JSON.stringify(linkedInData, null, 2)}</pre>
            </section>

            <section className="mt-4">
                <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Notes</h2>
                <pre className="bg-white dark:bg-gray-800 rounded-md p-2 overflow-auto text-gray-800 dark:text-gray-200">{JSON.stringify(notes, null, 2)}</pre>
            </section>

            <p className="text-gray-600 dark:text-gray-400 mt-4">Signed in as {session?.user?.email}</p>
        </>
    );
}
