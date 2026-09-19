package com.novacart.ai.service;

import com.novacart.ai.api.ChatController;
import com.novacart.ai.domain.Conversation;
import com.novacart.ai.repository.ConversationRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
public class ConversationService {
    private static final int MAX_MESSAGES = 40;
    private final ConversationRepository conversations;

    public ConversationService(ConversationRepository conversations) { this.conversations = conversations; }

    public void append(String userId, String question, ChatController.ChatResponse response) {
        if (userId == null || userId.isBlank()) return;
        String id = "customer:" + userId;
        Conversation current = conversations.findById(id).orElse(new Conversation(id, userId, List.of(), Instant.now()));
        List<Conversation.Message> messages = new ArrayList<>(current.messages() == null ? List.of() : current.messages());
        messages.add(new Conversation.Message("user", question, "customer", List.of(), Instant.now()));
        messages.add(new Conversation.Message("assistant", response.answer(), response.mode(),
            response.citations() == null ? List.of() : response.citations().stream().map(ChatController.Citation::id).toList(), Instant.now()));
        if (messages.size() > MAX_MESSAGES) messages = new ArrayList<>(messages.subList(messages.size() - MAX_MESSAGES, messages.size()));
        conversations.save(new Conversation(id, userId, List.copyOf(messages), Instant.now()));
    }
}
