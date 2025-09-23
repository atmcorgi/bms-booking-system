package fsa.training.observer;

public interface Subscriber {
    
    void update(Publisher publisher, Object arg);
}
