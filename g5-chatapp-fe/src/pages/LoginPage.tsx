import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { getSocket } from "@/lib/socket";
import { useAuthStore } from "@/store/useAuthStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { QrCodeIcon } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

type Props = {};

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" })
    .regex(/[a-zA-Z0-9]/, { message: "Password must be alphanumeric" }),
});

function LoginPage({}: Props) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { login, isLogging } = useAuthStore();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const result = await login(values);
      if (result) {
        toast.success("Đăng nhập thành công!");
        // setTimeout(() => {
        //   router.push("/conversations");
        // }, 1000);
      } else {
        toast.error("Đăng nhập thất bại, vui lòng kiểm tra lại thông tin.");
        return;
      }
    } catch (err) {
      toast.error("Đăng nhập thất bại, vui lòng thử lại sau.");
      return;
    }
  }

  const navigate = useNavigate();

  const socket = getSocket();
  useEffect(() => {
    if (!socket) return;
    console.log("Socket connected:", socket.id);

    return () => {
      socket.off("qrCodeData");
      socket.off("loginSuccess");
      socket.off("loginError");
    };
  }, [socket, navigate]);

  return (
    <div className="flex flex-col min-h-[50vh] h-full w-full items-center justify-center px-4">
      <Card className="mx-auto max-w-sm min-w-96">
        <CardHeader>
          <CardTitle className="text-2xl">Đăng nhập</CardTitle>
          <CardDescription>
            Nhập thông tin đăng nhập của bạn để tiếp tục
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <FormLabel htmlFor="email">Email</FormLabel>
                      <FormControl>
                        <Input
                          id="email"
                          placeholder="johndoe@mail.com"
                          type="email"
                          // autoComplete="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <div className="flex justify-between items-center">
                        <FormLabel htmlFor="password">Mật khẩu</FormLabel>
                        <Link
                          to="/forgot-password"
                          className="ml-auto inline-block text-sm underline"
                        >
                          Quên mật khẩu?
                        </Link>
                      </div>
                      <FormControl>
                        <Input
                          type="password"
                          id="password"
                          placeholder="******"
                          // autoComplete="current-password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="`w-full" disabled={isLogging}>
                  Đăng nhập
                </Button>
                {/* <Button variant="outline" className="w-full">
                  Login with Google
                </Button> */}
              </div>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            <Button
              type="button"
              variant={"outline"}
              className="w-full"
              onClick={() => {
                navigate("/login-qr");
              }}
            >
              <QrCodeIcon className="mr-2 h-4 w-4" />
              Đăng nhập bằng QR Code
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Bạn không có tài khoản?{" "}
            <Link to="/register" className="underline">
              Đăng ký ngay
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default LoginPage;
