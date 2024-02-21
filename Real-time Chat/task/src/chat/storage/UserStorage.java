package chat.storage;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
public class UserStorage {
	private Map<String, String> usernames = new LinkedHashMap<>();

	@Autowired
	private SimpMessageSendingOperations messagingTemplate;

	public boolean addUser(String sessionId, String username) {
		if (!usernames.containsValue(username)) {
			usernames.put(sessionId, username);
			messagingTemplate.convertAndSend("/topic/userConnected", username);
			return true; // User added successfully
		} else {
			return false; // User already exists
		}
	}

	public void removeUser(String sessionId) {
		usernames.remove(sessionId);
		System.out.println(usernames);
	}

	public String getUser(String sessionId) {
		return usernames.get(sessionId);
	}

	public List<String> getUsernames() {
		return new ArrayList<>(usernames.values());
	}
}