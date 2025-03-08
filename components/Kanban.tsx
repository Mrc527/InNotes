"use client";

import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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

interface KanbanProps {
    linkedInData: LinkedInData[];
    statuses: Status[];
    kanbanData: { [key: string]: LinkedInData[] };
    statusNames: string[];
    statusMap: { [key: number]: string };
    username: string | null;
    password: string | null;
}

export default function Kanban({
    linkedInData,
    statuses,
    kanbanData,
    statusNames,
    statusMap,
    username,
    password,
}: KanbanProps) {
    const router = useRouter();

    const updateLinkedInDataStatus = async (id: string, statusId: number | null, username: string, password: string) => {
        const response = await fetch(`/api/contacts/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'username': username,
                'password': password,
            },
            body: JSON.stringify({ statusId: statusId }),
        });

        if (!response.ok) {
            console.error('Failed to update status');
        }
    };

    const onDragEnd = async (result: any) => {
        const { destination, source, draggableId } = result;

        if (!destination) {
            return;
        }

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        const startStatusName = source.droppableId;
        const endStatusName = destination.droppableId;

        if (startStatusName === endStatusName) {
            return;
        }

        const draggedItem = linkedInData.find(item => item.id === draggableId);
        if (!draggedItem) return;

        let newStatusId: number | null = null;
        const destinationStatus = statuses.find(status => status.name === endStatusName);
        if (destinationStatus) {
            newStatusId = destinationStatus.id;
        }

        if (username && password) {
            await updateLinkedInDataStatus(draggableId, newStatusId, username, password);
        } else {
            console.error("Username or password not available for updating status");
            return;
        }

        router.refresh();
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex overflow-x-auto">
                {statusNames.map((statusName) => (
                    <Droppable droppableId={statusName} key={statusName} isDropDisabled={false} isCombineEnabled={true} ignoreContainerClipping={false}>
                        {(provided, snapshot) => (
                            <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className="w-80 p-2 mr-4 rounded-md bg-gray-100 dark:bg-gray-800 shadow"
                            >
                                <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">{statusName}</h2>
                                {kanbanData[statusName]?.map((item, index) => (
                                    <Draggable key={item.id} draggableId={item.id} index={index}>
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                className="p-3 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 mb-2 shadow-sm"
                                            >
                                                <Link href={`/dashboard/contacts/${item.id}`}>
                                                    {item.linkedinUser}
                                                </Link>
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                ))}
            </div>
        </DragDropContext>
    );
}
