package com.novacart.ai.api;

import com.novacart.ai.service.GroundedAssistantService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.time.Instant;

@RestController
@RequestMapping("/api/v1/ai")
public class ChatController {
    private final GroundedAssistantService assistant;
    private final com.novacart.ai.service.RagService rag;
    public ChatController(GroundedAssistantService assistant, com.novacart.ai.service.RagService rag) { this.assistant = assistant; this.rag = rag; }

    @PostMapping("/chat")
    public ChatResponse chat(@Valid @RequestBody ChatRequest request,
                             @RequestAttribute("ai.userId") String userId) {
        return assistant.answer(request.message(), userId);
    }

    @PostMapping("/cancel/propose")
    public GroundedAssistantService.CancellationProposal proposeCancel(@Valid @RequestBody CancelRequest request,
                                                                         @RequestAttribute("ai.userId") String userId) {
        return assistant.proposeCancellation(request.orderId(), userId);
    }

    @PostMapping("/cancel/confirm")
    public GroundedAssistantService.CancellationResult confirmCancel(@Valid @RequestBody ConfirmCancelRequest request,
                                                                       @RequestAttribute("ai.userId") String userId) {
        return assistant.confirmCancellation(request.confirmationToken(), userId);
    }

    @PostMapping("/compare")
    public GroundedAssistantService.Comparison compare(@Valid @RequestBody CompareRequest request) {
        return assistant.compare(request.firstProductId(), request.secondProductId());
    }

    @GetMapping("/analytics")
    public GroundedAssistantService.AnalyticsSummary analytics(
        @RequestAttribute("ai.roles") String roles) {
        return assistant.analytics(roles);
    }

    @PostMapping("/feedback")
    public void feedback(@Valid @RequestBody FeedbackRequest request,
                         @RequestAttribute("ai.userId") String userId) {
        assistant.recordFeedback(request.messageId(), request.helpful(), userId);
    }

    @GetMapping("/rag/status")
    public com.novacart.ai.service.RagService.IndexStatus ragStatus(
        @RequestAttribute("ai.roles") String roles) {
        requireAdmin(roles);
        return rag.status();
    }

    @PostMapping("/rag/reindex")
    public com.novacart.ai.service.RagService.IndexStatus reindex(
        @RequestAttribute("ai.roles") String roles) {
        requireAdmin(roles);
        return rag.refresh();
    }

    @PostMapping("/rag/product-updated")
    public com.novacart.ai.service.RagService.IndexStatus productUpdated(
        @RequestHeader(value = "X-Internal-Service", required = false) String service) {
        if (!"product-service".equals(service)) throw new IllegalArgumentException("Internal product service identity is required");
        rag.requestRefresh();
        return rag.status();
    }

    private void requireAdmin(String roles) {
        if (roles == null || !List.of(roles.split(",")).contains("ROLE_ADMIN"))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Administrator role is required");
    }

    public record ChatRequest(@NotBlank String message) {}
    public record CancelRequest(@NotBlank String orderId) {}
    public record ConfirmCancelRequest(@NotBlank String confirmationToken) {}
    public record CompareRequest(@NotBlank String firstProductId, @NotBlank String secondProductId) {}
    public record FeedbackRequest(@NotBlank String messageId, boolean helpful) {}
    public record ChatResponse(String answer, List<Citation> citations, String mode) {}
    public record Citation(String id, String title, String source) {}
}
