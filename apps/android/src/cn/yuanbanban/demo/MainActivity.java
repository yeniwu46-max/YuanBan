package cn.yuanbanban.demo;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.view.WindowInsets;
import android.webkit.ConsoleMessage;
import android.webkit.MimeTypeMap;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.Toast;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.Locale;

/** Bundled H5 demonstration. No native JavaScript bridge or sensitive permissions. */
public final class MainActivity extends Activity {
    private static final String HOST = "appassets.androidplatform.net";
    private static final String ENTRY = "https://" + HOST + "/index.html#/pages/login-welcome/index";
    private WebView webView;

    @Override
    public void onCreate(Bundle state) {
        super.onCreate(state);
        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(Color.rgb(244, 247, 244));
        getWindow().setStatusBarColor(Color.rgb(244, 247, 244));
        getWindow().setNavigationBarColor(Color.WHITE);
        getWindow().getDecorView().setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR | View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR);
        if (Build.VERSION.SDK_INT >= 30) {
            getWindow().setDecorFitsSystemWindows(false);
            root.setOnApplyWindowInsetsListener((view, insets) -> {
                android.graphics.Insets bars = insets.getInsets(
                    WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout());
                android.graphics.Insets keyboard = insets.getInsets(WindowInsets.Type.ime());
                view.setPadding(bars.left, bars.top, bars.right, Math.max(bars.bottom, keyboard.bottom));
                return insets;
            });
        }
        webView = new WebView(this);
        webView.setBackgroundColor(Color.rgb(244, 247, 244));
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setSafeBrowsingEnabled(true);
        settings.setSupportMultipleWindows(false);
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onConsoleMessage(ConsoleMessage message) {
                if (message.messageLevel() == ConsoleMessage.MessageLevel.ERROR) {
                    Log.e("YuanBanWeb", message.message() + " at " + message.sourceId() + ":" + message.lineNumber());
                }
                return true;
            }
        });
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if (!isLocal(uri)) return null;
                if (!"GET".equals(request.getMethod())) return missing();
                String path = uri.getPath();
                if (path == null || path.equals("/")) path = "/index.html";
                // Only serve packaged assets, never filesystem paths or remote HTML.
                if (path.contains("..") || path.contains("\\")) return missing();
                try {
                    InputStream stream = getAssets().open("www" + path);
                    return new WebResourceResponse(mime(path), "UTF-8", 200, "OK",
                        Collections.singletonMap("Cache-Control", "no-cache"), stream);
                } catch (IOException error) {
                    Log.e("YuanBanWeb", "Missing asset: " + path);
                    return missing();
                }
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if (isLocal(uri)) return false;
                if (!request.isForMainFrame()) return true;
                String scheme = uri.getScheme();
                Intent intent;
                if ("tel".equals(scheme)) intent = new Intent(Intent.ACTION_DIAL, uri);
                else if ("https".equals(scheme) || "http".equals(scheme) || "mailto".equals(scheme)) {
                    intent = new Intent(Intent.ACTION_VIEW, uri);
                } else {
                    Toast.makeText(MainActivity.this, "演示版暂不支持此操作", Toast.LENGTH_SHORT).show();
                    return true;
                }
                try { startActivity(intent); }
                catch (ActivityNotFoundException error) {
                    Toast.makeText(MainActivity.this, "没有找到可处理此操作的应用", Toast.LENGTH_SHORT).show();
                }
                return true;
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request.isForMainFrame()) {
                    Log.e("YuanBanWeb", "Page error: " + error.getDescription());
                    new AlertDialog.Builder(MainActivity.this).setTitle("页面未能打开")
                        .setMessage("请重试；此演示版的页面资源已内置，无需连接电脑。")
                        .setPositiveButton("重新打开", (dialog, which) -> webView.loadUrl(ENTRY))
                        .setNegativeButton("关闭", (dialog, which) -> finish()).show();
                }
            }
        });
        root.addView(webView, new FrameLayout.LayoutParams(-1, -1));
        setContentView(root);
        if (state == null || webView.restoreState(state) == null) webView.loadUrl(ENTRY);
        Toast.makeText(this, "演示版：健康、设备及告警均为模拟数据", Toast.LENGTH_LONG).show();
    }

    private static boolean isLocal(Uri uri) {
        return "https".equals(uri.getScheme()) && HOST.equals(uri.getHost());
    }

    private static String mime(String path) {
        String extension = MimeTypeMap.getFileExtensionFromUrl(path).toLowerCase(Locale.ROOT);
        if (extension.equals("js") || extension.equals("mjs")) return "application/javascript";
        if (extension.equals("svg")) return "image/svg+xml";
        if (extension.equals("json")) return "application/json";
        String type = MimeTypeMap.getSingleton().getMimeTypeFromExtension(extension);
        return type == null ? "application/octet-stream" : type;
    }

    private static WebResourceResponse missing() {
        return new WebResourceResponse("text/plain", "UTF-8", 404, "Not Found", Collections.emptyMap(),
            new ByteArrayInputStream("Not Found".getBytes(StandardCharsets.UTF_8)));
    }

    @Override
    public void onBackPressed() {
        webView.evaluateJavascript("window.dispatchEvent(new CustomEvent('yuanbanban:back', {cancelable:true}))", result -> {
            if (!"false".equals(result)) navigateBack();
        });
    }

    private void navigateBack() {
        if (webView.canGoBack()) webView.goBack();
        else new AlertDialog.Builder(this).setTitle("退出鼋伴伴？")
            .setPositiveButton("退出", (dialog, which) -> finish())
            .setNegativeButton("继续使用", null).show();
    }

    @Override
    protected void onSaveInstanceState(Bundle state) {
        webView.saveState(state);
        super.onSaveInstanceState(state);
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            ((FrameLayout) webView.getParent()).removeView(webView);
            webView.destroy();
        }
        super.onDestroy();
    }
}
