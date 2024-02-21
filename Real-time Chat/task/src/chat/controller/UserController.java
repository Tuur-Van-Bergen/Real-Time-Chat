package chat.controller;

import chat.storage.UserStorage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

	@Autowired
	private UserStorage userStorage;

	@PostMapping("/add")
	public ResponseEntity<String> addUser(@RequestBody String userData) {
		System.out.println(userData);
		String[] userDataArray = userData.split(" ");
		String sessionId = userDataArray[0];
		String username = userDataArray[1];

		if (userStorage.addUser(sessionId, username)) {
			return ResponseEntity.ok("User added successfully: " + username);
		} else {
			return ResponseEntity.badRequest().body("User already exists: " + username);
		}
	}

	@GetMapping("/list")
	public List<String> listUsers() {
		return userStorage.getUsernames();
	}
}