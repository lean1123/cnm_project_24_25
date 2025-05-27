import React, { useEffect, useState } from "react";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { getSocket } from "@/lib/socket";
import Cookies from "js-cookie";

const LoginQRCode = () => {
  const { generateQRCode, setUser, setIsAuthenticated } = useAuthStore();
  const [sessionId, setSessionId] = useState("");
  const [qrData, setQrData] = useState("");
  const [waitingTime, setWaitingTime] = useState(0);
  const socket = getSocket();
  const navigate = useNavigate();
  useEffect(() => {
    if (!socket) return;
    console.log("Socket connected:", socket.id);

    socket.on("logInResult", (data) => {
      console.log("Login result received:", data);
      Cookies.set("accessToken", data.token, {
        expires: 1,
        secure: true,
        sameSite: "Strict",
      });
      setUser(data.user);
      setIsAuthenticated(true);
      navigate("/");
    });

    return () => {
      socket.off("logInResult");
    };
  }, [socket, navigate]);

  const fetchData = async () => {
    const data = await generateQRCode();
    setSessionId(data.sessionId);
    setQrData(data.qrData);

    socket.emit("join-qr-room", {
      sessionId: data.sessionId,
    });
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      setWaitingTime((prev) => prev + 1);
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  const handleFormatWaitingTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes} phút ${seconds} giây`;
  };

  return (
    <div className="flex flex-col items-center gap-2 justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Quét QR để đăng nhập</h1>
      {300 - waitingTime <= 0 ? (
        <>
          <p className="text-red-500 mb-4">
            Thời gian chờ đã hết. Vui lòng làm mới trang để tạo mã QR mới.
          </p>
          <Button
            onClick={() => {
              window.location.reload();
            }}
          >
            Làm mới trang
          </Button>
        </>
      ) : (
        <p className="text-gray-600 mb-4">
          Vui lòng quét mã QR bằng ứng dụng để đăng nhập. Thời gian chờ:{" "}
          {handleFormatWaitingTime(300 - waitingTime)}
        </p>
      )}
      {qrData && (
        <QRCodeCanvas
          value={qrData}
          size={256}
          bgColor="#ffffff"
          fgColor="#000000"
          //   level="H"
          //   includeMargin={true}
        />
      )}
      <Button
        onClick={() => {
          navigate("/login");
        }}
      >
        Trờ về
      </Button>
    </div>
  );
};

export default LoginQRCode;
