package fsa.training.scheduling.util;

public class SolverProgressHolder {
    private static final ThreadLocal<Integer> progress = new ThreadLocal<>();
    
    public static void setProgress(int value) {
        progress.set(value);
    }
    
    public static int getProgress() {
        Integer value = progress.get();
        return value != null ? value : 0;
    }
    
    public static void clear() {
        progress.remove();
    }
}
