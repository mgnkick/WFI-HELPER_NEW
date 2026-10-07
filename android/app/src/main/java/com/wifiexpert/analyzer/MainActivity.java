package com.wifiexpert.analyzer;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(WifiHelperPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
