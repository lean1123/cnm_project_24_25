import React, { useEffect, useState } from "react";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { getSocket } from "@/lib/socket";

const LoginQRCode = () => {
  const { generateQRCode } = useAuthStore();
  const [sessionId, setSessionId] = useState("");
  const [qrData, setQrData] = useState("");

  const fetchData = async () => {
    const data = await generateQRCode();
    setSessionId(data.sessionId);
    setQrData(data.qrData);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const navigate = useNavigate();

  const socket = getSocket();
  useEffect(() => {
    if (!socket) return;
    console.log("Socket connected:", socket.id);

    socket.on("qrCodeData", (data) => {
      console.log("Received QR code data:", data);
      setSessionId(data.sessionId);
      setQrData(data.qrData);
    });

    socket.on("loginSuccess", (data) => {
      console.log("Login successful:", data);
      navigate("/chat");
    });

    socket.on("loginError", (error) => {
      console.error("Login error:", error);
      alert("Đăng nhập thất bại. Vui lòng thử lại.");
    });

    return () => {
      socket.off("qrCodeData");
      socket.off("loginSuccess");
      socket.off("loginError");
    };
  }, [socket, navigate]);

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
