import { AndroidCodeFile } from '../types/wifi';

export const ANDROID_PROJECT_FILES: AndroidCodeFile[] = [
  {
    path: 'app/src/main/AndroidManifest.xml',
    name: 'AndroidManifest.xml',
    category: 'manifest',
    description: 'Полный манифест приложения со всеми разрешениями для Android 10, 11, 12, 13 и 14+, включая геолокацию и NEARBY_WIFI_DEVICES.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    package="ru.wifiexpert.diagnostic">

    <!-- Базовый доступ к сети и сокетам -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <!-- Доступ к состоянию Wi-Fi и запуск сканирования -->
    <uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
    <uses-permission android:name="android.permission.CHANGE_WIFI_STATE" />

    <!--
      ВАЖНО ДЛЯ ANDROID 10+ (API 29+):
      Google требует ACCESS_FINE_LOCATION для получения SSID/BSSID и результатов
      сканирования Wi-Fi сетей (ScanResults), так как MAC-адреса точек доступа
      могут использоваться для триангуляции местоположения устройства.
    -->
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

    <!--
      ДЛЯ ANDROID 13+ (API 33+):
      Новое разрешение для обнаружения близлежащих Wi-Fi устройств без геолокации,
      но с флагом neverForLocation если поддерживается.
    -->
    <uses-permission
        android:name="android.permission.NEARBY_WIFI_DEVICES"
        android:usesPermissionFlags="neverForLocation"
        tools:targetApi="s" />

    <application
        android:name=".WifiExpertApp"
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="Wi-Fi Эксперт"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.WifiExpert"
        android:usesCleartextTraffic="true"
        tools:targetApi="34">

        <activity
            android:name=".presentation.MainActivity"
            android:exported="true"
            android:theme="@style/Theme.WifiExpert"
            android:configChanges="orientation|screenSize|screenLayout|keyboardHidden">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Активити для встроенного Яндекс Интернетометра -->
        <activity
            android:name=".presentation.YandexInternetometerActivity"
            android:exported="false"
            android:label="Яндекс Интернетометр"
            android:theme="@style/Theme.WifiExpert" />
    </application>
</manifest>`
  },
  {
    path: 'app/build.gradle.kts',
    name: 'app/build.gradle.kts',
    category: 'gradle',
    description: 'Конфигурация сборки модуля app: Jetpack Compose, Coroutines, Custom Tabs, Material3, Serialization.',
    content: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
}

android {
    namespace = "ru.wifiexpert.diagnostic"
    compileSdk = 34

    defaultConfig {
        applicationId = "ru.wifiexpert.diagnostic"
        minSdk = 26 // Android 8.0 Oreo+
        targetSdk = 34 // Android 14
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
        debug {
            applicationIdSuffix = ".debug"
            isDebuggable = true
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        compose = true
    }

    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {
    // AndroidX & Jetpack Compose (BOM)
    val composeBom = platform("androidx.compose:compose-bom:2024.09.00")
    implementation(composeBom)
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")

    // Activity & Lifecycle
    implementation("androidx.activity:activity-compose:1.9.2")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.5")
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.8.5")

    // Kotlin Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.1")

    // Chrome Custom Tabs (для быстрого перехода на Яндекс Интернетометр)
    implementation("androidx.browser:browser:1.8.0")

    // DataStore (для хранения истории замеров)
    implementation("androidx.datastore:datastore-preferences:1.1.1")

    // JSON serialization
    implementation("com.google.code.gson:gson:2.11.0")

    debugImplementation("androidx.compose.ui:ui-tooling")
    debugImplementation("androidx.compose.ui:ui-test-manifest")
}`
  },
  {
    path: 'build.gradle.kts',
    name: 'build.gradle.kts (Root)',
    category: 'gradle',
    description: 'Корневой файл сборки проекта с плагинами Android и Kotlin.',
    content: `// Корневой файл сборки Wi-Fi Эксперт
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.compose) apply false
}`
  },
  {
    path: 'settings.gradle.kts',
    name: 'settings.gradle.kts',
    category: 'gradle',
    description: 'Репозитории зависимостей (Google, MavenCentral) и регистрация модуля :app.',
    content: `pluginManagement {
    repositories {
        google {
            content {
                includeGroupByRegex("com\\\\.android.*")
                includeGroupByRegex("com\\\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "WifiExpert"
include(":app")`
  },
  {
    path: 'gradle/libs.versions.toml',
    name: 'gradle/libs.versions.toml',
    category: 'gradle',
    description: 'Version Catalog с версиями Android Gradle Plugin 8.5+, Kotlin 2.0+ и Compose.',
    content: `[versions]
agp = "8.5.2"
kotlin = "2.0.20"
coreKtx = "1.13.1"

[libraries]
androidx-core-ktx = { group = "androidx.core", name = "core-ktx", version.ref = "coreKtx" }

[plugins]
android-application = { id = "com.android.application", version.ref = "agp" }
kotlin-android = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }
kotlin-compose = { id = "org.jetbrains.kotlin.plugin.compose", version.ref = "kotlin" }`
  },
  {
    path: 'app/src/main/java/ru/wifiexpert/diagnostic/data/manager/WifiMetricsManager.kt',
    name: 'WifiMetricsManager.kt',
    category: 'kotlin',
    description: 'Ключевой Kotlin-сервис получения данных Wi-Fi через WifiManager и NetworkCapabilities с детекцией VPN и разрешений Android 10-14+.',
    content: `package ru.wifiexpert.diagnostic.data.manager

import android.Manifest
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.location.LocationManager
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkCapabilities
import android.net.NetworkRequest
import android.net.wifi.ScanResult
import android.net.wifi.WifiInfo
import android.net.wifi.WifiManager
import android.os.Build
import androidx.core.content.ContextCompat
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import ru.wifiexpert.diagnostic.domain.model.AccessPointModel
import ru.wifiexpert.diagnostic.domain.model.VpnStatusModel
import ru.wifiexpert.diagnostic.domain.model.WifiMetricsModel
import java.net.NetworkInterface

/**
 * Сервис для сбора полной информации о Wi-Fi соединении и состоянии VPN.
 * Совместим с Android 10, 11, 12, 13 и 14+.
 */
class WifiMetricsManager(private val context: Context) {

    private val wifiManager = context.applicationContext.getSystemService(Context.WIFI_SERVICE) as WifiManager
    private val connectivityManager = context.applicationContext.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
    private val locationManager = context.applicationContext.getSystemService(Context.LOCATION_SERVICE) as LocationManager

    /**
     * Проверка обязательных разрешений.
     * На Android 10+ без ACCESS_FINE_LOCATION система вернет SSID "<unknown ssid>".
     */
    fun hasRequiredPermissions(): Boolean {
        val fineLocationGranted = ContextCompat.checkSelfPermission(
            context,
            Manifest.permission.ACCESS_FINE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED

        val nearbyGranted = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            ContextCompat.checkSelfPermission(
                context,
                Manifest.permission.NEARBY_WIFI_DEVICES
            ) == PackageManager.PERMISSION_GRANTED
        } else true

        return fineLocationGranted && nearbyGranted
    }

    /**
     * Проверка включенной службы геолокации (GPS).
     * В Android 10..14 даже при выданных разрешениях система скрывает SSID и результаты сканирования,
     * если тумблер "Местоположение" (GPS) в шторке Android выключен.
     */
    fun isLocationEnabled(): Boolean {
        return try {
            locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER) ||
                    locationManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER)
        } catch (e: Exception) {
            false
        }
    }

    /**
     * Детекция состояния VPN через NetworkCapabilities и сетевые интерфейсы.
     */
    fun checkVpnStatus(): VpnStatusModel {
        var isVpnActive = false
        var interfaceName: String? = null
        var vpnAppName: String? = null

        try {
            // Способ 1: Проверка через ConnectivityManager (Android 6.0+)
            val activeNetwork = connectivityManager.activeNetwork
            if (activeNetwork != null) {
                val caps = connectivityManager.getNetworkCapabilities(activeNetwork)
                if (caps != null) {
                    val hasVpnTransport = caps.hasTransport(NetworkCapabilities.TRANSPORT_VPN)
                    val isNotVpn = caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_NOT_VPN)
                    if (hasVpnTransport || !isNotVpn) {
                        isVpnActive = true
                    }
                }
            }

            // Способ 2: Проверка виртуальных сетевых интерфейсов (tun, tap, ppp, wg)
            val interfaces = NetworkInterface.getNetworkInterfaces()
            while (interfaces.hasMoreElements()) {
                val iface = interfaces.nextElement()
                if (iface.isUp && !iface.isLoopback) {
                    val name = iface.name.lowercase()
                    if (name.startsWith("tun") || name.startsWith("ppp") || name.startsWith("p2p") || name.startsWith("wg")) {
                        isVpnActive = true
                        interfaceName = iface.name
                        vpnAppName = when {
                            name.startsWith("wg") -> "WireGuard VPN"
                            name.startsWith("tun") -> "OpenVPN / WireGuard / Прокси туннель"
                            else -> "Активный VPN-клиент"
                        }
                        break
                    }
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }

        val warningNote = if (isVpnActive) {
            "ВНИМАНИЕ: Включен ВПН ($interfaceName)! Скорость и задержка ограничены удаленным сервером VPN и шифрованием, а не вашим интернет-провайдером!"
        } else {
            "VPN выключен. Трафик идет напрямую к вашему провайдеру без посторонних ограничений."
        }

        return VpnStatusModel(
            isActive = isVpnActive,
            interfaceName = interfaceName,
            vpnAppName = vpnAppName,
            warningNote = warningNote
        )
    }

    /**
     * Поток реактивного обновления метрик текущего Wi-Fi соединения в реальном времени.
     */
    fun observeCurrentWifiMetrics(): Flow<WifiMetricsModel?> = callbackFlow {
        val networkCallback = object : ConnectivityManager.NetworkCallback() {
            override fun onCapabilitiesChanged(network: Network, networkCapabilities: NetworkCapabilities) {
                if (networkCapabilities.hasTransport(NetworkCapabilities.TRANSPORT_WIFI)) {
                    val metrics = extractWifiMetrics(networkCapabilities)
                    trySend(metrics)
                }
            }

            override fun onLost(network: Network) {
                trySend(null)
            }
        }

        val request = NetworkRequest.Builder()
            .addTransportType(NetworkCapabilities.TRANSPORT_WIFI)
            .build()

        connectivityManager.registerNetworkCallback(request, networkCallback)

        // Первичный опрос текущего соединения
        val initialMetrics = getCurrentWifiMetrics()
        trySend(initialMetrics)

        awaitClose {
            connectivityManager.unregisterNetworkCallback(networkCallback)
        }
    }

    /**
     * Снятие актуальных метрик с WifiInfo и NetworkCapabilities.
     */
    fun getCurrentWifiMetrics(): WifiMetricsModel? {
        val activeNetwork = connectivityManager.activeNetwork ?: return null
        val caps = connectivityManager.getNetworkCapabilities(activeNetwork) ?: return null

        if (!caps.hasTransport(NetworkCapabilities.TRANSPORT_WIFI)) {
            return null
        }

        return extractWifiMetrics(caps)
    }

    private fun extractWifiMetrics(caps: NetworkCapabilities): WifiMetricsModel {
        val wifiInfo: WifiInfo? = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            caps.transportInfo as? WifiInfo
        } else {
            @Suppress("DEPRECATION")
            wifiManager.connectionInfo
        }

        val rawSsid = wifiInfo?.ssid ?: "<unknown ssid>"
        // Удаляем системные экранирующие кавычки, например "Keenetic_5G" -> Keenetic_5G
        val cleanSsid = if (rawSsid.startsWith("\"") && rawSsid.endsWith("\"") && rawSsid.length >= 2) {
            rawSsid.substring(1, rawSsid.length - 1)
        } else {
            rawSsid
        }

        val bssid = wifiInfo?.bssid ?: "00:00:00:00:00:00"
        val rssi = wifiInfo?.rssi ?: -127
        val frequency = wifiInfo?.frequency ?: 0
        val linkSpeedTx = wifiInfo?.linkSpeed ?: 0

        val linkSpeedRx = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            wifiInfo?.rxLinkSpeedMbps ?: linkSpeedTx
        } else {
            linkSpeedTx
        }

        // Определение диапазона (2.4 GHz, 5 GHz, 6 GHz)
        val band = when {
            frequency in 2400..2499 -> "2.4GHz"
            frequency in 5000..5899 -> "5GHz"
            frequency in 5925..7125 -> "6GHz (Wi-Fi 6E/7)"
            else -> "Неизвестно"
        }

        // Вычисление номера канала по частоте
        val channel = calculateChannelFromFrequency(frequency)

        // Стандарт поколения Wi-Fi
        val standard = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            when (wifiInfo?.wifiStandard) {
                WifiInfo.WIFI_STANDARD_11AX -> "Wi-Fi 6 (802.11ax)"
                WifiInfo.WIFI_STANDARD_11AC -> "Wi-Fi 5 (802.11ac)"
                WifiInfo.WIFI_STANDARD_11N  -> "Wi-Fi 4 (802.11n)"
                WifiInfo.WIFI_STANDARD_11BE -> "Wi-Fi 7 (802.11be)"
                else -> if (band == "5GHz") "802.11ac" else "802.11n"
            }
        } else {
            if (band == "5GHz") "802.11ac" else "802.11n"
        }

        // Пересчет RSSI (дБм) в проценты качества (0-100%)
        val qualityPercent = calculateQualityPercent(rssi)

        val vpnStatus = checkVpnStatus()

        // Получение IP-адресов шлюза и клиента
        val dhcpInfo = wifiManager.dhcpInfo
        val ipAddress = formatIp(dhcpInfo?.ipAddress ?: 0)
        val gateway = formatIp(dhcpInfo?.gateway ?: 0)
        val dns1 = formatIp(dhcpInfo?.dns1 ?: 0)
        val dns2 = formatIp(dhcpInfo?.dns2 ?: 0)

        return WifiMetricsModel(
            ssid = cleanSsid,
            bssid = bssid,
            rssi = rssi,
            signalPercent = qualityPercent,
            frequency = frequency,
            channel = channel,
            band = band,
            standard = standard,
            linkSpeedTxMbps = linkSpeedTx,
            linkSpeedRxMbps = linkSpeedRx,
            ipAddress = ipAddress,
            gateway = gateway,
            dnsServers = listOfNotNull(dns1.takeIf { it != "0.0.0.0" }, dns2.takeIf { it != "0.0.0.0" }),
            vpn = vpnStatus
        )
    }

    /**
     * Сканирование видимых соседних точек доступа (радиоэфира).
     */
    fun scanNeighborAccessPoints(onScanComplete: (List<AccessPointModel>) -> Unit) {
        if (!hasRequiredPermissions() || !isLocationEnabled()) {
            onScanComplete(emptyList())
            return
        }

        val receiver = object : BroadcastReceiver() {
            override fun onReceive(context: Context?, intent: Intent?) {
                context?.unregisterReceiver(this)
                val results: List<ScanResult> = try {
                    wifiManager.scanResults ?: emptyList()
                } catch (e: SecurityException) {
                    emptyList()
                }

                val apModels = results.map { scan ->
                    val cleanSsid = scan.SSID?.replace("\"", "") ?: "<Скрытая сеть>"
                    val band = when {
                        scan.frequency in 2400..2499 -> "2.4GHz"
                        scan.frequency in 5000..5899 -> "5GHz"
                        scan.frequency in 5925..7125 -> "6GHz"
                        else -> "Другая"
                    }
                    val ch = calculateChannelFromFrequency(scan.frequency)
                    AccessPointModel(
                        bssid = scan.BSSID ?: "00:00:00:00:00:00",
                        ssid = cleanSsid,
                        rssi = scan.level,
                        frequency = scan.frequency,
                        channel = ch,
                        band = band,
                        capabilities = scan.capabilities ?: ""
                    )
                }.sortedByDescending { it.rssi }

                onScanComplete(apModels)
            }
        }

        val intentFilter = IntentFilter(WifiManager.SCAN_RESULTS_AVAILABLE_ACTION)
        context.registerReceiver(receiver, intentFilter)

        @Suppress("DEPRECATION")
        wifiManager.startScan()
    }

    private fun calculateChannelFromFrequency(freq: Int): Int {
        return when {
            freq == 2484 -> 14
            freq in 2412..2472 -> (freq - 2407) / 5
            freq in 5170..5825 -> (freq - 5000) / 5
            freq in 5955..7115 -> (freq - 5950) / 5
            else -> 0
        }
    }

    private fun calculateQualityPercent(rssiDbm: Int): Int {
        return when {
            rssiDbm <= -100 -> 0
            rssiDbm >= -50 -> 100
            else -> 2 * (rssiDbm + 100)
        }.coerceIn(0, 100)
    }

    private fun formatIp(ip: Int): String {
        return String.format(
            "%d.%d.%d.%d",
            ip and 0xff,
            ip shr 8 and 0xff,
            ip shr 16 and 0xff,
            ip shr 24 and 0xff
        )
    }
}`
  },
  {
    path: 'app/src/main/java/ru/wifiexpert/diagnostic/presentation/YandexInternetometerActivity.kt',
    name: 'YandexInternetometerActivity.kt',
    category: 'kotlin',
    description: 'Интеграция с сервисом «Яндекс Интернетометр» (yandex.ru/internet) через WebView с поддержкой сохранения истории замеров.',
    content: `package ru.wifiexpert.diagnostic.presentation

import android.annotation.SuppressLint
import android.content.Context
import android.os.Bundle
import android.view.ViewGroup
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Save
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import kotlinx.coroutines.launch
import ru.wifiexpert.diagnostic.data.repository.SpeedTestHistoryRepository
import ru.wifiexpert.diagnostic.domain.model.SpeedTestRecord
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class YandexInternetometerActivity : ComponentActivity() {

    private lateinit var historyRepository: SpeedTestHistoryRepository

    @OptIn(ExperimentalMaterial3Api::class)
    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        historyRepository = SpeedTestHistoryRepository(this)

        setContent {
            val scope = rememberCoroutineScope()
            var currentUrl by remember { mutableStateOf("https://yandex.ru/internet") }
            var webProgress by remember { mutableIntStateOf(0) }
            var isSavedDialogVisible by remember { mutableStateOf(false) }

            Scaffold(
                topBar = {
                    TopAppBar(
                        title = {
                            Column {
                                Text(
                                    text = "Яндекс Интернетометр",
                                    style = MaterialTheme.typography.titleMedium,
                                    color = Color.White
                                )
                                Text(
                                    text = "yandex.ru/internet (Официальный тест скорости РФ)",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = Color(0xFF00F2FE)
                                )
                            }
                        },
                        navigationIcon = {
                            IconButton(onClick = { finish() }) {
                                Icon(
                                    Icons.AutoMirrored.Filled.ArrowBack,
                                    contentDescription = "Назад",
                                    tint = Color.White
                                )
                            }
                        },
                        actions = {
                            IconButton(onClick = {
                                // Сохранение замера в историю
                                scope.launch {
                                    val now = SimpleDateFormat("dd.MM.yyyy HH:mm", Locale.getDefault()).format(Date())
                                    val record = SpeedTestRecord(
                                        id = System.currentTimeMillis().toString(),
                                        timestamp = now,
                                        source = "Яндекс Интернетометр",
                                        downloadMbps = 0.0, // пользователь может дополнить или сохранить факт визита
                                        uploadMbps = 0.0,
                                        pingMs = 0.0,
                                        note = "Замер проведен на yandex.ru/internet"
                                    )
                                    historyRepository.saveRecord(record)
                                    Toast.makeText(this@YandexInternetometerActivity, "Замер сохранен в историю!", Toast.LENGTH_SHORT).show()
                                }
                            }) {
                                Icon(Icons.Default.Save, contentDescription = "Сохранить замер", tint = Color(0xFF00F2FE))
                            }
                        },
                        colors = TopAppBarDefaults.topAppBarColors(containerColor = Color(0xFF0B0E17))
                    )
                }
            ) { innerPadding ->
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(innerPadding)
                        .background(Color(0xFF0B0E17))
                ) {
                    if (webProgress in 1..99) {
                        LinearProgressIndicator(
                            progress = { webProgress / 100f },
                            modifier = Modifier.fillMaxWidth(),
                            color = Color(0xFF00F2FE),
                            trackColor = Color(0xFF141824)
                        )
                    }

                    AndroidView(
                        factory = { ctx ->
                            WebView(ctx).apply {
                                layoutParams = ViewGroup.LayoutParams(
                                    ViewGroup.LayoutParams.MATCH_PARENT,
                                    ViewGroup.LayoutParams.MATCH_PARENT
                                )
                                settings.javaScriptEnabled = true
                                settings.domStorageEnabled = true
                                settings.cacheMode = WebSettings.LOAD_DEFAULT
                                settings.userAgentString = "Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 Chrome/128.0 Mobile Safari/537.36"

                                webChromeClient = object : WebChromeClient() {
                                    override fun onProgressChanged(view: WebView?, newProgress: Int) {
                                        webProgress = newProgress
                                    }
                                }

                                webViewClient = object : WebViewClient() {
                                    override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean {
                                        return false
                                    }
                                }

                                loadUrl(currentUrl)
                            }
                        },
                        modifier = Modifier.weight(1f)
                    )
                }
            }
        }
    }
}`
  },
  {
    path: 'app/src/main/java/ru/wifiexpert/diagnostic/presentation/ui/SpeedGaugeView.kt',
    name: 'SpeedGaugeView.kt',
    category: 'kotlin',
    description: 'Jetpack Compose компонент аналогового кругового спидометра (неоновые деления, светящаяся стрелка, анимация).',
    content: `package ru.wifiexpert.diagnostic.presentation.ui

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.*
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlin.math.cos
import kotlin.math.sin

/**
 * Неоновый круговой спидометр с плавной анимацией стрелки.
 */
@Composable
fun SpeedGaugeView(
    currentSpeedMbps: Float,
    maxScaleMbps: Float = 500f,
    testStateLabel: String = "СКАЧИВАНИЕ",
    modifier: Modifier = Modifier
) {
    val animatedSpeed by animateFloatAsState(
        targetValue = currentSpeedMbps.coerceIn(0f, maxScaleMbps),
        animationSpec = tween(durationMillis = 250),
        label = "SpeedGaugeAnimation"
    )

    val progress = (animatedSpeed / maxScaleMbps).coerceIn(0f, 1f)
    val startAngle = 135f
    val sweepTotal = 270f
    val activeSweep = progress * sweepTotal

    Box(
        modifier = modifier
            .fillMaxWidth()
            .height(280.dp),
        contentAlignment = Alignment.Center
    ) {
        Canvas(modifier = Modifier.size(240.dp)) {
            val strokeWidth = 14.dp.toPx()
            val diameter = size.minDimension - strokeWidth
            val topLeft = Offset(strokeWidth / 2, strokeWidth / 2)
            val arcSize = Size(diameter, diameter)

            // Фоновая темная дуга
            drawArc(
                color = Color(0xFF161C2C),
                startAngle = startAngle,
                sweepAngle = sweepTotal,
                useCenter = false,
                topLeft = topLeft,
                size = arcSize,
                style = Stroke(width = strokeWidth, cap = StrokeCap.Round)
            )

            // Активная светящаяся градиентная дуга (циан -> неоновый фиолетовый)
            val neonGradient = Brush.sweepGradient(
                colors = listOf(
                    Color(0xFF00F2FE),
                    Color(0xFF4FACFE),
                    Color(0xFF7000FF),
                    Color(0xFF00F2FE)
                ),
                center = center
            )

            if (activeSweep > 0f) {
                drawArc(
                    brush = neonGradient,
                    startAngle = startAngle,
                    sweepAngle = activeSweep,
                    useCenter = false,
                    topLeft = topLeft,
                    size = arcSize,
                    style = Stroke(width = strokeWidth, cap = StrokeCap.Round)
                )
            }

            // Рисуем деления спидометра
            val tickCount = 18
            val radius = diameter / 2
            val centerOffset = center

            for (i in 0..tickCount) {
                val fraction = i.toFloat() / tickCount
                val angleDeg = startAngle + fraction * sweepTotal
                val angleRad = Math.toRadians(angleDeg.toDouble())

                val tickLen = if (i % 3 == 0) 14.dp.toPx() else 8.dp.toPx()
                val innerR = radius - strokeWidth - tickLen
                val outerR = radius - strokeWidth - 2.dp.toPx()

                val p1 = Offset(
                    (centerOffset.x + innerR * cos(angleRad)).toFloat(),
                    (centerOffset.y + innerR * sin(angleRad)).toFloat()
                )
                val p2 = Offset(
                    (centerOffset.x + outerR * cos(angleRad)).toFloat(),
                    (centerOffset.y + outerR * sin(angleRad)).toFloat()
                )

                val isPassed = fraction <= progress
                val tickColor = if (isPassed) Color(0xFF00F2FE) else Color(0xFF26324A)
                drawLine(
                    color = tickColor,
                    start = p1,
                    end = p2,
                    strokeWidth = if (i % 3 == 0) 3.dp.toPx() else 1.5.dp.toPx(),
                    cap = StrokeCap.Round
                )
            }
        }

        // Центральные цифровые показатели
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Text(
                text = testStateLabel.uppercase(),
                color = Color(0xFF8A99AD),
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 1.5.sp
            )

            Spacer(modifier = Modifier.height(4.dp))

            Text(
                text = String.format(java.util.Locale.US, "%.1f", animatedSpeed),
                color = Color.White,
                fontSize = 46.sp,
                fontWeight = FontWeight.ExtraBold
            )

            Text(
                text = "Мбит/с",
                color = Color(0xFF00F2FE),
                fontSize = 13.sp,
                fontWeight = FontWeight.SemiBold
            )
        }
    }
}`
  },
  {
    path: '.github/workflows/build_apk.yml',
    name: '.github/workflows/build_apk.yml',
    category: 'ci',
    description: 'Готовый GitHub Actions workflow для автоматической сборки и скачивания .APK прямо из облака GitHub без установки Android Studio.',
    content: `name: Build Wi-Fi Expert APK

on:
  push:
    branches: [ "main", "master" ]
  workflow_dispatch: # Позволяет запускать сборку вручную кнопкой "Run workflow" в 1 клик

jobs:
  build:
    name: Compile Android Debug APK
    runs-on: ubuntu-latest

    steps:
      - name: 1. Клонирование репозитория
        uses: actions/checkout@v4

      - name: 2. Настройка среды Java 17
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'

      - name: 3. Настройка Android SDK
        uses: android-actions/setup-android@v3

      - name: 4. Выдача прав на запуск Gradle Wrapper
        run: chmod +x gradlew || gradle wrapper

      - name: 5. Компиляция Debug APK
        run: ./gradlew assembleDebug --stacktrace

      - name: 6. Загрузка готового APK в артефакты GitHub
        uses: actions/upload-artifact@v4
        with:
          name: wifi-expert-debug-apk
          path: app/build/outputs/apk/debug/*.apk
          retention-days: 30`
  },
  {
    path: 'build_standalone.sh',
    name: 'build_standalone.sh (Linux/macOS)',
    category: 'scripts',
    description: 'Автономный bash-скрипт локальной сборки в 1 клик для Linux и macOS.',
    content: `#!/usr/bin/env bash
# ====================================================================
# Wi-Fi Expert: Скрипт автономной компиляции .APK (Linux / macOS)
# ====================================================================
set -e

echo "=== [1/4] Проверка окружения Java ==="
if ! command -v java &> /dev/null; then
    echo "ОШИБКА: Java не установлена! Установите OpenJDK 17:"
    echo "  Ubuntu/Debian: sudo apt install openjdk-17-jdk"
    echo "  macOS: brew install openjdk@17"
    exit 1
fi

JAVA_VER=$(java -version 2>&1 | head -n 1)
echo "Обнаружена: $JAVA_VER"

echo "=== [2/4] Подготовка Gradle Wrapper ==="
chmod +x ./gradlew 2>/dev/null || gradle wrapper

echo "=== [3/4] Компиляция проекта (./gradlew assembleDebug) ==="
./gradlew assembleDebug --no-daemon

APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
if [ -f "$APK_PATH" ]; then
    cp "$APK_PATH" ./wifi-expert-debug.apk
    echo "=========================================================="
    echo "УСПЕХ! Готовый .APK скопирован в корень проекта:"
    echo "  -> $(pwd)/wifi-expert-debug.apk"
    echo "Установите его на телефон командой: adb install -r wifi-expert-debug.apk"
    echo "=========================================================="
else
    echo "Ошибка: APK файл не найден по пути $APK_PATH"
    exit 1
fi`
  },
  {
    path: 'build_standalone.ps1',
    name: 'build_standalone.ps1 (Windows)',
    category: 'scripts',
    description: 'Автономный PowerShell-скрипт локальной сборки в 1 клик для Windows 10/11.',
    content: `# ====================================================================
# Wi-Fi Expert: Скрипт автономной компиляции .APK для Windows PowerShell
# ====================================================================
$ErrorActionPreference = "Stop"

Write-Host "=== [1/4] Проверка установленной Java ===" -ForegroundColor Cyan
try {
    $javaVer = java -version 2>&1 | Select-Object -First 1
    Write-Host "Обнаружена Java: $javaVer" -ForegroundColor Green
} catch {
    Write-Host "ОШИБКА: Java не найдена в PATH! Установите JDK 17 (например, Eclipse Temurin 17):" -ForegroundColor Red
    Write-Host "https://adoptium.net/temurin/releases/?version=17" -ForegroundColor Yellow
    Exit 1
}

Write-Host "=== [2/4] Запуск компиляции Gradle assembleDebug ===" -ForegroundColor Cyan
if (Test-Path ".\gradlew.bat") {
    .\gradlew.bat assembleDebug --no-daemon
} else {
    gradle assembleDebug --no-daemon
}

$apkPath = "app\build\outputs\apk\debug\app-debug.apk"
if (Test-Path $apkPath) {
    Copy-Item $apkPath -Destination ".\wifi-expert-debug.apk" -Force
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host "УСПЕХ! Готовый .APK скопирован в корень папки:" -ForegroundColor Green
    Write-Host "  -> $(Get-Location)\wifi-expert-debug.apk" -ForegroundColor Yellow
    Write-Host "Передайте этот файл на Android-телефон и установите!" -ForegroundColor Green
    Write-Host "==========================================================" -ForegroundColor Green
} else {
    Write-Host "Ошибка: Файл APK не обнаружен в $apkPath" -ForegroundColor Red
    Exit 1
}`
  }
];
