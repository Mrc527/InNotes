import { getServerSession } from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/config";
import { redirect } from 'next/navigation';
import executeQuery from '@/utils/dbUtils';
import {
  Text,
  Heading,
  Container,
  Section, Card,
} from '@radix-ui/themes';
import '@radix-ui/themes/styles.css';

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
        <Container>
            <Heading as="h1" size="2">Dashboard</Heading>

            <Section mt="4">
                <Heading as="h2" size="1">Profile</Heading>
                <Card variant="soft" style={{ overflowX: 'auto' }}>
                    <Text>{JSON.stringify(profile, null, 2)}</Text>
                </Card>
            </Section>

            <Section mt="4">
                <Heading as="h2" size="1">LinkedIn Data</Heading>
                <Card variant="soft" style={{ overflowX: 'auto' }}>
                    <Text>{JSON.stringify(linkedInData, null, 2)}</Text>
                </Card>
            </Section>

            <Section mt="4">
                <Heading as="h2" size="1">Notes</Heading>
                <Card variant="soft" style={{ overflowX: 'auto' }}>
                    <Text>{JSON.stringify(notes, null, 2)}</Text>
                </Card>
            </Section>

            <Text mt="4" color="gray">Signed in as {session?.user?.email}</Text>
        </Container>
    );
}
