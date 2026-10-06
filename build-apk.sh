#!/usr/bin/env bash
set -e

echo "=== Tarım Cepte APK Builder Starting ==="
WORK_DIR="/tmp/tarim-apk-build"
APPLET_DIR="/app/applet"
mkdir -p "$WORK_DIR"
cd "$WORK_DIR"

JAVA_BIN="/usr/lib/jvm/java-17-openjdk-amd64/bin"
export PATH="$JAVA_BIN:$PATH"

echo "1. Checking android.jar and r8.jar..."
if [ ! -s android.jar ]; then
  echo "Downloading android.jar..."
  curl -sL -o android.jar https://raw.githubusercontent.com/Sable/android-platforms/master/android-30/android.jar
fi
if [ ! -s r8.jar ]; then
  echo "Downloading r8.jar..."
  curl -sL -o r8.jar https://dl.google.com/dl/android/maven2/com/android/tools/r8/8.2.42/r8-8.2.42.jar
fi
rm -rf res build src AndroidManifest.xml

echo "2. Preparing Android Manifest and Resources..."
mkdir -p res/values res/drawable-hdpi res/drawable-xhdpi res/drawable-xxhdpi res/drawable-xxxhdpi

# Copy icons from public
if [ -f "$APPLET_DIR/public/pwa-192x192.png" ]; then
  cp "$APPLET_DIR/public/pwa-192x192.png" res/drawable-hdpi/icon.png
  cp "$APPLET_DIR/public/pwa-192x192.png" res/drawable-xhdpi/icon.png
  cp "$APPLET_DIR/public/pwa-192x192.png" res/drawable-xxhdpi/icon.png
elif [ -f "$APPLET_DIR/public/apple-touch-icon.png" ]; then
  cp "$APPLET_DIR/public/apple-touch-icon.png" res/drawable-hdpi/icon.png
  cp "$APPLET_DIR/public/apple-touch-icon.png" res/drawable-xhdpi/icon.png
  cp "$APPLET_DIR/public/apple-touch-icon.png" res/drawable-xxhdpi/icon.png
fi

cat << 'EOF' > res/values/strings.xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">Tarım Cepte</string>
</resources>
EOF

cat << 'EOF' > AndroidManifest.xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.tarimcepte.app"
    android:versionCode="1"
    android:versionName="1.0.0">

    <uses-sdk android:minSdkVersion="21" android:targetSdkVersion="33" />

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.VIBRATE" />

    <application
        android:label="@string/app_name"
        android:icon="@drawable/icon"
        android:allowBackup="true"
        android:hardwareAccelerated="true"
        android:usesCleartextTraffic="true">
        
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:label="@string/app_name"
            android:configChanges="orientation|screenSize|keyboardHidden"
            android:windowSoftInputMode="adjustResize"
            android:theme="@android:style/Theme.NoTitleBar">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
EOF

echo "3. Creating Java Source for Android WebView..."
mkdir -p src/com/tarimcepte/app
cat << 'EOF' > src/com/tarimcepte/app/MainActivity.java
package com.tarimcepte.app;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebChromeClient;
import android.graphics.Color;
import android.view.KeyEvent;
import android.view.Window;
import android.view.WindowManager;

public class MainActivity extends Activity {
    private WebView webView;
    private static final String APP_URL = "https://ais-pre-xrwerhf5r5p64nhwpuq52w-299522481191.europe-west2.run.app";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        requestWindowFeature(Window.FEATURE_NO_TITLE);

        webView = new WebView(this);
        webView.setBackgroundColor(Color.parseColor("#06140f"));
        webView.setOverScrollMode(WebView.OVER_SCROLL_NEVER);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);

        android.webkit.CookieManager.getInstance().setAcceptCookie(true);

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                view.loadUrl(url);
                return true;
            }
        });

        webView.setWebChromeClient(new WebChromeClient());
        webView.loadUrl(APP_URL);

        setContentView(webView);
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (keyCode == KeyEvent.KEYCODE_BACK && webView.canGoBack()) {
            webView.goBack();
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }
}
EOF

echo "4. Compiling Java..."
mkdir -p build/classes
javac -cp android.jar -d build/classes src/com/tarimcepte/app/MainActivity.java

echo "5. Converting to Dalvik Executable (classes.dex) with D8..."
java -cp r8.jar com.android.tools.r8.D8 --lib android.jar --output build $(find build/classes -name "*.class")

echo "6. Packaging resources with aapt..."
aapt package -f -M AndroidManifest.xml -S res -I android.jar -F build/unsigned.apk
cd build
aapt add unsigned.apk classes.dex
cd "$WORK_DIR"

echo "7. Aligning APK with zipalign..."
zipalign -f -p 4 build/unsigned.apk build/aligned.apk

echo "8. Signing APK..."
rm -f release.keystore
keytool -genkey -v -keystore release.keystore -alias tarimcepte -keyalg RSA -keysize 2048 -validity 10000 -storepass tarimcepte123 -keypass tarimcepte123 -dname "CN=TarimCepte, OU=Agriculture, O=TarimCepte, L=Rize, S=Rize, C=TR"

jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 -keystore release.keystore -storepass tarimcepte123 build/aligned.apk tarimcepte

echo "9. Publishing APK to $APPLET_DIR/public/tarim-cepte.apk..."
mkdir -p "$APPLET_DIR/public"
cp build/aligned.apk "$APPLET_DIR/public/tarim-cepte.apk"
cp build/aligned.apk "$APPLET_DIR/public/TarimCepte.apk"
ls -lh "$APPLET_DIR/public/tarim-cepte.apk"

echo "=== Build Complete! APK ready at $APPLET_DIR/public/tarim-cepte.apk ==="
