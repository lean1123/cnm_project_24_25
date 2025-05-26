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
  }, []);

  return (
    <div className="flex flex-col items-center gap-2 justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Quét QR để đăng nhập</h1>
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
