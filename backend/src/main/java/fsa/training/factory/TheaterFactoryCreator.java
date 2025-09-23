package fsa.training.factory;

import fsa.training.factory.impl.CGVTheaterFactory;
import fsa.training.factory.impl.BHDTheaterFactory;
import fsa.training.factory.decorator.FactoryLoggingDecorator;

import java.util.*;

/**
 * Factory Creator - dựa vào brand trả về Factory phù hợp
 */
public class TheaterFactoryCreator {

    private final Map<String, TheaterSystemFactory> brandToFactory = new LinkedHashMap<>();

    public TheaterFactoryCreator() {
        register(wrap(new CGVTheaterFactory()));
        register(wrap(new BHDTheaterFactory()));
    }

    private TheaterSystemFactory wrap(TheaterSystemFactory factory) {
        // Áp dụng Decorator để log ở boundary
        return new FactoryLoggingDecorator(factory);
    }

    private void register(TheaterSystemFactory factory) {
        if (factory == null) return;
        String key = factory.getBrandName();
        if (key == null) return;
        brandToFactory.put(key.toUpperCase(Locale.ROOT), factory);
    }

    public TheaterSystemFactory getFactory(String brand) {
        if (brand == null) {
            throw new IllegalArgumentException("Brand must not be null");
        }
        TheaterSystemFactory factory = brandToFactory.get(brand.toUpperCase(Locale.ROOT));
        if (factory == null) {
            throw new IllegalArgumentException("Unsupported theater brand: " + brand +
                    ". Supported brands: " + String.join(", ", getSupportedBrands()));
        }
        return factory;
    }

    public String[] getSupportedBrands() {
        return brandToFactory.keySet().toArray(new String[0]);
    }

    public boolean isBrandSupported(String brand) {
        return brand != null && brandToFactory.containsKey(brand.toUpperCase(Locale.ROOT));
    }
}
