package com.cronometro.app;

import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.WindowManager;

import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
	@Override
	public void onCreate(Bundle savedInstanceState) {
		WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
		getWindow().setStatusBarColor(Color.BLACK);
		getWindow().setNavigationBarColor(Color.BLACK);
		getWindow().getDecorView().setBackgroundColor(Color.BLACK);

		if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
			WindowManager.LayoutParams layoutParams = getWindow().getAttributes();
			layoutParams.layoutInDisplayCutoutMode =
				WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
			getWindow().setAttributes(layoutParams);
		}

		registerPlugin(AndroidControlsPlugin.class);
		super.onCreate(savedInstanceState);

		WindowInsetsControllerCompat insetsController =
			WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
		insetsController.setAppearanceLightStatusBars(false);
		insetsController.setAppearanceLightNavigationBars(false);
	}
}
