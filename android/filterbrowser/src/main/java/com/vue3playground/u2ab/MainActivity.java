package com.vue3playground.u2ab;

import android.annotation.SuppressLint;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.view.inputmethod.EditorInfo;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.EditText;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;

import java.io.ByteArrayInputStream;

/** A standalone, general-purpose browser with host-based third-party filtering. */
public class MainActivity extends AppCompatActivity {
    private WebView webView;
    private EditText addressBar;
    private TextView ruleStatus;
    private FrameLayout fullscreenContainer;
    private View fullscreenView;
    private WebChromeClient.CustomViewCallback fullscreenCallback;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(Color.WHITE);

        LinearLayout browserLayout = new LinearLayout(this);
        browserLayout.setOrientation(LinearLayout.VERTICAL);

        LinearLayout toolbar = new LinearLayout(this);
        toolbar.setOrientation(LinearLayout.VERTICAL);
        toolbar.setPadding(dp(16), dp(8), dp(16), dp(10));
        toolbar.setBackgroundColor(Color.rgb(15, 23, 42));

        TextView title = new TextView(this);
        title.setText("U2AB");
        title.setTextColor(Color.WHITE);
        title.setTextSize(17);
        title.setGravity(Gravity.CENTER_VERTICAL);
        toolbar.addView(title, new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, dp(32)));

        LinearLayout addressRow = new LinearLayout(this);
        addressRow.setGravity(Gravity.CENTER_VERTICAL);
        addressBar = new EditText(this);
        addressBar.setSingleLine(true);
        addressBar.setTextSize(14);
        addressBar.setTextColor(Color.DKGRAY);
        addressBar.setHintTextColor(Color.GRAY);
        addressBar.setHint("輸入網址或搜尋內容");
        addressBar.setBackgroundColor(Color.WHITE);
        addressBar.setPadding(dp(12), 0, dp(12), 0);
        addressBar.setImeOptions(EditorInfo.IME_ACTION_GO);
        addressBar.setOnEditorActionListener((view, actionId, event) -> {
            openAddress(addressBar.getText().toString());
            return true;
        });
        addressRow.addView(addressBar, new LinearLayout.LayoutParams(0, dp(44), 1));

        Button goButton = new Button(this);
        goButton.setText("前往");
        goButton.setTextColor(Color.WHITE);
        goButton.setTextSize(14);
        goButton.setBackgroundColor(Color.TRANSPARENT);
        goButton.setOnClickListener(view -> openAddress(addressBar.getText().toString()));
        addressRow.addView(goButton, new LinearLayout.LayoutParams(dp(64), dp(44)));
        toolbar.addView(addressRow);

        ruleStatus = new TextView(this);
        ruleStatus.setText("正在載入過濾規則…");
        ruleStatus.setTextColor(Color.rgb(148, 163, 184));
        ruleStatus.setTextSize(12);
        ruleStatus.setPadding(0, dp(6), 0, 0);
        toolbar.addView(ruleStatus);
        browserLayout.addView(toolbar);

        webView = new WebView(this);
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(true);
        webView.setWebViewClient(new FilteringWebViewClient());
        webView.setWebChromeClient(new FullscreenWebChromeClient());
        browserLayout.addView(webView, new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, 0, 1));
        root.addView(browserLayout, new FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));

        fullscreenContainer = new FrameLayout(this);
        fullscreenContainer.setBackgroundColor(Color.BLACK);
        fullscreenContainer.setVisibility(View.GONE);
        root.addView(fullscreenContainer, new FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        setContentView(root);

        FilterRuleStore.initialize(this, (ruleCount, downloaded) -> runOnUiThread(() ->
            ruleStatus.setText(String.format("已載入 %,d 條網域過濾規則%s", ruleCount, downloaded ? "（已更新）" : ""))));
        webView.loadUrl("https://m.youtube.com/");
    }

    private void openAddress(String enteredAddress) {
        String value = enteredAddress.trim();
        if (value.isEmpty()) return;
        if (!value.contains("://")) {
            if (value.contains(".") && !value.contains(" ")) value = "https://" + value;
            else value = "https://www.google.com/search?q=" + Uri.encode(value);
        }
        webView.loadUrl(value);
    }

    @Override
    public void onBackPressed() {
        if (fullscreenView != null) hideFullscreen();
        else if (webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }

    private void showFullscreen(View view, WebChromeClient.CustomViewCallback callback) {
        if (fullscreenView != null) {
            callback.onCustomViewHidden();
            return;
        }
        fullscreenView = view;
        fullscreenCallback = callback;
        webView.setVisibility(View.GONE);
        fullscreenContainer.addView(view, new FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        fullscreenContainer.setVisibility(View.VISIBLE);
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);
    }

    private void hideFullscreen() {
        if (fullscreenView == null) return;
        fullscreenContainer.removeView(fullscreenView);
        fullscreenContainer.setVisibility(View.GONE);
        webView.setVisibility(View.VISIBLE);
        getWindow().clearFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN);
        if (fullscreenCallback != null) fullscreenCallback.onCustomViewHidden();
        fullscreenView = null;
        fullscreenCallback = null;
    }

    private int dp(int value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }

    private final class FilteringWebViewClient extends WebViewClient {
        @Override
        public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
            if (!request.isForMainFrame() && FilterRuleStore.shouldBlock(request.getUrl().getHost())) {
                return new WebResourceResponse("text/plain", "UTF-8", new ByteArrayInputStream(new byte[0]));
            }
            return super.shouldInterceptRequest(view, request);
        }

        @Override
        public void onPageFinished(WebView view, String url) {
            super.onPageFinished(view, url);
            addressBar.setText(url);
        }

        @Override
        public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
            Uri url = request.getUrl();
            if ("http".equals(url.getScheme()) || "https".equals(url.getScheme())) view.loadUrl(url.toString());
            return true;
        }
    }

    private final class FullscreenWebChromeClient extends WebChromeClient {
        @Override
        public void onShowCustomView(View view, CustomViewCallback callback) {
            showFullscreen(view, callback);
        }

        @Override
        public void onHideCustomView() {
            hideFullscreen();
        }
    }
}
