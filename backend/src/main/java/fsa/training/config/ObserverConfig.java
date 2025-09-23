package fsa.training.config;

import fsa.training.observer.MovieAssignmentSubject;
import fsa.training.observer.StaffNotificationObserver;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;

/**
 * Configuration để register observers với subject
 */
@Configuration
public class ObserverConfig {
    
    @Autowired
    private MovieAssignmentSubject movieAssignmentSubject;
    
    @Autowired
    private StaffNotificationObserver staffNotificationObserver;
    
    @PostConstruct
    public void registerSubscribers() {
        // Register subscriber với publisher
        movieAssignmentSubject.addSubscriber(staffNotificationObserver);
    }
}
