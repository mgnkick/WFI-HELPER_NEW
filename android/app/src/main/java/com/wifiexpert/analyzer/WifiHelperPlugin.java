package com.wifiexpert.analyzer;

import android.Manifest;
import android.content.Context;
import android.content.Intent;
import android.net.ConnectivityManager;
import android.net.Network;
import android.net.NetworkCapabilities;
import android.net.wifi.ScanResult;
import android.net.wifi.WifiInfo;
import android.net.wifi.WifiManager;
import android.os.Build;
import android.provider.Settings;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import java.net.NetworkInterface;
import java.util.Enumeration;
import java.util.List;
import java.util.Locale;

@CapacitorPlugin(
    name = "WifiHelper",
    permissions = {
        @Permission(
            alias = "location",
            strings = {
                Manifest.permission.ACCESS_FINE_LOCATION,
                Manifest.permission.ACCESS_COARSE_LOCATION
            }
        )
    }
)
public class WifiHelperPlugin extends Plugin {

    @PluginMethod
    public void getSnapshot(PluginCall call) {
        try {
            Context ctx = getContext().getApplicationContext();
            WifiManager wifiManager = (WifiManager) ctx.getSystemService(Context.WIFI_SERVICE);
            ConnectivityManager cm = (ConnectivityManager) ctx.getSystemService(Context.CONNECTIVITY_SERVICE);

            boolean wifiConnected = false;
            boolean usingMobile = false;
            boolean vpnActive = false;
            String vpnInterfaceName = "";

            if (cm != null) {
                Network active = cm.getActiveNetwork();
                NetworkCapabilities caps = active != null ? cm.getNetworkCapabilities(active) : null;
                if (caps != null) {
                    wifiConnected = caps.hasTransport(NetworkCapabilities.TRANSPORT_WIFI);
                    usingMobile = caps.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR);
                    if (caps.hasTransport(NetworkCapabilities.TRANSPORT_VPN)) {
                        vpnActive = true;
                    }
                }

                // Дополнительная проверка всех активных сетей на VPN transport
                Network[] all = cm.getAllNetworks();
                if (all != null) {
                    for (Network n : all) {
                        NetworkCapabilities c = cm.getNetworkCapabilities(n);
                        if (c != null && c.hasTransport(NetworkCapabilities.TRANSPORT_VPN)) {
                            vpnActive = true;
                            break;
                        }
                    }
                }
            }

            // Дополнительная проверка системных сетевых интерфейсов (tun, tap, ppp, wg, vpn)
            if (!vpnActive) {
                try {
                    Enumeration<NetworkInterface> interfaces = NetworkInterface.getNetworkInterfaces();
                    while (interfaces != null && interfaces.hasMoreElements()) {
                        NetworkInterface iface = interfaces.nextElement();
                        if (iface != null && iface.isUp() && !iface.isLoopback()) {
                            String name = iface.getName().toLowerCase(Locale.US);
                            if (name.startsWith("tun") || name.startsWith("ppp") || name.startsWith("tap") || name.contains("wg") || name.contains("vpn")) {
                                vpnActive = true;
                                vpnInterfaceName = iface.getName();
                                break;
                            }
                        }
                    }
                } catch (Exception ignored) {
                }
            }

            JSObject current = null;
            if (wifiManager != null) {
                try {
                    wifiManager.startScan();
                } catch (Exception ignored) {
                    // throttled scan is fine — use cached results
                }

                @SuppressWarnings("deprecation")
                WifiInfo info = wifiManager.getConnectionInfo();
                if (info != null && info.getNetworkId() != -1) {
                    wifiConnected = true;
                    current = wifiInfoToJson(info);
                }
            }

            JSArray aps = new JSArray();
            if (wifiManager != null) {
                List<ScanResult> results = wifiManager.getScanResults();
                String currentBssid = current != null ? current.getString("bssid") : "";
                if (results != null) {
                    for (ScanResult scan : results) {
                        aps.put(scanToJson(scan, currentBssid));
                    }
                }
            }

            JSObject out = new JSObject();
            out.put("wifiConnected", wifiConnected);
            out.put("usingMobileInternet", usingMobile && !wifiConnected);
            out.put("vpnActive", vpnActive);
            out.put("vpnInterfaceName", vpnInterfaceName.isEmpty() ? (vpnActive ? "tun0 (VPN)" : "") : vpnInterfaceName);
            out.put("current", current);
            out.put("accessPoints", aps);
            call.resolve(out);
        } catch (Exception e) {
            call.reject("Не удалось получить список сетей: " + e.getMessage());
        }
    }

    @PluginMethod
    public void openVpnSettings(PluginCall call) {
        try {
            Intent intent = new Intent(Settings.ACTION_VPN_SETTINGS);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
            call.resolve();
        } catch (Exception e) {
            try {
                Intent intent = new Intent(Settings.ACTION_WIRELESS_SETTINGS);
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                getContext().startActivity(intent);
                call.resolve();
            } catch (Exception e2) {
                call.reject("Не удалось открыть настройки VPN: " + e2.getMessage());
            }
        }
    }

    @PluginMethod
    public void openInAppMeter(PluginCall call) {
        String url = call.getString("url", "https://yandex.ru/internet/");
        if (getActivity() == null) {
            call.reject("Activity is null");
            return;
        }
        getActivity().runOnUiThread(() -> {
            try {
                android.app.Dialog dialog = new android.app.Dialog(getActivity(), android.R.style.Theme_Black_NoTitleBar_Fullscreen);
                android.widget.LinearLayout layout = new android.widget.LinearLayout(getActivity());
                layout.setOrientation(android.widget.LinearLayout.VERTICAL);
                layout.setBackgroundColor(0xFF0F172A);

                // Верхняя панель управления
                android.widget.LinearLayout topBar = new android.widget.LinearLayout(getActivity());
                topBar.setOrientation(android.widget.LinearLayout.HORIZONTAL);
                topBar.setPadding(36, 32, 36, 32);
                topBar.setBackgroundColor(0xFF1E293B);

                android.widget.TextView title = new android.widget.TextView(getActivity());
                title.setText("Яндекс Интернетометр");
                title.setTextColor(0xFFFFFFFF);
                title.setTextSize(16);
                title.setTypeface(null, android.graphics.Typeface.BOLD);
                android.widget.LinearLayout.LayoutParams titleParams = new android.widget.LinearLayout.LayoutParams(0, android.widget.LinearLayout.LayoutParams.WRAP_CONTENT, 1.0f);
                topBar.addView(title, titleParams);

                android.widget.Button closeBtn = new android.widget.Button(getActivity());
                closeBtn.setText("✕ Закрыть");
                closeBtn.setTextColor(0xFF38BDF8);
                closeBtn.setBackgroundColor(0x00000000);
                closeBtn.setOnClickListener(v -> dialog.dismiss());
                topBar.addView(closeBtn);

                layout.addView(topBar);

                android.webkit.WebView webView = new android.webkit.WebView(getActivity());
                webView.getSettings().setJavaScriptEnabled(true);
                webView.getSettings().setDomStorageEnabled(true);
                webView.getSettings().setDatabaseEnabled(true);
                webView.getSettings().setCacheMode(android.webkit.WebSettings.LOAD_DEFAULT);
                webView.setWebViewClient(new android.webkit.WebViewClient());
                webView.loadUrl(url);

                android.widget.LinearLayout.LayoutParams webViewParams = new android.widget.LinearLayout.LayoutParams(
                    android.widget.LinearLayout.LayoutParams.MATCH_PARENT,
                    android.widget.LinearLayout.LayoutParams.MATCH_PARENT
                );
                layout.addView(webView, webViewParams);

                dialog.setContentView(layout);
                dialog.show();
                call.resolve();
            } catch (Exception e) {
                call.reject("Ошибка открытия Интернетометра: " + e.getMessage());
            }
        });
    }

    private JSObject wifiInfoToJson(WifiInfo info) {
        JSObject o = new JSObject();
        String ssid = info.getSSID();
        if (ssid == null || ssid.equals("<unknown ssid>") || ssid.equals("0x")) {
            ssid = "Неизвестная сеть";
        } else {
            ssid = ssid.replace("\"", "");
        }
        int rssi = info.getRssi();
        int freq = info.getFrequency();
        int channel = frequencyToChannel(freq);
        String band = bandFromFrequency(freq);

        o.put("ssid", ssid);
        o.put("bssid", info.getBSSID() == null ? "" : info.getBSSID());
        o.put("rssi", rssi);
        o.put("signalPercent", qualityPercent(rssi));
        o.put("frequency", freq);
        o.put("channel", channel);
        o.put("band", band);
        o.put("channelWidth", "20MHz");
        o.put("standard", standardFromWifiInfo(info));
        o.put("linkSpeedTxMbps", info.getLinkSpeed());
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            o.put("linkSpeedRxMbps", info.getRxLinkSpeedMbps());
        } else {
            o.put("linkSpeedRxMbps", info.getLinkSpeed());
        }
        o.put("noiseEstimateDbm", -95);
        o.put("snrDb", Math.max(1, rssi + 95));
        o.put("ipAddress", intToIp(info.getIpAddress()));
        return o;
    }

    private JSObject scanToJson(ScanResult scan, String currentBssid) {
        JSObject o = new JSObject();
        String ssid = scan.SSID == null || scan.SSID.isEmpty() ? "Скрытая сеть" : scan.SSID;
        int channel = frequencyToChannel(scan.frequency);
        String bssid = scan.BSSID == null ? "" : scan.BSSID;
        o.put("ssid", ssid);
        o.put("bssid", bssid);
        o.put("rssi", scan.level);
        o.put("frequency", scan.frequency);
        o.put("channel", channel);
        o.put("band", bandFromFrequency(scan.frequency));
        o.put("channelWidth", widthFromScan(scan));
        o.put("standard", standardFromScan(scan));
        o.put("isCurrent", bssid.equalsIgnoreCase(currentBssid));
        o.put("security", scan.capabilities != null ? scan.capabilities : "");
        return o;
    }

    private String widthFromScan(ScanResult scan) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            switch (scan.channelWidth) {
                case ScanResult.CHANNEL_WIDTH_40MHZ:
                    return "40MHz";
                case ScanResult.CHANNEL_WIDTH_80MHZ:
                    return "80MHz";
                case ScanResult.CHANNEL_WIDTH_160MHZ:
                    return "160MHz";
                default:
                    return "20MHz";
            }
        }
        return "20MHz";
    }

    private String standardFromScan(ScanResult scan) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            int std = scan.getWifiStandard();
            if (std == ScanResult.WIFI_STANDARD_11AX) return "802.11ax";
            if (std == ScanResult.WIFI_STANDARD_11AC) return "802.11ac";
            if (std == ScanResult.WIFI_STANDARD_11N) return "802.11n";
        }
        return scan.frequency >= 5000 ? "802.11ac" : "802.11n";
    }

    private String standardFromWifiInfo(WifiInfo info) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            int std = info.getWifiStandard();
            if (std == ScanResult.WIFI_STANDARD_11AX) return "802.11ax";
            if (std == ScanResult.WIFI_STANDARD_11AC) return "802.11ac";
            if (std == ScanResult.WIFI_STANDARD_11N) return "802.11n";
        }
        return info.getFrequency() >= 5000 ? "802.11ac" : "802.11n";
    }

    private int frequencyToChannel(int freq) {
        if (freq == 2484) return 14;
        if (freq >= 2412 && freq <= 2472) return ((freq - 2412) / 5) + 1;
        if (freq >= 5000 && freq <= 5900) return (freq - 5000) / 5;
        return 0;
    }

    private String bandFromFrequency(int freq) {
        if (freq >= 5925) return "6GHz";
        if (freq >= 4900) return "5GHz";
        return "2.4GHz";
    }

    private int qualityPercent(int rssi) {
        if (rssi <= -100) return 0;
        if (rssi >= -50) return 100;
        return 2 * (rssi + 100);
    }

    private String intToIp(int ip) {
        return String.format(
            Locale.US,
            "%d.%d.%d.%d",
            (ip & 0xff),
            (ip >> 8 & 0xff),
            (ip >> 16 & 0xff),
            (ip >> 24 & 0xff)
        );
    }
}
