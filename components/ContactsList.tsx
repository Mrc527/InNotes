"use client";

import { useState } from 'react';
import {Contact} from "@/app/dashboard/contacts/page";
import Link from "next/link";
import {
    Button,
    Text,
    Flex,
    Grid,
    Card,
} from '@radix-ui/themes';
import {Input} from "@/components/input";
import styles from './ContactsList.module.css'; // Import the CSS module

interface Status {
    id: number;
    name: string;
}

interface ContactsListProps {
    contacts: Contact[];
    statuses: Status[];
    totalPages: number;
    searchTerm: string;
    page: number;
}

function ContactCard({contact, statuses}: { contact: Contact, statuses: Status[] }) {
    const status = statuses.find(s => s.id === contact.statusId);
    const statusName = status ? status.name : 'No Status';
    const tags = contact.tags ? contact.tags : [];

    const displayName = contact.name
      ? contact.name
      : contact.linkedinUser;

    const initials = displayName
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();

    return (
      <Link href={`/dashboard/contacts/${contact.id}`}>
          <Card className="block flex items-center">
              {contact.pictureUrl ? (
                <img
                  src={contact.pictureUrl}
                  alt={`${displayName}'s profile picture`}
                  className="w-12 h-12 rounded-full mr-4"
                />
              ) : (
                <Flex
                  className="w-12 h-12 rounded-full mr-4"
                  style={{backgroundColor: 'gray', alignItems: 'center', justifyContent: 'center'}}
                >
                    <Text color="gray" weight="bold">{initials}</Text>
                </Flex>
              )}
              <Flex direction="column">
                  <Text size="2" weight="bold">{displayName}</Text>
                  <Text size="1" color="gray">Status: {statusName}</Text>
                  <Text size="1" color="gray">Tags: {tags.join(', ')}</Text>
                    <Text size="1" color="gray">Notes: {contact.notesCount}</Text>
                </Flex>
            </Card>
        </Link>
    );
}

export default function ContactsList({ contacts, statuses, totalPages, searchTerm, page }: ContactsListProps) {
    const [search, setSearch] = useState(searchTerm);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    };

    const handleSearchClick = () => {
        window.location.assign(`/dashboard/contacts?page=1&search=${search}`);
    };

    const handlePageClick = (pageNumber: number) => {
        window.location.assign(`/dashboard/contacts?page=${pageNumber}&search=${search}`);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearchClick();
        }
    };

    return (
        <div>
            <Flex mb="4" align="center">
                <Input
                    placeholder="Search by name..."
                    value={search}
                    onChange={handleSearchChange}
                    onKeyDown={handleKeyDown}
                />
                <Button ml="2" onClick={handleSearchClick}>
                    Search
                </Button>
            </Flex>

            <Grid columns="3" gap="4" className={styles.contactGrid}>
                {contacts.map((contact) => (
                    <ContactCard key={contact.id} contact={contact} statuses={statuses} />
                ))}
            </Grid>

            <Flex justify="center" mt="4">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                    <Button
                        key={pageNumber}
                        variant={pageNumber === page ? 'solid' : 'soft'}
                        onClick={() => handlePageClick(pageNumber)}
                    >
                        {pageNumber}
                    </Button>
                ))}
            </Flex>
        </div>
    );
}
