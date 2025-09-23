package fsa.training.observer;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Component
public class MovieAssignmentSubject implements Publisher {
    
    private static final Logger logger = LoggerFactory.getLogger(MovieAssignmentSubject.class);
    
    private final List<Subscriber> subscribers = new CopyOnWriteArrayList<>();
    private MovieAssignmentState state;
    
    @Override
    public void addSubscriber(Subscriber subscriber) {
        if (subscriber != null && !subscribers.contains(subscriber)) {
            subscribers.add(subscriber);
        }
    }
    
    @Override
    public void removeSubscriber(Subscriber subscriber) {
        subscribers.remove(subscriber);
    }
    
    @Override
    public void notifySubscribers() {
        notifySubscribers(null);
    }
    
    @Override
    public void notifySubscribers(Object arg) {
        for (Subscriber subscriber : subscribers) {
            try {
                subscriber.update(this, arg != null ? arg : state);
            } catch (Exception e) {
                // Log error but don't stop other subscribers
                logger.error("Error notifying subscriber: {}", e.getMessage(), e);
            }
        }
    }
    
    public void setState(MovieAssignmentState newState) {
        this.state = newState;
        notifySubscribers();
    }
    
    public MovieAssignmentState getState() {
        return state;
    }
    
    public int getSubscriberCount() {
        return subscribers.size();
    }
}
