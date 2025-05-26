const MessageSkeleton = () => {
  const skeletonMessages = Array(6).fill(null);

  return (
    <div className="overflow-y-auto p-4 space-y-6 no-scrollbar">
      {skeletonMessages.map((_, idx) => {
        const isSender = idx % 2 !== 0;
        return (
          <div
            key={idx}
            className={`flex items-end gap-3 ${
              isSender ? "justify-end" : "justify-start"
            }`}
          >
            {/* Avatar */}
            {!isSender && (
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gray-300 animate-pulse" />
              </div>
            )}

            {/* Message block */}
            <div className="flex flex-col space-y-2">
              {/* Sender name */}
              <div
                className={`h-4 w-20 bg-gray-300 rounded animate-pulse ${
                  isSender ? "self-end" : "self-start"
                }`}
              />

              {/* Bubble */}
              <div
                className={`rounded-lg bg-gray-300 animate-pulse ${
                  isSender ? "self-end" : "self-start"
                }`}
              >
                <div className="w-[180px] h-16" />
              </div>
            </div>

            {/* Avatar for sender (optional) */}
            {isSender && (
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gray-300 animate-pulse" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MessageSkeleton;
