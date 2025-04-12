export class MessageForwardationRequest {
  content: string;
  conversationId: string;
  files: {
    fileName: string;
    url: string;
    _id: string;
  }[];
  forwardFrom: string;
  type: string;
}
