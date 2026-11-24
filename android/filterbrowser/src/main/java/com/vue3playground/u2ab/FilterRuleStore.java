package com.vue3playground.u2ab;

import android.content.Context;
import android.content.SharedPreferences;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/** Loads host rules from EasyList and keeps a cached copy for offline use. */
public final class FilterRuleStore {
    private static final String RULES_URL = "https://easylist.to/easylist/easylist.txt";
    private static final String PREFS = "filter_rules";
    private static final String CACHED_DOMAINS = "cached_domains";
    private static final String LAST_UPDATED = "last_updated";
    private static final long UPDATE_INTERVAL_MS = 7L * 24 * 60 * 60 * 1000;
    private static final int MAX_DOMAINS = 20000;
    private static final Pattern DOMAIN_RULE = Pattern.compile("^\\|\\|([a-z0-9.-]+)\\^.*", Pattern.CASE_INSENSITIVE);
    private static final Set<String> FALLBACK_DOMAINS = new HashSet<>(Arrays.asList(
        "doubleclick.net", "googlesyndication.com", "googleadservices.com",
        "google-analytics.com", "googletagmanager.com", "adservice.google.com",
        "adnxs.com", "adsrvr.org", "amazon-adsystem.com", "criteo.com",
        "facebook.net", "moatads.com", "outbrain.com", "taboola.com"
    ));

    private static volatile Set<String> domains = Collections.unmodifiableSet(FALLBACK_DOMAINS);
    private static final ExecutorService EXECUTOR = Executors.newSingleThreadExecutor();

    private FilterRuleStore() {}

    public interface UpdateListener {
        void onComplete(int ruleCount, boolean downloaded);
    }

    public static void initialize(Context context, UpdateListener listener) {
        Context appContext = context.getApplicationContext();
        EXECUTOR.execute(() -> {
            SharedPreferences preferences = appContext.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
            loadCached(preferences);
            boolean shouldUpdate = System.currentTimeMillis() - preferences.getLong(LAST_UPDATED, 0) > UPDATE_INTERVAL_MS;
            boolean downloaded = shouldUpdate && downloadAndCache(preferences);
            listener.onComplete(domains.size(), downloaded);
        });
    }

    public static boolean shouldBlock(String host) {
        if (host == null) return false;
        String normalizedHost = host.toLowerCase(Locale.ROOT);
        for (String domain : domains) {
            if (normalizedHost.equals(domain) || normalizedHost.endsWith("." + domain)) return true;
        }
        return false;
    }

    private static void loadCached(SharedPreferences preferences) {
        String cached = preferences.getString(CACHED_DOMAINS, "");
        if (cached.isEmpty()) return;
        Set<String> loaded = new HashSet<>(FALLBACK_DOMAINS);
        loaded.addAll(Arrays.asList(cached.split("\\n")));
        domains = Collections.unmodifiableSet(loaded);
    }

    private static boolean downloadAndCache(SharedPreferences preferences) {
        HttpURLConnection connection = null;
        try {
            connection = (HttpURLConnection) new URL(RULES_URL).openConnection();
            connection.setConnectTimeout(10000);
            connection.setReadTimeout(15000);
            connection.setRequestProperty("User-Agent", "u2ab-vue26112401/1.1");

            Set<String> updatedDomains = new HashSet<>(FALLBACK_DOMAINS);
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null && updatedDomains.size() < MAX_DOMAINS) {
                    Matcher matcher = DOMAIN_RULE.matcher(line.trim());
                    if (matcher.matches()) updatedDomains.add(matcher.group(1).toLowerCase(Locale.ROOT));
                }
            }
            domains = Collections.unmodifiableSet(updatedDomains);
            preferences.edit()
                .putString(CACHED_DOMAINS, String.join("\n", updatedDomains))
                .putLong(LAST_UPDATED, System.currentTimeMillis())
                .apply();
            return true;
        } catch (Exception ignored) {
            return false;
        } finally {
            if (connection != null) connection.disconnect();
        }
    }
}
