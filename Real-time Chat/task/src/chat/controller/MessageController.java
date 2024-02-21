package chat.controller;

import chat.model.MessageModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@RestController
public class MessageController {

	@Autowired
	private SimpMessagingTemplate simpMessagingTemplate;

	private List<MessageModel> messageList = new ArrayList<>();

	@MessageMapping("/chat")
	public void sendMessage(MessageModel message) {
		messageList.add(message);
		simpMessagingTemplate.convertAndSend("/topic/newMessage", message);
	}

	@GetMapping("/topic/messages")
	public ResponseEntity<List<MessageModel>> getMessages() {
		return ResponseEntity.ok(messageList);
	}
}