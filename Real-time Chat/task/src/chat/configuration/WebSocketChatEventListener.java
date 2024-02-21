package chat.configuration;

import chat.storage.UserStorage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
@EnableScheduling
public class WebSocketChatEventListener {

	private final TaskScheduler taskScheduler;
	private final SimpMessagingTemplate messagingTemplate;
	private SessionConnectedEvent event;

	@Autowired
	public WebSocketChatEventListener(TaskScheduler taskScheduler, SimpMessagingTemplate messagingTemplate) {
		this.taskScheduler = taskScheduler;
		this.messagingTemplate = messagingTemplate;
	}

	@Autowired
	private UserStorage userStorage;

	private String sessionId; // Declare sessionId as an instance variable

	// Method to set the sessionId
	public void setSessionId(String sessionId) {
		this.sessionId = sessionId;
	}

	@Scheduled(fixedDelay = 1)
	public void sendDelayedWelcomeMessage() {
		try {
			String destination = "/topic/connect";
			messagingTemplate.convertAndSend(destination, sessionId);
		} catch (NullPointerException e) {
		}
	}

	@EventListener
	public void handleWebSocketConnectListener(SessionConnectedEvent event) {
		this.event = event;
		StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
		setSessionId(headerAccessor.getSessionId());
		System.out.println("New WebSocket session connected: " + sessionId);
	}

	@EventListener
	public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
		StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
		String sessionId = headerAccessor.getSessionId();
		String username = userStorage.getUser(sessionId);
		userStorage.removeUser(sessionId);
		System.out.println("WebSocket session disconnected: " + sessionId);


		messagingTemplate.convertAndSend("/topic/userDisconnected", username);
	}
}