package com.cronometro.app;

import android.graphics.Color;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.view.WindowManager;

import androidx.appcompat.app.AlertDialog;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.getcapacitor.BridgeActivity;

import java.io.File;
import java.io.IOException;

public class MainActivity extends BridgeActivity {
	private static final String FULLSCREEN_NOTICE_MARKER = "fullscreen_notice_acknowledged";
	private boolean waitingForDisplaySettings;

	@Override
	public void onCreate(Bundle savedInstanceState) {
		registerPlugin(AndroidControlsPlugin.class);
		super.onCreate(savedInstanceState);

		WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
		getWindow().setStatusBarColor(Color.BLACK);
		getWindow().setNavigationBarColor(Color.BLACK);
		getWindow().getDecorView().setBackgroundColor(Color.BLACK);
		if (getBridge() != null && getBridge().getWebView() != null) {
			getBridge().getWebView().setBackgroundColor(Color.BLACK);
		}

		if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
			WindowManager.LayoutParams layoutParams = getWindow().getAttributes();
			layoutParams.layoutInDisplayCutoutMode =
				WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
			getWindow().setAttributes(layoutParams);
		}

		WindowInsetsControllerCompat insetsController =
			WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
		insetsController.setAppearanceLightStatusBars(false);
		insetsController.setAppearanceLightNavigationBars(false);
		showFullscreenNoticeIfNeeded();
	}

	@Override
	public void onResume() {
		super.onResume();
		if (waitingForDisplaySettings) {
			waitingForDisplaySettings = false;
			try {
				new File(getCacheDir(), FULLSCREEN_NOTICE_MARKER).createNewFile();
			} catch (IOException ignored) {
			}
		}
	}

	private void showFullscreenNoticeIfNeeded() {
		File marker = new File(getCacheDir(), FULLSCREEN_NOTICE_MARKER);
		if (marker.exists()) {
			return;
		}

		new AlertDialog.Builder(this)
			.setTitle("Consenti lo schermo intero")
			.setMessage("Apri Impostazioni > Schermo > App a schermo intero e abilita ChronoScreenOn. Tornando all'app, la richiesta non verrà ripetuta.")
			.setPositiveButton("Apri impostazioni", (dialog, which) -> {
				waitingForDisplaySettings = true;
				try {
					startActivity(new Intent(Settings.ACTION_DISPLAY_SETTINGS));
				} catch (ActivityNotFoundException exception) {
					waitingForDisplaySettings = false;
				}
			})
			.setNegativeButton("Più tardi", null)
			.setCancelable(false)
			.show();
	}
}
