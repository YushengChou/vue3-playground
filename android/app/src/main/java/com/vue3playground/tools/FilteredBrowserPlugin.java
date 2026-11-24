package com.vue3playground.tools;

import android.content.Intent;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "FilteredBrowser")
public class FilteredBrowserPlugin extends Plugin {
    @PluginMethod
    public void openYouTube(PluginCall call) {
        Intent intent = new Intent(getContext(), FilteredBrowserActivity.class);
        intent.putExtra(FilteredBrowserActivity.START_URL, "https://m.youtube.com/");
        getActivity().startActivity(intent);
        call.resolve();
    }
}
