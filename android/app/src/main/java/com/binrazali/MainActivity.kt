package com.binrazali

import android.os.Bundle
import androidx.fragment.app.FragmentFactory

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate


class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
     override fun getMainComponentName(): String = "Divino"
  override fun onCreate(savedInstanceState: Bundle?) {
    try {
      val clazz = Class.forName("com.swmansion.rnscreens.fragment.restoration.RNScreensFragmentFactory")
      val instance = clazz.getDeclaredConstructor().newInstance() as FragmentFactory
      supportFragmentManager.fragmentFactory = instance
    } catch (e: ClassNotFoundException) {
      // react-native-screens not available; continue without custom fragment factory
    }
    super.onCreate(savedInstanceState)
  }

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
