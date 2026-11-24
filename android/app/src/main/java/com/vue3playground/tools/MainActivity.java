package com.vue3playground.tools;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(android.os.Bundle savedInstanceState) {
        registerPlugin(FilteredBrowserPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
