package fsa.training.observer;

public interface Publisher {

    void addSubscriber(Subscriber subscriber);
    void removeSubscriber(Subscriber subscriber);
    void notifySubscribers();
    void notifySubscribers(Object arg);
}
