import React from 'react';
import { Flex, Text } from '@radix-ui/themes';

export const getInitialsPlaceholder = (displayName: string, className: string) => {
    const initials = displayName
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase();

    return (
        <Flex
            className={className}
            style={{ backgroundColor: 'gray', alignItems: 'center', justifyContent: 'center' }}
        >
            <Text color="gray" weight="bold">{initials}</Text>
        </Flex>
    );
};
