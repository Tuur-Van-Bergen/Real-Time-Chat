package chat.model;

import java.util.Date;

public class MessageModel {
	private String fromUser;
	private String toUser;
	private String message;
	private Date date;

	public String getFromUser() {
		return fromUser;
	}

	public void setFromUser(String fromUser) {
		this.fromUser = fromUser;
	}

	public String getToUser() {
		return toUser;
	}

	public void setToUser(String toUser) {
		this.toUser = toUser;
	}

	// Getters and setters for message
	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}

	// Getters and setters for date
	public Date getDate() {
		return date;
	}

	public void setDate(Date date) {
		this.date = date;
	}

	@Override
	public String toString() {
		return "MessageModel{" +
				"fromUser='" + fromUser + '\'' +
				", toUser='" + toUser + '\'' +
				", message='" + message + '\'' +
				", date=" + date +
				'}';
	}
}