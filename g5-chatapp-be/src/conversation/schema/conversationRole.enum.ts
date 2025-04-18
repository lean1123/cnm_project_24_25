export enum ConversationRole {
  MEMBER = 'MEMBER', // can add member, and send message
  ADMIN = 'ADMIN', // can destroy, role edition for member, and OWNER role
  OWNER = 'OWNER', // can add member, remove member
}
