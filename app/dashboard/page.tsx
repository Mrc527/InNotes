import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/config";
import {redirect} from 'next/navigation';
import executeQuery from '@/utils/dbUtils';
import {Container, Heading, Text,} from '@radix-ui/themes';
import '@radix-ui/themes/styles.css';

export default async function Dashboard() {
    const session = await getServerSession(authOptions);

    if (!session) {
        const callbackUrl = encodeURIComponent(process.env.NEXT_PUBLIC_URL + "/dashboard");
        redirect(`/api/auth/signin?callbackUrl=${callbackUrl}`);
    }


    return (
        <Container>
            <Heading as="h1" size="2">Dashboard</Heading>
            <Text mt="4" color="gray">Signed in as {session?.user?.email}</Text>
        </Container>
    );
}
