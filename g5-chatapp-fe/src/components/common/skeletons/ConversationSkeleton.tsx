const ConversationSkeleton = () => {
  const skeletonsContacts = Array(8).fill(null);
  return (
    <div className="h-full w-full lg:w-72  flex flex-col transition-all duration-200">
      {/* skeleton contacts */}
      <div className="overflow-y-auto w-full py-1">
        {skeletonsContacts.map((_, index) => (
          <div key={index} className="w-full py-3 flex items-center gap-3">
            {/* avatar skeleton */}
            <div className="relative mx-auto lg:mx-0">
              <div className="skeleton size-12 rounded-full" />
            </div>
            {/* user info skeleton - only visible on larger screens */}
            <div className="lg:block text-left min-w-0 flex-1">
              <div className="skeleton h-4 w-3/4 mb-2"></div>
              <div className="skeleton h-3 w-1/6"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConversationSkeleton;
