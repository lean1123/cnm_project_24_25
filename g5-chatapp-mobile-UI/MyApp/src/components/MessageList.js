import React, { useRef, useEffect } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import MessageItem from './MessageItem';

const MessageList = ({ messages, userId, onEndReached }) => {
  const flatListRef = useRef(null);

  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: true });
    }
  }, [messages]);

  const renderMessage = ({ item }) => {
    const isOwnMessage = item.sender?.userId === userId;
    return (
      <MessageItem
        message={item}
        isOwnMessage={isOwnMessage}
        userId={userId}
      />
    );
  };

  const keyExtractor = (item) => {
    return item?._id?.toString() || Math.random().toString();
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={keyExtractor}
        inverted
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
          autoscrollToTopThreshold: 10
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  listContent: {
    paddingVertical: 10,
  },
});

export default MessageList; 