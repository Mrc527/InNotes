"use client";

import { useState } from 'react';
import {Contact} from "@/app/dashboard/contacts/page";
import Link from "next/link";

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

function ContactCard({ contact, statuses }: { contact: Contact, statuses: Status[] }) {
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
        <Link href={`/dashboard/contacts/${contact.id}`} className="rounded-md bg-white dark:bg-gray-800 shadow-md p-4 block flex items-center">
            {contact.pictureUrl ? (
                <img
                    src={contact.pictureUrl}
                    alt={`${displayName}'s profile picture`}
                    className="w-12 h-12 rounded-full mr-4"
                />
            ) : (
                <div className="w-12 h-12 rounded-full mr-4 bg-gray-400 dark:bg-gray-600 text-white flex items-center justify-center font-semibold">
                    {initials}
                </div>
            )}
            <div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">{displayName}</h2>
                <p className="text-gray-600 dark:text-gray-400">Status: {statusName}</p>
                <p className="text-gray-600 dark:text-gray-400">Tags: {tags.join(', ')}</p>
                <p className="text-gray-600 dark:text-gray-400">Notes: {contact.notesCount}</p>
            </div>
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
            <div className="mb-4 flex">
                <input
                    type="text"
                    placeholder="Search by name..."
                    className="w-full p-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                    value={search}
                    onChange={handleSearchChange}
                    onKeyDown={handleKeyDown}
                />
                <button
                    className="ml-2 px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-700"
                    onClick={handleSearchClick}
                >
                    Search
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {contacts.map((contact) => (
                    <ContactCard key={contact.id} contact={contact} statuses={statuses} />
                ))}
            </div>

            <div className="flex justify-center mt-4">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                    <button
                        key={pageNumber}
                        className={`mx-1 px-3 py-1 rounded-md ${pageNumber === page ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-blue-300 dark:hover:bg-blue-700'}`}
                        onClick={() => handlePageClick(pageNumber)}
                    >
                        {pageNumber}
                    </button>
                ))}
            </div>
        </div>
    );
}
