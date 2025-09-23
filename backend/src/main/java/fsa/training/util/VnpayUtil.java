package fsa.training.util;

import java.nio.charset.StandardCharsets;
import java.util.*;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

public class VnpayUtil {
    public static String getPaymentUrl(Map<String, String> vnp_Params, String vnp_HashSecret, String vnp_PayUrl) {
        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String value = vnp_Params.get(fieldName);
            if ((value != null) && (value.length() > 0)) {
                // Build hash data
                hashData.append(fieldName);
                hashData.append('=');
                try {
                    hashData.append(java.net.URLEncoder.encode(value, java.nio.charset.StandardCharsets.US_ASCII.toString()));
                } catch (Exception e) {
                    hashData.append(value);
                }
                // Build query
                try {
                    query.append(java.net.URLEncoder.encode(fieldName, java.nio.charset.StandardCharsets.US_ASCII.toString()));
                } catch (Exception e) {
                    query.append(fieldName);
                }
                query.append('=');
                try {
                    query.append(java.net.URLEncoder.encode(value, java.nio.charset.StandardCharsets.US_ASCII.toString()));
                } catch (Exception e) {
                    query.append(value);
                }
                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }
        String queryUrl = query.toString();
        String secureHash = hmacSHA512(vnp_HashSecret, hashData.toString());
        queryUrl += "&vnp_SecureHash=" + secureHash;
        return vnp_PayUrl + "?" + queryUrl;
    }

    public static String hmacSHA512(String key, String data) {
        try {
            if (key == null || data == null) return null;
            Mac hmac512 = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            hmac512.init(secretKey);
            byte[] bytes = hmac512.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hash = new StringBuilder();
            for (byte b : bytes) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hash.append('0');
                hash.append(hex);
            }
            return hash.toString();
        } catch (Exception ex) {
            return null;
        }
    }
} 