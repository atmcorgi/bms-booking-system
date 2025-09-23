package fsa.training.rules;

import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public final class SeatTypeRulesRegistry {

    private static SeatTypeRulesRegistry instance;

    public static synchronized SeatTypeRulesRegistry getInstance() {
        if (instance == null) {
            instance = new SeatTypeRulesRegistry();
        }
        return instance;
    }

    private final Map<String, Object> rules = new ConcurrentHashMap<>();

    private SeatTypeRulesRegistry() {
        // Default rules for CGV
        put("CGV.vip.row.start", 0.40d);
        put("CGV.vip.row.end", 0.70d);
        put("CGV.vip.col.start", 0.30d);
        put("CGV.vip.col.end", 0.70d);
        put("CGV.front.rows.standard", 2); // first N rows as STANDARD

        // Default rules for BHD
        put("BHD.vip.row.start", 0.45d);
        put("BHD.vip.row.end", 0.60d);
        put("BHD.vip.col.start", 0.40d);
        put("BHD.vip.col.end", 0.60d);
        put("BHD.last.row.vip", true); // last row all VIP
    }

    // Basic API
    public void put(String key, Object value) {
        if (key == null) return;
        rules.put(key, value);
    }

    public Object get(String key) {
        return rules.get(key);
    }

    public double getDouble(String key, double defaultValue) {
        Object v = rules.get(key);
        if (v instanceof Number) return ((Number) v).doubleValue();
        return defaultValue;
    }

    public int getInt(String key, int defaultValue) {
        Object v = rules.get(key);
        if (v instanceof Number) return ((Number) v).intValue();
        return defaultValue;
    }

    public boolean getBoolean(String key, boolean defaultValue) {
        Object v = rules.get(key);
        if (v instanceof Boolean) return (Boolean) v;
        return defaultValue;
    }

    public String key(String brand, String suffix) {
        return (brand == null ? "" : brand.toUpperCase(Locale.ROOT)) + "." + suffix;
    }
}