import { Avatar, AvatarBadge, Flex, IconButton, ListItem, Text, useDisclosure } from '@chakra-ui/react';
import React from 'react';
import { FaEllipsisV } from 'react-icons/fa';
import { useHistory } from 'react-router-dom';
import { useQueryClient } from 'react-query';
import { DMChannel, Member } from '../../lib/api/models';
import { getOrCreateDirectMessage } from '../../lib/api/handler/dm';
import { RemoveFriendModal } from '../modals/RemoveFriendModal';
import { dmKey } from '../../lib/utils/querykeys';

interface FriendsListItemProp {
  friend: Member;
}

export const FriendsListItem: React.FC<FriendsListItemProp> = ({ friend }) => {
  const history = useHistory();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cache = useQueryClient();

  const getDMChannel = async (): Promise<void> => {
    try {
      const { data } = await getOrCreateDirectMessage(friend.id);
      if (data) {
        cache.setQueryData<DMChannel[]>(dmKey, (d) => {
          const queryData = d ?? [];
          const index = queryData.findIndex((dm) => dm.id === data.id);
          if (index === -1) return [data, ...queryData];
          return queryData;
        });
        history.push(`/channels/me/${data.id}`);
      }
    } catch (err) {}
  };

  return (
    <ListItem
      p="3"
      mx="3"
      _hover={{
        bg: 'brandGray.dark',
        borderRadius: '5px',
      }}
    >
      <Flex align="center" justify="space-between">
        <Flex align="center" w="full" onClick={getDMChannel} _hover={{ cursor: 'pointer' }}>
          <Avatar size="sm" src={friend.image}>
            <AvatarBadge boxSize="1.25em" bg={friend.isOnline ? 'green.500' : 'gray.500'} />
          </Avatar>
          <Text ml="2">{friend.username}</Text>
        </Flex>
        <IconButton
          icon={<FaEllipsisV />}
          borderRadius="50%"
          aria-label="remove friend"
          onClick={(e) => {
            e.preventDefault();
            onOpen();
          }}
        />
      </Flex>
      {isOpen && <RemoveFriendModal member={friend} isOpen onClose={onClose} />}
    </ListItem>
  );
};
