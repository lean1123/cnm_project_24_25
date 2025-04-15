import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { useCallStore } from "@/store/useCallStore";
import { Minus } from "lucide-react";

interface RingCallProps {
  showRingCall: boolean;
  setShowRingCall: (value: boolean) => void;
}

function RingCall({ showRingCall, setShowRingCall }: RingCallProps) {
  // listen call
  const { ongoingCall, handleAcceptCall, handleRejectCall } = useCallStore();

  if (!ongoingCall?.isRinging) return null;
  return (
    <div
      className={`${
        showRingCall ? "" : "hidden"
      } absolute card flex flex-col z-20 w-60 border bg-primary border-base-300 rounded-md h-72 bottom-16 right-1 shadow-sm shadow-slate-800`}
    >
      <button className="flex items-center w-full justify-end px-2">
        <Minus
          className="size-8 font-thin cursor-pointer"
          onClick={() => setShowRingCall(false)}
        />
      </button>
      <div className="flex flex-col grow items-center justify-around w-full py-4">
        <h1 className="text-lg font-semibold">Incoming call</h1>
        {/* <img
          src="/avatar.png "
          alt="profile"
          className="w-20 h-20 rounded-full"
        /> */}
        <Avatar>
            <AvatarImage src={ongoingCall.sender.avatar || "/avatar.png"} alt="profile" />
        </Avatar>
        <h3 className="text-lg font-semibold">
          {ongoingCall?.sender?.firstName || "NO"}
        </h3>
        <div className="flex items-center justify-evenly gap-4 w-full mt-4">
          <button
            className="bg-red-500 p-2 rounded-full"
            // onClick={() =>
            //   handleHangup({
            //     ongoingCall: ongoingCall ? ongoingCall : undefined,
            //     isEmitHangup: true,
            //   })
            // }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <button
            className="bg-green-500 p-2 rounded-full"
            onClick={() => handleAcceptCall(ongoingCall.sender._id!)}
          >
            <svg
              xmlns="http://www.w3.org/
                2000/svg"
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default RingCall;
