"use client";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CirclePlus,
  File,
  FormInput,
  Image,
  SendHorizonal,
  X,
} from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import TextareaAutosize from "react-textarea-autosize";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {};

const chatMessageSchema = z.object({
  content: z.string().min(1, "Message must be at least 1 character long"),
});

const ChatInput = (props: Props) => {
  const form = useForm<z.infer<typeof chatMessageSchema>>({
    resolver: zodResolver(chatMessageSchema),
    defaultValues: {
      content: "",
    },
  });

  const handleSubmit = (data: z.infer<typeof chatMessageSchema>) => {
    console.log(data);
  };

  const handleInputChange = (event: any) => {
    const { value, selectionStart } = event.target;
    if (selectionStart !== null) {
      form.setValue("content", value);
    }
  };

  const [isOpenOptions, setIsOpenOptions] = React.useState(false);
  return (
    <Card className="w-full p-2 rounded-lg relative flex flex-col gap-2">
      <div
        className={cn(
          "flex justify-between border-b pb-1",
          isOpenOptions ? "" : "hidden"
        )}
      >
        <div className="flex gap-2">
          <Button disabled={false} size={"icon"} type="button">
            <File />
          </Button>
          <Button disabled={false} size={"icon"} type="button">
            <Image />
          </Button>
        </div>
        <div>
          <Button
            disabled={false}
            size={"icon"}
            type="button"
            variant={"outline"}
            onClick={() => setIsOpenOptions(false)}
          >
            <X />
          </Button>
        </div>
      </div>
      <div className="flex gap-2 items-end w-full">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex gap-2 items-end w-full"
          >
            {/* tạo dialog cho chọn option như file, hình ảnh */}
            <Button
              disabled={isOpenOptions}
              size={"icon"}
              type="button"
              onClick={() => setIsOpenOptions(!isOpenOptions)}
              className={cn("", isOpenOptions ? "hidden" : "")}
            >
              <CirclePlus />
            </Button>
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => {
                return (
                  <FormItem className="h-full w-full">
                    <FormControl>
                      <TextareaAutosize
                        onKeyDown={async (e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            await form.handleSubmit(handleSubmit)();
                          }
                        }}
                        rows={1}
                        maxRows={3}
                        {...field}
                        onChange={handleInputChange}
                        onClick={handleInputChange}
                        placeholder="Type a message..."
                        className="min-h-full w-full resize-none border-0 outline-0 placeholder:text-muted-foreground p-1.5"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            <Button disabled={false} size={"icon"} type="submit">
              <SendHorizonal />
            </Button>
          </form>
        </Form>
      </div>
    </Card>
  );
};

export default ChatInput;
