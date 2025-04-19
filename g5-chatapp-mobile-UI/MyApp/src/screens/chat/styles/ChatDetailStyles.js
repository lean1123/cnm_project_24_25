import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f9f9f9",
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: "#135CAF",
    elevation: 2,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginHorizontal: 8,
  },
  friendName: {
    fontWeight: "bold",
    fontSize: 16,
    color: "white",
  },
  statusUser: {
    color: "white",
    fontSize: 12,
  },
  actionIcons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconButton: {
    padding: 10,
  },
  messageList: { 
    flex: 1, 
    paddingHorizontal: 20, 
    backgroundColor: "#FFFFFF" 
  },
  messageContainer: {
    maxWidth: "75%",
    marginVertical: 5,
    padding: 10,
    borderRadius: 10,
  },
  userMessage: {
    backgroundColor: "#0099ff",
    alignSelf: "flex-end",
  },
  friendMessage: {
    backgroundColor: "#D3D3D3",
    alignSelf: "flex-start",
  },
  errorMessage: {
    borderWidth: 1,
    borderColor: "red",
  },
  messageText: {
    color: "white",
  },
  messageTime: {
    fontSize: 10,
    color: "white",
    marginTop: 5,
    alignSelf: "flex-end",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "white",
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    marginHorizontal: 10,
    paddingVertical: 15,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  optionsBox: {
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  option: {
    padding: 10,
    alignItems: "center",
    borderRadius: 10,
    justifyContent: "center",
    width: 100,
  },
  optionText: {
    marginTop: 5,
    color: "#0099ff",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  closeButton: {
    alignItems: "center",
    marginTop: 10,
    borderWidth: 2,
    borderColor: "white",
    padding: 10,
    borderRadius: 10,
    backgroundColor: "red",
  },
  closeText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 13,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingMore: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  senderName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorIndicator: {
    position: 'absolute',
    top: 5,
    right: 5,
  }
}); 